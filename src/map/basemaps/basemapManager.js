import L from "leaflet";
import { BASE_MAPS } from "./baseMaps";

/* Singleton basemap manager */
class BasemapManager {
  constructor() {
    this.currentBaseLayer =
      BASE_MAPS.Light;

    this.map = null;
    this.activeOverlayLayers =
      [];
    this.basemapContainer =
      null;
  }

  initialize(
    map,
    overlayLayers = [],
  ) {
    this.map = map;
    this.activeOverlayLayers =
      overlayLayers;

    if (
      !this.map.hasLayer(
        this.currentBaseLayer,
      )
    ) {
      this.currentBaseLayer.addTo(
        map,
      );
    }
  }

  setCurrentBasemap(
    baseMapName,
    updateButtons = true,
  ) {
    if (!this.map) {
      return;
    }

    const nextBaseLayer =
      BASE_MAPS[
        baseMapName
      ];

    if (!nextBaseLayer) {
      return;
    }

    if (
      this.currentBaseLayer &&
      this.map.hasLayer(
        this.currentBaseLayer,
      )
    ) {
      this.map.removeLayer(
        this.currentBaseLayer,
      );
    }

    this.currentBaseLayer =
      nextBaseLayer;

    this.currentBaseLayer.addTo(
      this.map,
    );

    this.activeOverlayLayers.forEach(
      (layer) => {
        if (
          !this.map.hasLayer(
            layer,
          )
        ) {
          layer.addTo(
            this.map,
          );
        }

        if (
          layer.bringToFront
        ) {
          layer.bringToFront();
        }
      },
    );

    if (
      updateButtons &&
      this.basemapContainer
    ) {
      const buttons =
        this.basemapContainer.querySelectorAll(
          ".basemap-btn",
        );

      buttons.forEach(
        (btn) => {
          btn.classList.toggle(
            "active",
            btn.dataset
              .basemap ===
              baseMapName,
          );
        },
      );
    }
  }

  resetToDefault() {
    this.setCurrentBasemap(
      "Light",
      true,
    );
  }

  setBasemapContainer(
    container,
  ) {
    this.basemapContainer =
      container;
  }

  getCurrentBasemap() {
    return this.currentBaseLayer;
  }
}

/* Export singleton */
export const basemapManager =
  new BasemapManager();