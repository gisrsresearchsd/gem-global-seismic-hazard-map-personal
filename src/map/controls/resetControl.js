import L from "leaflet";

import { APP_CONFIG } from "../../config/appConfig";

import { resetLayerControl } from "../controls/layerControl";

import {
  mapState,
  resetAnalysisState,
  resetUIState,
} from "../../state/mapState";

import { clearLocationMarker } from "../utils/markerManager";

import { clearFaultDistanceLine } from "../layers/faultLayer";

import { basemapManager } from "../basemaps/basemapManager";

/*
=====================
Create Reset Control
=====================
*/
export function createResetControl(map) {
  const resetControl = L.control({
    position: "topright",
  });

  resetControl.onAdd = function () {
    const container = L.DomUtil.create("div", "reset-control");

    container.textContent = "Reset View";

    L.DomEvent.disableClickPropagation(container);

    container.addEventListener("click", () => {
      resetApplication(map);
    });

    return container;
  };

  resetControl.addTo(map);

  return resetControl;
}

/*
=====================
Full App Reset
=====================
*/
function resetApplication(map) {
  clearMapUI(map);

  resetMapView(map);

  resetMapState();

  resetAnalysisUI();

  resetRiskPanel();

  resetSearchUI();

  resetBaseMap();

  resetLayerControl(map);

  map.closePopup();
}

/*
=====================
Reset Map Position
=====================
*/
function resetMapView(map) {
  map.setView(APP_CONFIG.MAP.CENTER, APP_CONFIG.MAP.DEFAULT_ZOOM);
}

/*
=====================
Clear Map UI
=====================
*/
function clearMapUI(map) {
  clearLocationMarker(map);

  clearFaultDistanceLine(map);
}

/*
=====================
Reset Global State
=====================
*/
function resetMapState() {
  mapState.location.lat = null;

  mapState.location.lng = null;

  resetAnalysisState();
  resetUIState();

  mapState.loading.isAnalyzing = false;
}

/*
=====================
Reset Analysis UI
=====================
*/
function resetAnalysisUI() {
  const riskPGA = document.getElementById("riskPGA");

  const riskLevel = document.getElementById("riskLevel");

  const riskFault = document.getElementById("riskFault");

  if (riskPGA) {
    riskPGA.textContent = "--";
  }

  if (riskLevel) {
    riskLevel.className = "risk-badge";

    riskLevel.textContent = "No Data";
  }

  if (riskFault) {
    riskFault.textContent = "--";
  }
}

/*
=====================
Reset Risk Panel
=====================
*/
function resetRiskPanel() {
  resetReport();

  resetValidation();

  resetFormFields();

  resetDocumentCheckboxes();

  resetDynamicSections();
}

/*
=====================
Reset Report
=====================
*/
function resetReport() {
  const riskResult = document.getElementById("riskResult");

  const reportSection = document.querySelector(".risk-report-section");

  const reportToggleBtn = document.querySelector(".report-toggle-btn");

  if (riskResult) {
    riskResult.innerHTML = "";
  }

  reportSection?.classList.add("collapsed");

  if (reportToggleBtn) {
    reportToggleBtn.textContent = "+";
  }
}

/*
=====================
Reset Validation
=====================
*/
function resetValidation() {
  const validationMessage = document.getElementById("validationMessage");

  if (validationMessage) {
    validationMessage.textContent = "";
  }

  ["propertyType", "buildingType", "buildingStories"].forEach((id) => {
    document.getElementById(id)?.classList.remove("field-error");
  });
}

/*
=====================
Reset Form Fields
=====================
*/
function resetFormFields() {
  [
    "propertyType",
    "buildingType",
    "buildingStories",
    "seismicAssessmentDone",
  ].forEach((id) => {
    const element = document.getElementById(id);

    if (element) {
      element.value = "";
    }
  });
}

/*
=====================
Reset Document Checks
=====================
*/
function resetDocumentCheckboxes() {
  document
    .querySelectorAll('.document-item input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });
}

/*
=====================
Reset Dynamic Sections
=====================
*/
function resetDynamicSections() {
  document.getElementById("leaseRenewalQuestion")?.classList.add("hidden");

  document.getElementById("documentsSection")?.classList.add("hidden");

  document.getElementById("documentList")?.classList.add("collapsed");

  const toggleIcon = document.getElementById("documentToggleIcon");

  if (toggleIcon) {
    toggleIcon.textContent = "+";
  }
}

/*
=====================
Reset Search UI
=====================
*/
function resetSearchUI() {
  const searchInput = document.querySelector(".search-input");

  const suggestions = document.querySelector(".search-suggestions");

  const clearBtn = document.querySelector(".search-clear-btn");

  if (searchInput) {
    searchInput.value = "";

    searchInput.blur();
  }

  if (suggestions) {
    suggestions.innerHTML = "";

    suggestions.style.display = "none";
  }

  if (clearBtn) {
    clearBtn.style.display = "none";
  }
}

/*
=====================
Reset Basemap
=====================
*/
function resetBaseMap() {
  basemapManager.resetToDefault();
}
