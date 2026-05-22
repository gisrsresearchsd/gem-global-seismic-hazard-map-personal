import L from "leaflet";

/* Shared tile layer factory */
function createTileLayer(url, options) {
  return L.tileLayer(url, options);
}

/* OpenStreetMap */
const openStreetMap = createTileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
  },
);

/* Carto Light */
const cartoLight = createTileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; CartoDB",
  },
);

/* Carto Dark */
const cartoDark = createTileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; CartoDB",
  },
);

/* ESRI Satellite */
const esriSatellite = createTileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/" +
    "World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri",
  },
);

/* OpenTopoMap */
const openTopoMap = createTileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    maxZoom: 17,
  },
);

/* Export base maps */
export const BASE_MAPS = {
  OSM: openStreetMap,
  Light: cartoLight,
  Dark: cartoDark,
  Satellite: esriSatellite,
  Topographic: openTopoMap,
};
