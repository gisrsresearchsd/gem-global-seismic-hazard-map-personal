// src/map/core/mapInitializer.js

import L from "leaflet";

import { APP_CONFIG } from "../../config/appConfig";
import { BASE_MAPS } from "../basemaps/baseMaps";
import { createBaseMapControl } from "../basemaps/baseMapControl";

import { createZoomControl } from "../controls/zoomControl";
import { createScaleControl } from "../controls/scaleControl";
import { createCoordinateControl } from "../controls/coordinateControl";
import { createLegendControl } from "../controls/legendControl";
import { createSearchControl } from "../controls/searchControl";
import { createResetControl } from "../controls/resetControl";
import { createZoomGuidanceControl } from "../controls/zoomGuidanceControl";
import { createLayerControl } from "../controls/layerControl";

import { pgaVisualizationLayer, loadHiddenRaster } from "../layers/pgaLayer";

import { loadCountryLayer } from "../layers/countryLayer";
import { loadFaultLayer } from "../layers/faultLayer";

import { analyzeLocation } from "./analysisHandler";

// Initialize Main Map
export async function initializeMap() {
  const map = L.map("map", {
    zoomControl: false,
    center: APP_CONFIG.MAP.CENTER,
    zoom: APP_CONFIG.MAP.DEFAULT_ZOOM,
    minZoom: APP_CONFIG.MAP.MIN_ZOOM,
    maxZoom: APP_CONFIG.MAP.MAX_ZOOM,
    maxBounds: APP_CONFIG.MAP.WORLD_BOUNDS,
    worldCopyJump: true,
  });

  /*
  =====================
  Overlay Pane
  =====================
  */
  map.createPane("overlayPane");
  map.getPane("overlayPane").style.zIndex = 400;

  /*
  =====================
  Base Map
  =====================
  */
  BASE_MAPS[APP_CONFIG.MAP.DEFAULT_BASEMAP].addTo(map);

  /*
  =====================
  Layers
  =====================
  */

  // PGA
  pgaVisualizationLayer.addTo(map);

  // Hidden raster
  loadHiddenRaster();

  // Fault
  const faultLayer = await loadFaultLayer(map);

  // Country
  const countryLayer = await loadCountryLayer(map);

  /*
  =====================
  Controls
  =====================
  */
  createZoomControl(map);

  createBaseMapControl(map, [pgaVisualizationLayer]);

  createScaleControl(map);

  createCoordinateControl(map);

  // Add LAYER FIRST
  createLayerControl({
    map,
    pgaLayer: pgaVisualizationLayer,
    faultLayer,
    countryLayer,
  }).addTo(map);

  // Add LEGEND SECOND
  createLegendControl(map);

  createResetControl(map);

  createZoomGuidanceControl(map);

  createSearchControl(map, analyzeLocation);

  /*
  =====================
  Click Analysis
  =====================
  */
  map.on("click", (event) => {
    const { lat, lng } = event.latlng;

    analyzeLocation(map, lat, lng);
  });

  return map;
}
