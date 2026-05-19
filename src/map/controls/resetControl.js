import L from "leaflet";

import { APP_CONFIG } from "../../config/appConfig";

import { mapState } from "../../state/mapState";

// Create Reset Control
export function createResetControl(map) {
  const resetControl = L.control({
    position: "topright",
  });

  resetControl.onAdd = function () {
    const container = L.DomUtil.create("div", "reset-control");
    container.innerHTML = "Reset View";

    L.DomEvent.disableClickPropagation(container);

    container.addEventListener("click", () => {
      // Reset Map View
      map.flyTo(APP_CONFIG.MAP.CENTER, APP_CONFIG.MAP.DEFAULT_ZOOM, {
        duration: 1.2,
        easeLinearity: 0.5,
      });

      // Clear ALL markers from map
      clearAllMarkers(map);

      // Clear fault distance line and stop animation
      clearFaultDistanceLine(map);

      // Reset Map State
      mapState.location.lat = null;
      mapState.location.lng = null;

      mapState.analysis.pga = null;
      mapState.analysis.classification = null;
      mapState.analysis.nearestFault = null;
      mapState.ui.selectedMarker = null;
      mapState.ui.activePopup = null;
      mapState.ui.faultConnectionLine = null;
      mapState.ui.searchMarker = null;

      mapState.loading.isAnalyzing = false;

      // Reset PGA Display
      const riskPGAElement = document.getElementById("riskPGA");
      if (riskPGAElement) riskPGAElement.innerHTML = "--";

      // Reset Risk Badge
      const riskLevel = document.getElementById("riskLevel");
      if (riskLevel) {
        riskLevel.className = "risk-badge";
        riskLevel.innerHTML = "No Data";
      }

      // Reset Fault Display
      const riskFaultElement = document.getElementById("riskFault");
      if (riskFaultElement) riskFaultElement.innerHTML = "--";

      // Reset Report
      const riskResultElement = document.getElementById("riskResult");
      if (riskResultElement) riskResultElement.innerHTML = "No analysis yet";

      // Reset All Form Fields
      resetFormFields();

      // Reset Document Checkboxes
      resetDocumentCheckboxes();

      // Hide Dynamic Sections
      hideDynamicSections();

      // Close any open popups
      map.closePopup();

      // Remove any CSS animations from distance line
      removeDistanceLineAnimations();

      console.log("Reset completed - All data and animations cleared");
    });

    return container;
  };

  resetControl.addTo(map);
}

// Clear all markers from map
function clearAllMarkers(map) {
  const layersToRemove = [];

  map.eachLayer((layer) => {
    // Remove all circle markers (search/click markers)
    if (layer instanceof L.CircleMarker) {
      layersToRemove.push(layer);
    }
    // Remove custom markers
    if (layer instanceof L.Marker) {
      layersToRemove.push(layer);
    }
    // Remove polylines (fault distance lines)
    if (layer instanceof L.Polyline) {
      layersToRemove.push(layer);
    }
  });

  layersToRemove.forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });
}

// Clear fault distance line and stop animation
function clearFaultDistanceLine(map) {
  // Clear from window object
  if (window.activeDistanceLine) {
    if (map.hasLayer(window.activeDistanceLine)) {
      map.removeLayer(window.activeDistanceLine);
    }
    window.activeDistanceLine = null;
  }

  // Clear from any other references
  if (window.faultDistanceLine) {
    if (map.hasLayer(window.faultDistanceLine)) {
      map.removeLayer(window.faultDistanceLine);
    }
    window.faultDistanceLine = null;
  }

  // Update mapState
  mapState.ui.faultConnectionLine = null;
mapState.analysis.nearestFault = null;
}

// Remove any CSS animations from distance line elements
function removeDistanceLineAnimations() {
  // Find any elements with fault-distance-line class and remove animation
  const animatedLines = document.querySelectorAll(".fault-distance-line");
  animatedLines.forEach((line) => {
    line.style.animation = "none";
    // Force reflow to stop animation
    line.offsetHeight;
  });
}

// Reset all form fields to empty/default state
function resetFormFields() {
  // Property Type
  const propertyType = document.getElementById("propertyType");
  if (propertyType) propertyType.value = "";

  // Building Type
  const buildingType = document.getElementById("buildingType");
  if (buildingType) buildingType.value = "";

  // Building Stories
  const buildingStories = document.getElementById("buildingStories");
  if (buildingStories) buildingStories.value = "";

  // Seismic Assessment
  const seismicAssessmentDone = document.getElementById(
    "seismicAssessmentDone",
  );
  if (seismicAssessmentDone) seismicAssessmentDone.value = "";

  // Search input (if exists)
  const searchInput = document.querySelector(".search-input");
  if (searchInput) searchInput.value = "";
}

// Reset all document checkboxes
function resetDocumentCheckboxes() {
  const checkboxes = document.querySelectorAll(
    '.document-item input[type="checkbox"]',
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
}

// Hide dynamic sections
function hideDynamicSections() {
  // Hide lease renewal question section
  const leaseRenewalQuestion = document.getElementById("leaseRenewalQuestion");
  if (leaseRenewalQuestion) {
    leaseRenewalQuestion.classList.add("hidden");
  }

  // Hide documents section
  const documentsSection = document.getElementById("documentsSection");
  if (documentsSection) {
    documentsSection.classList.add("hidden");
  }

  // Reset document toggle button icon if collapsed
  const documentList = document.getElementById("documentList");
  const toggleIcon = document.getElementById("documentToggleIcon");

  if (documentList && !documentList.classList.contains("collapsed")) {
    documentList.classList.add("collapsed");
  }
  if (toggleIcon) {
    toggleIcon.innerHTML = "+";
  }
}
