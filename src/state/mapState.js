import { APP_CONFIG } from "../config/appConfig";

// Global map state
export const mapState = {
  // Selected location
  location: {
    lat: null,
    lng: null,
  },

  // Seismic analysis
  analysis: {
    pga: null,
    classification: null,
    nearestFault: null,
    country: null,
  },

  // Map UI
  ui: {    
    searchMarker: null,
  },

  // Map settings
  settings: {
    activeBaseMap: APP_CONFIG.MAP.DEFAULT_BASEMAP,
    lastSearch: "",
  },

  // Loading state
  loading: {
    isAnalyzing: false,
  },
};

// Reset analysis state
export function resetAnalysisState() {
  Object.assign(mapState.analysis, {
    pga: null,
    classification: null,
    nearestFault: null,
    country: null,
  });
}

// Reset UI state
export function resetUIState() {
  Object.assign(mapState.ui, {
    selectedMarker: null,
    activePopup: null,
    faultConnectionLine: null,
    searchMarker: null,
  });
}