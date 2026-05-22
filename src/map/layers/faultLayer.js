import L from "leaflet";
import * as turf from "@turf/turf";

/* Constants */
const MIN_FAULT_ZOOM = 4;

/* Fault GeoJSON reference */
let faultGeoJSON = null;

/* Fault layer */
export let faultLayer = null;

/* User-controlled visibility */
export let faultLayerEnabled = true;

/* Active distance line */
let activeDistanceLine = null;

/* Toggle fault layer visibility */
export function setFaultLayerVisibility(map, enabled) {
  faultLayerEnabled = enabled;
  updateFaultVisibility(map);
}

/* Load fault layer */
export async function loadFaultLayer(map) {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/fault_Lines.geojson`,
    );

    faultGeoJSON = await response.json();

    faultLayer = L.geoJSON(faultGeoJSON, {
      style: {
        color: "#ff6b6b",
        weight: 1.5,
        opacity: 0.8,
      },
      pane: "overlayPane",
    });

    updateFaultVisibility(map);

    map.on("zoomend", () => {
      updateFaultVisibility(map);
    });

    return faultLayer;
  } catch (error) {
    console.error("Fault layer failed:", error);

    return null;
  }
}

/* Show/hide based on zoom + user toggle */
function updateFaultVisibility(map) {
  if (!faultLayer) {
    return;
  }

  const currentZoom = map.getZoom();

  const shouldShow = faultLayerEnabled && currentZoom >= MIN_FAULT_ZOOM;

  if (shouldShow) {
    if (!map.hasLayer(faultLayer)) {
      faultLayer.addTo(map);
    }
    return;
  }

  if (map.hasLayer(faultLayer)) {
    map.removeLayer(faultLayer);
  }
}

/* Clear active distance line */
export function clearFaultDistanceLine(
  map
) {
  if (
    !activeDistanceLine
  ) {
    return;
  }

  if (
    map.hasLayer(
      activeDistanceLine
    )
  ) {
    map.removeLayer(
      activeDistanceLine
    );
  }

  activeDistanceLine =
    null;
}

/* Clear active distance line */
function clearDistanceLine(map) {
  if (!activeDistanceLine) {
    return;
  }

  map.removeLayer(activeDistanceLine);

  activeDistanceLine = null;
}

/* Process single fault line */
function processFaultLine({
  lineFeature,
  originalFeature,
  clickedPoint,
  currentMinimumDistance,
}) {
  const distance = turf.pointToLineDistance(clickedPoint, lineFeature, {
    units: "kilometers",
  });

  if (distance >= currentMinimumDistance) {
    return null;
  }

  const nearestPoint = turf.nearestPointOnLine(lineFeature, clickedPoint, {
    units: "kilometers",
  });

  return {
    distance,
    nearestPoint,
    fault: originalFeature || lineFeature,
  };
}

/* Find nearest fault */
export function getNearestFault(map, lat, lng) {
  if (!faultGeoJSON?.features?.length) {
    return null;
  }

  try {
    clearDistanceLine(map);

    const clickedPoint = turf.point([lng, lat]);

    let nearestFault = null;
    let minimumDistance = Infinity;
    let nearestPoint = null;

    faultGeoJSON.features.forEach((feature) => {
      const geometryType = feature.geometry?.type;

      if (geometryType === "LineString") {
        const result = processFaultLine({
          lineFeature: feature,
          originalFeature: feature,
          clickedPoint,
          currentMinimumDistance: minimumDistance,
        });

        if (result) {
          minimumDistance = result.distance;
          nearestPoint = result.nearestPoint;
          nearestFault = result.fault;
        }
      }

      if (geometryType === "MultiLineString") {
        const flattened = turf.flatten(feature);

        flattened.features.forEach((lineFeature) => {
          const result = processFaultLine({
            lineFeature,
            originalFeature: feature,
            clickedPoint,
            currentMinimumDistance: minimumDistance,
          });

          if (result) {
            minimumDistance = result.distance;
            nearestPoint = result.nearestPoint;
            nearestFault = result.fault;
          }
        });
      }
    });

    if (!nearestFault || !nearestPoint) {
      return null;
    }

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

    const faultName =
      nearestFault.properties?.name ||
      nearestFault.properties?.NAME ||
      "Unknown Fault";

    return {
      name: faultName,
      distance: minimumDistance,
    };
  } catch (error) {
    console.error("Nearest fault failed:", error);

    return null;
  }
}
