// Global Map State

export const mapState = {
  // Selected Location

  location: {
    lat: null,

    lng: null,
  },

  // Seismic Analysis

  analysis: {
    pga: null,

    classification: null,

    nearestFault: null,
  },

  // Map UI

  ui: {
    selectedMarker: null,

    activePopup: null,

    faultConnectionLine: null,

    searchMarker: null,
  },

  // Map Settings

  settings: {
    activeBaseMap: "Light",

    lastSearch: "",
  },

  // Loading State

  loading: {
    isAnalyzing: false,
  },
};

// Reset Analysis State

export function resetAnalysisState() {
  mapState.analysis.pga = null;

  mapState.analysis.classification =
    null;

  mapState.analysis.nearestFault =
    null;
}

// Reset UI State

export function resetUIState() {
  mapState.ui.selectedMarker =
    null;

  mapState.ui.activePopup =
    null;

  mapState.ui.faultConnectionLine =
    null;

  mapState.ui.searchMarker =
    null;
}