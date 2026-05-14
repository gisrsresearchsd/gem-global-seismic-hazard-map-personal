import L from "leaflet";

import parseGeoraster from "georaster";

import geoblaze from "geoblaze";
import proj4 from "proj4";

// PGA Tile Visualization Layer

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

// Hidden Raster Reference

let rasterData = null;

// Load Hidden Raster

export async function loadHiddenRaster() {
  try {
    const response = await fetch("/raster/pga_float_3857_cog.tif");

    const arrayBuffer = await response.arrayBuffer();

    rasterData = await parseGeoraster(arrayBuffer);

    console.log("Hidden PGA raster loaded");
  } catch (error) {
    console.error("Raster loading failed:", error);
  }
}

// Query PGA Value

// Query PGA Value

export async function getPGAValue(lat, lng) {
  if (!rasterData) {
    return null;
  }

  try {
    // Convert EPSG:4326 to EPSG:3857

    const [x, y] = proj4("EPSG:4326", "EPSG:3857", [lng, lat]);

    // Query Raster

    const result = await geoblaze.identify(rasterData, [x, y]);

    console.log("Raster Result:", result);

    // Validate Result

    if (!result || !Array.isArray(result) || result.length === 0) {
      return null;
    }

    const value = result[0];

    // Handle NoData / Invalid

    if (value === null || value === undefined || isNaN(value)) {
      return null;
    }

    return value;
  } catch (error) {
    console.error("Raster query failed:", error);

    return null;
  }
}
