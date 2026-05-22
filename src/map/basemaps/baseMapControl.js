import L from "leaflet";
import { BASE_MAPS } from "./baseMaps";
import { basemapManager } from "./basemapManager";

/* Restore overlay layers */
function restoreOverlayLayers(map, activeOverlayLayers) {
  activeOverlayLayers.forEach((layer) => {
    if (!map.hasLayer(layer)) {
      layer.addTo(map);
    }

    if (layer.bringToFront) {
      layer.bringToFront();
    }
  });
}

/* Create custom base map control */
export function createBaseMapControl(map, activeOverlayLayers = []) {
  const baseMapControl = L.control({
    position: "topright",
  });

  baseMapControl.onAdd = function () {
    const container = L.DomUtil.create("div", "custom-basemap-control");

    L.DomEvent.disableClickPropagation(container);

    /* Initialize manager */
    basemapManager.initialize(map, activeOverlayLayers);

    basemapManager.setBasemapContainer(container);

    Object.keys(BASE_MAPS).forEach((baseMapName) => {
      const button = L.DomUtil.create("button", "basemap-btn", container);

      button.textContent = baseMapName;

      button.dataset.basemap = baseMapName;

      if (baseMapName === "Light") {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        basemapManager.setCurrentBasemap(baseMapName);

        restoreOverlayLayers(map, activeOverlayLayers);
      });
    });

    return container;
  };

  baseMapControl.addTo(map);

  return baseMapControl;
}
