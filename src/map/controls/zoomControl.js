import L from 'leaflet';

// Create Zoom Control

export function createZoomControl(map) {

  L.control.zoom({
    position: 'topleft',
  }).addTo(map);
}