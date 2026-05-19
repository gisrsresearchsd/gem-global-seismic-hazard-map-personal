// pgaLayer.js - Add zoom validation

import L from "leaflet";
import parseGeoraster from "georaster";
import geoblaze from "geoblaze";
import proj4 from "proj4";

export const pgaVisualizationLayer = L.tileLayer(
  "https://maps.openquake.org/tiles/" +
    "ghm/wmts/seismic-hazard-pga-g/" +
    "webmercator/{z}/{x}/{y}.png",
  {
    attribution: "© GEM Foundation",
    opacity: 0.75,
    pane: 'overlayPane',
  },
);

let rasterData = null;

// Define zoom level thresholds
const PGA_ZOOM_CONFIG = {
  MIN_ZOOM_FOR_QUERY: 4,    // Only query PGA at zoom 4 or higher
  RECOMMENDED_ZOOM: 6,      // Recommended zoom for accurate queries
  WARNING_ZOOM: 3,          // Show warning below this zoom
};

export async function loadHiddenRaster() {
  try {
    const response = await fetch("/raster/pga_float_3857_cog.tif");
    const arrayBuffer = await response.arrayBuffer();
    rasterData = await parseGeoraster(arrayBuffer);
    console.log("Hidden PGA raster loaded successfully");
  } catch (error) {
    console.error("Raster loading failed:", error);
  }
}

// Check if zoom level is valid for PGA query
export function isValidZoomForPGA(zoomLevel) {
  return zoomLevel >= PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY;
}

// Get recommended zoom message
export function getZoomRecommendation(zoomLevel) {
  if (zoomLevel < PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY) {
    return {
      isValid: false,
      message: `Zoom in to at least level ${PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY} for accurate PGA values. Current zoom: ${zoomLevel}`,
      severity: 'warning'
    };
  }
  
  if (zoomLevel < PGA_ZOOM_CONFIG.RECOMMENDED_ZOOM) {
    return {
      isValid: true,
      message: `Consider zooming in further (level ${PGA_ZOOM_CONFIG.RECOMMENDED_ZOOM}+) for more precise PGA values.`,
      severity: 'info'
    };
  }
  
  return {
    isValid: true,
    message: null,
    severity: 'success'
  };
}

// Modified PGA query with zoom validation
export async function getPGAValue(lat, lng, currentZoom = null) {
  if (!rasterData) {
    console.warn("Raster data not loaded yet");
    return null;
  }

  // If zoom is provided, validate it
  if (currentZoom !== null && !isValidZoomForPGA(currentZoom)) {
    console.warn(`PGA query at zoom ${currentZoom} - below minimum threshold ${PGA_ZOOM_CONFIG.MIN_ZOOM_FOR_QUERY}`);
    return null;
  }

  try {
    const [x, y] = proj4("EPSG:4326", "EPSG:3857", [lng, lat]);
    const result = await geoblaze.identify(rasterData, [x, y]);
    
    console.log(`PGA Query Result at zoom ${currentZoom}:`, result);

    if (!result || !Array.isArray(result) || result.length === 0) {
      return null;
    }

    const value = Number(result[0]);

// Treat invalid / no-data raster cells as null
if (
  !Number.isFinite(value) ||
  value <= 0
) {
  return null;
}

return value;
  } catch (error) {
    console.error("Raster query failed:", error);
    return null;
  }
}