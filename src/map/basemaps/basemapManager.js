import L from 'leaflet';
import { BASE_MAPS } from './baseMaps';

// Singleton pattern to manage basemap state
class BasemapManager {
  constructor() {
    this.currentBaseLayer = BASE_MAPS.Light;
    this.map = null;
    this.activeOverlayLayers = [];
    this.basemapContainer = null;
  }

  initialize(map, overlayLayers = []) {
    this.map = map;
    this.activeOverlayLayers = overlayLayers;
    this.currentBaseLayer.addTo(map);
  }

  setCurrentBasemap(baseMapName, updateButtons = true) {
    if (!this.map) return;

    // Remove current basemap
    if (this.currentBaseLayer) {
      this.map.removeLayer(this.currentBaseLayer);
    }

    // Set new basemap
    this.currentBaseLayer = BASE_MAPS[baseMapName];
    this.currentBaseLayer.addTo(this.map);

    // Re-add overlays
    this.activeOverlayLayers.forEach((layer) => {
      if (!this.map.hasLayer(layer)) {
        layer.addTo(this.map);
      }
      if (layer.bringToFront) {
        layer.bringToFront();
      }
    });

    // Update button states if needed
    if (updateButtons && this.basemapContainer) {
      const buttons = this.basemapContainer.querySelectorAll('.basemap-btn');
      buttons.forEach(btn => {
        if (btn.innerHTML === baseMapName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  resetToDefault() {
    this.setCurrentBasemap('Light', true);
  }

  setBasemapContainer(container) {
    this.basemapContainer = container;
  }

  getCurrentBasemap() {
    return this.currentBaseLayer;
  }
}

// Export singleton instance
export const basemapManager = new BasemapManager();