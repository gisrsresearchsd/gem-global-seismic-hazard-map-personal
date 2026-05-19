import L from "leaflet";

// OpenStreetMap

const openStreetMap = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
    
  },
);

// Carto Light

const cartoLight = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; CartoDB",
    
  },
);

// Carto Dark

const cartoDark = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; CartoDB",
    
  },
);

// ESRI Satellite

const esriSatellite = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/" +
    "World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles &copy; Esri",
    
  },
);

// ESRI Topographic (USGS-style topo maps)
const openTopoMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
    maxZoom: 17,
  },
);

// Export Base Maps

export const BASE_MAPS = {
  OSM: openStreetMap,
  "Light": cartoLight,
  "Dark": cartoDark,
  "Satellite": esriSatellite,
  "Topographic": openTopoMap,
};
