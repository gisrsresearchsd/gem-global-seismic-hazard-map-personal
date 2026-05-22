import L from "leaflet";

/* Create scale control */
export function createScaleControl(map) {
  const scaleControl = L.control.scale({
    position: "bottomleft",
    metric: true,
    imperial: false,
  });

  scaleControl.addTo(map);

  return scaleControl;
}
