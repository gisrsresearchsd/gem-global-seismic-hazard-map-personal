import L from "leaflet";

let activeMarker = null;
let activePulseMarker = null;

/* Clear markers */
export function clearLocationMarker(map) {
  if (activeMarker) {
    map.removeLayer(activeMarker);
    activeMarker = null;
  }

  if (activePulseMarker) {
    map.removeLayer(activePulseMarker);
    activePulseMarker = null;
  }
}

/* Create marker */
export function createLocationMarker(
  map,
  lat,
  lng
) {
  clearLocationMarker(map);

  const marker = L.circleMarker(
    [lat, lng],
    {
      radius: 10,
      color: "#ffffff",
      weight: 3,
      fillColor: "#0066b3",
      fillOpacity: 0.9,
      pane: "overlayPane",
    }
  );

  const pulseMarker =
    L.circleMarker(
      [lat, lng],
      {
        radius: 20,
        color: "#0066b3",
        weight: 2,
        fillColor: "#0066b3",
        fillOpacity: 0.2,
        pane: "overlayPane",
      }
    );

  marker.addTo(map);
  pulseMarker.addTo(map);

  setTimeout(() => {
    if (
      activePulseMarker ===
      pulseMarker
    ) {
      map.removeLayer(
        pulseMarker
      );
      activePulseMarker =
        null;
    }
  }, 1000);

  activeMarker = marker;
  activePulseMarker =
    pulseMarker;

  return marker;
}