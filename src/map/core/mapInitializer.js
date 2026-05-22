import L from "leaflet";

import { APP_CONFIG } from "../../config/appConfig";

import { BASE_MAPS } from "../basemaps/baseMaps";
import { createBaseMapControl } from "../basemaps/baseMapControl";

import { createCoordinateControl } from "../controls/coordinateControl";
import { createLayerControl } from "../controls/layerControl";
import { createLegendControl } from "../controls/legendControl";
import { createResetControl } from "../controls/resetControl";
import { createScaleControl } from "../controls/scaleControl";
import { createSearchControl } from "../controls/searchControl";
import { createZoomControl } from "../controls/zoomControl";
import { createZoomGuidanceControl } from "../controls/zoomGuidanceControl";

import { pgaVisualizationLayer, loadHiddenRaster } from "../layers/pgaLayer";
import { loadCountryLayer } from "../layers/countryLayer";
import { loadFaultLayer } from "../layers/faultLayer";

import { analyzeLocation } from "./locationAnalysisHandler";

const OVERLAY_PANE_Z_INDEX = 400;

// Initialize main map
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

  /* Overlay pane */
  const overlayPane = map.createPane("overlayPane");
  overlayPane.style.zIndex = OVERLAY_PANE_Z_INDEX;

  /* Base map */
  BASE_MAPS[APP_CONFIG.MAP.DEFAULT_BASEMAP].addTo(map);

  /* Layers */
  const faultLayer = await loadFaultLayer(map);


  const countryLayer = await loadCountryLayer(map);
  countryLayer.addTo(map);

  pgaVisualizationLayer.addTo(map);

  loadHiddenRaster();



  

  /* Controls */
  createZoomControl(map);
  createBaseMapControl(map, [pgaVisualizationLayer]);

  createScaleControl(map);
  createCoordinateControl(map);

  createLayerControl({
    map,
    pgaLayer: pgaVisualizationLayer,
    faultLayer,
    countryLayer,
  }).addTo(map);

  createLegendControl(map);
  createResetControl(map);
  createZoomGuidanceControl(map);

  createSearchControl(map, analyzeLocation);

  /* Click analysis */
  map.on("click", ({ latlng }) => {
    const { lat, lng } = latlng;
    analyzeLocation(map, lat, lng);
  });

  return map;
}
