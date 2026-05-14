import L from "leaflet";

import * as turf from "@turf/turf";

// Fault GeoJSON Reference

let faultGeoJSON = null;

// Fault Layer

export let faultLayer = null;
// Active Distance Line

let activeDistanceLine = null;

// Load Fault Layer

export async function loadFaultLayer(map) {
  try {
    // Load GeoJSON

    const response = await fetch("/data/fault_Lines.geojson");

    faultGeoJSON = await response.json();

    // Create Layer

    faultLayer = L.geoJSON(faultGeoJSON, {
      style: {
        color: "#ff6b6b",

        weight: 1.5,

        opacity: 0.8,
      },

      pane: "overlayPane",
    });

    // Add to Map

    console.log("Fault layer loaded");
    // Initial Visibility

    updateFaultVisibility(map);

    // Zoom Event

    map.on("zoomend", () => {
      updateFaultVisibility(map);
    });
  } catch (error) {
    console.error("Fault layer failed:", error);
  }
}

// Update Fault Visibility

function updateFaultVisibility(map) {
  const currentZoom = map.getZoom();

  // Show at Zoom >= 4

  if (currentZoom >= 4) {
    if (!map.hasLayer(faultLayer)) {
      faultLayer.addTo(map);
    }
  }

  // Hide Below 4
  else {
    if (map.hasLayer(faultLayer)) {
      map.removeLayer(faultLayer);
    }
  }
}

// Find Nearest Fault

export function getNearestFault(map, lat, lng) {
  if (!faultGeoJSON) {
    return null;
  }

  try {
    // Remove Previous Line

    if (activeDistanceLine) {
      map.removeLayer(activeDistanceLine);
    }

    // Click Point

    const clickedPoint = turf.point([lng, lat]);

    let nearestFault = null;

    let minimumDistance = Infinity;

    let nearestPoint = null;

    // Loop Features

    faultGeoJSON.features.forEach((feature) => {
      const geometryType = feature.geometry.type;

      // LineString

      if (geometryType === "LineString") {
        processLine(feature);
      }

      // MultiLineString
      else if (geometryType === "MultiLineString") {
        const flattened = turf.flatten(feature);

        flattened.features.forEach((lineFeature) => {
          processLine(lineFeature, feature);
        });
      }
    });

    // No Result

    if (!nearestFault || !nearestPoint) {
      return null;
    }

    // Create Animated Line

    activeDistanceLine = L.polyline(
      [
        [lat, lng],

        [
          nearestPoint.geometry.coordinates[1],

          nearestPoint.geometry.coordinates[0],
        ],
      ],
      {
        color: "#ff4d4f",

        weight: 2,

        dashArray: "8 8",

        opacity: 0.9,

        pane: "overlayPane",

        className: "fault-distance-line",
      },
    );

    activeDistanceLine.addTo(map);

    // Fault Name

    const faultName =
      nearestFault.properties?.name ||
      nearestFault.properties?.NAME ||
      "Unknown Fault";

    return {
      name: faultName,

      distance: minimumDistance,
    };

    // Process Line Helper

    function processLine(lineFeature, originalFeature = lineFeature) {
      const distance = turf.pointToLineDistance(clickedPoint, lineFeature, {
        units: "kilometers",
      });

      // Better Match

      if (distance < minimumDistance) {
        minimumDistance = distance;

        nearestFault = originalFeature;

        nearestPoint = turf.nearestPointOnLine(lineFeature, clickedPoint, {
          units: "kilometers",
        });
      }
    }
  } catch (error) {
    console.error("Nearest fault failed:", error);

    return null;
  }
}
