import L from "leaflet";
import parseGeoraster from "georaster";
import geoblaze from "geoblaze";
import proj4 from "proj4";

/* Projection constants */
const SOURCE_CRS = "EPSG:4326";
const TARGET_CRS = "EPSG:3857";

/* Zoom thresholds */
const PGA_ZOOM_CONFIG = {
  MIN_ZOOM_FOR_QUERY: 4,
  RECOMMENDED_ZOOM: 6,
};

/* PGA visualization layer */
export const pgaVisualizationLayer = L.tileLayer(
  "https://maps.openquake.org/tiles/" +
    "ghm/wmts/seismic-hazard-pga-g/" +
    "webmercator/{z}/{x}/{y}.png",
  {
    attribution: "© GEM Foundation",
    opacity: 0.75,
    pane: "overlayPane",
  },
);

let rasterData = null;

/* Load hidden PGA raster */
export async function loadHiddenRaster() {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}raster/pga_float_3857_cog.tif`,
    );

    const arrayBuffer = await response.arrayBuffer();

    rasterData = await parseGeoraster(arrayBuffer);
  } catch (error) {
    console.error("Raster loading failed:", error);
  }
}

/* Validate zoom level */
export function isValidZoomForPGA(zoomLevel) {
  return zoomLevel >= PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY;
}

/* Get zoom guidance */
export function getZoomRecommendation(zoomLevel) {
  if (zoomLevel < PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY) {
    return {
      isValid: false,
      message: `Zoom in to at least level ${PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY} for accurate PGA values. Current zoom: ${zoomLevel}`,
      severity: "warning",
    };
  }

  if (zoomLevel < PGA_ZOOM_CONFIG.RECOMMENDED_ZOOM) {
    return {
      isValid: true,
      message: `Consider zooming in further (level ${PGA_ZOOM_CONFIG.RECOMMENDED_ZOOM}+) for more precise PGA values.`,
      severity: "info",
    };
  }

  return {
    isValid: true,
    message: null,
    severity: "success",
  };
}

/* Query PGA value from raster */
export async function getPGAValue(lat, lng, currentZoom = null) {
  if (!rasterData) {
    console.warn("Raster data not loaded yet");
    return null;
  }

  if (currentZoom !== null && !isValidZoomForPGA(currentZoom)) {
    console.warn(
      `PGA query at zoom ${currentZoom} - below minimum threshold ${PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY}`,
    );

    return null;
  }

  try {
    const [x, y] = proj4(SOURCE_CRS, TARGET_CRS, [lng, lat]);

    const result = await geoblaze.identify(rasterData, [x, y]);

    if (!Array.isArray(result) || result.length === 0) {
      return null;
    }

    const value = Number(result[0]);

    /* Keep PGA 0 valid */
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }

    return value;
  } catch (error) {
    console.error("Raster query failed:", error);

    return null;
  }
}
