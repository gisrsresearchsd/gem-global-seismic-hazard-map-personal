import L from "leaflet";

import { APP_CONFIG } from "../../config/appConfig";

import { mapState } from "../../state/mapState";

import { BASE_MAPS } from "../basemaps/baseMaps";

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
      // =========================
      // Reset Basemap To Default
      // =========================

      Object.values(BASE_MAPS).forEach((layer) => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });

      BASE_MAPS[APP_CONFIG.MAP.DEFAULT_BASEMAP].addTo(map);

      // Bring overlays back to front

      map.eachLayer((layer) => {
        if (layer.options && layer.options.pane === "overlayPane") {
          if (layer.bringToFront) {
            layer.bringToFront();
          }
        }
      });

      // =========================
      // Reset Basemap Button UI
      // =========================

      document.querySelectorAll(".basemap-btn").forEach((btn) => {
        btn.classList.remove("active");

        if (btn.innerHTML.trim() === APP_CONFIG.MAP.DEFAULT_BASEMAP) {
          btn.classList.add("active");
        }
      });

      // =========================
      // Reset Map View
      // =========================

      map.flyTo(APP_CONFIG.MAP.CENTER, APP_CONFIG.MAP.DEFAULT_ZOOM, {
        duration: 1.2,
        easeLinearity: 0.5,
      });

      // Clear ALL markers from map

      clearAllMarkers(map);

      // Clear fault distance line

      clearFaultDistanceLine(map);

      // Reset Map State

      mapState.lat = null;
      mapState.lng = null;
      mapState.pga = null;
      mapState.classification = null;
      mapState.nearestFault = null;
      mapState.selectedMarker = null;
      mapState.activePopup = null;
      mapState.faultConnectionLine = null;
      mapState.searchMarker = null;
      mapState.isAnalyzing = false;

      // Reset PGA Display

      const riskPGAElement = document.getElementById("riskPGA");

      if (riskPGAElement) {
        riskPGAElement.innerHTML = "--";
      }

      // Reset Risk Badge

      const riskLevel = document.getElementById("riskLevel");

      if (riskLevel) {
        riskLevel.className = "risk-badge";

        riskLevel.innerHTML = "No Data";
      }

      // Reset Fault Display

      const riskFaultElement = document.getElementById("riskFault");

      if (riskFaultElement) {
        riskFaultElement.innerHTML = "--";
      }

      // Reset Report

      const riskResultElement = document.getElementById("riskResult");

      if (riskResultElement) {
        riskResultElement.innerHTML = "No analysis yet";
      }

      // Reset All Form Fields

      resetFormFields();

      // Reset Document Checkboxes

      resetDocumentCheckboxes();

      // Hide Dynamic Sections

      hideDynamicSections();

      // Close any open popups

      map.closePopup();

      // Remove CSS animations

      removeDistanceLineAnimations();

      // =========================
      // Reset Attribution Panel
      // =========================

      const attributionPanel = document.querySelector(".map-attribution-panel");

      if (attributionPanel) {
        attributionPanel.removeAttribute("open");
      }

      console.log("Reset completed - Default basemap restored");
    });

    return container;
  };

  resetControl.addTo(map);
}

// Clear all markers from map

function clearAllMarkers(map) {
  const layersToRemove = [];

  map.eachLayer((layer) => {
    // Remove Circle Markers

    if (layer instanceof L.CircleMarker) {
      layersToRemove.push(layer);
    }

    // Remove Standard Markers

    if (layer instanceof L.Marker) {
      layersToRemove.push(layer);
    }

    // Remove Polylines

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

// Clear fault distance line

function clearFaultDistanceLine(map) {
  // Clear active line

  if (window.activeDistanceLine) {
    if (map.hasLayer(window.activeDistanceLine)) {
      map.removeLayer(window.activeDistanceLine);
    }

    window.activeDistanceLine = null;
  }

  // Clear secondary reference

  if (window.faultDistanceLine) {
    if (map.hasLayer(window.faultDistanceLine)) {
      map.removeLayer(window.faultDistanceLine);
    }

    window.faultDistanceLine = null;
  }

  // Reset state

  mapState.faultConnectionLine = null;

  mapState.nearestFault = null;
}

// Remove animations

function removeDistanceLineAnimations() {
  const animatedLines = document.querySelectorAll(".fault-distance-line");

  animatedLines.forEach((line) => {
    line.style.animation = "none";

    // Force reflow

    line.offsetHeight;
  });
}

// Reset form fields

function resetFormFields() {
  // Property Type

  const propertyType = document.getElementById("propertyType");

  if (propertyType) {
    propertyType.value = "";
  }

  // Building Type

  const buildingType = document.getElementById("buildingType");

  if (buildingType) {
    buildingType.value = "";
  }

  // Building Stories

  const buildingStories = document.getElementById("buildingStories");

  if (buildingStories) {
    buildingStories.value = "";
  }

  // Seismic Assessment

  const seismicAssessmentDone = document.getElementById(
    "seismicAssessmentDone",
  );

  if (seismicAssessmentDone) {
    seismicAssessmentDone.value = "";
  }

  // Search Input

  const searchInput = document.querySelector(".search-input");

  if (searchInput) {
    searchInput.value = "";
  }
}

// Reset document checkboxes

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
  // Lease Renewal Section

  const leaseRenewalQuestion = document.getElementById("leaseRenewalQuestion");

  if (leaseRenewalQuestion) {
    leaseRenewalQuestion.classList.add("hidden");
  }

  // Documents Section

  const documentsSection = document.getElementById("documentsSection");

  if (documentsSection) {
    documentsSection.classList.add("hidden");
  }

  // Reset document list state

  const documentList = document.getElementById("documentList");

  const toggleIcon = document.getElementById("documentToggleIcon");

  if (documentList && !documentList.classList.contains("collapsed")) {
    documentList.classList.add("collapsed");
  }

  if (toggleIcon) {
    toggleIcon.innerHTML = "+";
  }
}
