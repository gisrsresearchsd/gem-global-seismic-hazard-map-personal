// ========================================
// GLOBAL MAP STATE
// ========================================

export const mapState = {

  // Selected Location
  lat: null,
  lng: null,

  // PGA Analysis
  pga: null,
  classification: null,
  nearestFault: null,

  // UI State
  selectedMarker: null,
  activePopup: null,
  faultConnectionLine: null,
  searchMarker: null,

  // Map State
  activeBaseMap: "Light",
  lastSearch: "",

  // Async State
  isAnalyzing: false,
};