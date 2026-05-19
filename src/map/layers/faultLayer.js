import L from "leaflet";
import * as turf from "@turf/turf";

// Fault GeoJSON Reference
let faultGeoJSON = null;

// Fault Layer
export let faultLayer = null;

// User-controlled visibility
export let faultLayerEnabled = true;

// Active Distance Line
let activeDistanceLine = null;

/*
=====================
Manual Toggle Control
=====================
*/
export function setFaultLayerVisibility(
  map,
  enabled
) {
  faultLayerEnabled = enabled;
  updateFaultVisibility(map);
}

/*
=====================
Load Fault Layer
=====================
*/
export async function loadFaultLayer(map) {
  try {
    const response = await fetch(
      "/data/fault_Lines.geojson"
    );

    faultGeoJSON =
      await response.json();

    // Create layer
    faultLayer = L.geoJSON(
      faultGeoJSON,
      {
        style: {
          color: "#ff6b6b",
          weight: 1.5,
          opacity: 0.8,
        },
        pane: "overlayPane",
      }
    );

    console.log(
      "Fault layer loaded"
    );

    // Initial visibility
    updateFaultVisibility(map);

    // Zoom-based visibility
    map.on("zoomend", () => {
      updateFaultVisibility(map);
    });

    // IMPORTANT: return after event registration
    return faultLayer;
  } catch (error) {
    console.error(
      "Fault layer failed:",
      error
    );
  }
}

/*
=====================
Visibility Logic
=====================
Show only when:
1. User enabled
2. Zoom >= 4
=====================
*/
function updateFaultVisibility(
  map
) {
  if (!faultLayer) return;

  const currentZoom =
    map.getZoom();

  const shouldShow =
    faultLayerEnabled &&
    currentZoom >= 4;

  if (shouldShow) {
    if (!map.hasLayer(faultLayer)) {
      faultLayer.addTo(map);
    }
  } else {
    if (map.hasLayer(faultLayer)) {
      map.removeLayer(
        faultLayer
      );
    }
  }
}

/*
=====================
Nearest Fault Analysis
=====================
*/
export function getNearestFault(
  map,
  lat,
  lng
) {
  if (!faultGeoJSON) {
    return null;
  }

  try {
    if (activeDistanceLine) {
      map.removeLayer(
        activeDistanceLine
      );
    }

    const clickedPoint =
      turf.point([lng, lat]);

    let nearestFault = null;
    let minimumDistance =
      Infinity;
    let nearestPoint = null;

    faultGeoJSON.features.forEach(
      (feature) => {
        const geometryType =
          feature.geometry.type;

        if (
          geometryType ===
          "LineString"
        ) {
          processLine(
            feature
          );
        } else if (
          geometryType ===
          "MultiLineString"
        ) {
          const flattened =
            turf.flatten(
              feature
            );

          flattened.features.forEach(
            (
              lineFeature
            ) => {
              processLine(
                lineFeature,
                feature
              );
            }
          );
        }
      }
    );

    if (
      !nearestFault ||
      !nearestPoint
    ) {
      return null;
    }

    activeDistanceLine =
      L.polyline(
        [
          [lat, lng],
          [
            nearestPoint
              .geometry
              .coordinates[1],
            nearestPoint
              .geometry
              .coordinates[0],
          ],
        ],
        {
          color: "#ff4d4f",
          weight: 2,
          dashArray: "8 8",
          opacity: 0.9,
          pane: "overlayPane",
          className:
            "fault-distance-line",
        }
      );

    activeDistanceLine.addTo(
      map
    );

    const faultName =
      nearestFault
        .properties?.name ||
      nearestFault
        .properties?.NAME ||
      "Unknown Fault";

    return {
      name: faultName,
      distance:
        minimumDistance,
    };

    function processLine(
      lineFeature,
      originalFeature = lineFeature
    ) {
      const distance =
        turf.pointToLineDistance(
          clickedPoint,
          lineFeature,
          {
            units:
              "kilometers",
          }
        );

      if (
        distance <
        minimumDistance
      ) {
        minimumDistance =
          distance;

        nearestFault =
          originalFeature;

        nearestPoint =
          turf.nearestPointOnLine(
            lineFeature,
            clickedPoint,
            {
              units:
                "kilometers",
            }
          );
      }
    }
  } catch (error) {
    console.error(
      "Nearest fault failed:",
      error
    );

    return null;
  }
}