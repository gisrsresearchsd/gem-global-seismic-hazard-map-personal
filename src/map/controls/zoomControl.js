import L from "leaflet";

/* Create zoom control */
export function createZoomControl(map) {
  const zoomWrapper = L.DomUtil.create("div", "zoom-wrapper");

  const zoomControl = L.control.zoom({
    position: "topleft",
  });

  const originalOnAdd = zoomControl.onAdd;

  zoomControl.onAdd = function (leafletMap) {
    const container = originalOnAdd.call(this, leafletMap);

    zoomWrapper.appendChild(container);

    return zoomWrapper;
  };

  zoomControl.addTo(map);

  return zoomControl;
}
