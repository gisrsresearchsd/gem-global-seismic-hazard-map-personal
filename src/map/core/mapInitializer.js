import L from "leaflet";

import { APP_CONFIG } from "../../config/appConfig";
import { BASE_MAPS } from "../basemaps/baseMaps";
import { createBaseMapControl } from "../basemaps/baseMapControl";
import { createZoomControl } from "../controls/zoomControl";
import { createScaleControl } from "../controls/scaleControl";
import { createCoordinateControl } from "../controls/coordinateControl";
import { pgaVisualizationLayer, loadHiddenRaster } from "../layers/pgaLayer";
import { createLegendControl } from "../controls/legendControl";
import { loadFaultLayer } from "../layers/faultLayer";
import { createSearchControl } from "../controls/searchControl";
import { analyzeLocation } from "./analysisHandler";
import { createResetControl } from "../controls/resetControl";

// Initialize Main Map
export function initializeMap() {
  // Create Map
  const map = L.map("map", {
    zoomControl: false,
    center: APP_CONFIG.MAP.CENTER,
    zoom: APP_CONFIG.MAP.DEFAULT_ZOOM,
    minZoom: APP_CONFIG.MAP.MIN_ZOOM,
    maxZoom: APP_CONFIG.MAP.MAX_ZOOM,
    maxBounds: APP_CONFIG.MAP.WORLD_BOUNDS,
    worldCopyJump: true,
  });

  // Create Overlay Pane
  map.createPane("overlayPane");

  // Overlay Z-Index
  map.getPane("overlayPane").style.zIndex = 400;

  // Default Base Map
  BASE_MAPS[APP_CONFIG.MAP.DEFAULT_BASEMAP].addTo(map);

  // PGA Visualization Layer
  pgaVisualizationLayer.addTo(map);

  // Load Hidden Raster
  loadHiddenRaster();

  // Load Fault Layer
  loadFaultLayer(map);

  // Controls
  createZoomControl(map);
  createBaseMapControl(map, [pgaVisualizationLayer]);
  createScaleControl(map);
  createCoordinateControl(map);
  createLegendControl(map);
  createResetControl(map);

  // Search Control
  createSearchControl(map, analyzeLocation);

  // Map Click
  map.on("click", (event) => {
    const { lat, lng } = event.latlng;

    analyzeLocation(map, lat, lng);
  });

  return map;
}