import L from 'leaflet';

// Create Scale Control

export function createScaleControl(map) {

  L.control.scale({
    position: 'bottomleft',

    metric: true,

    imperial: false,
  }).addTo(map);
}