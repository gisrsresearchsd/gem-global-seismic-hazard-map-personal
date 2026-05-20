import { getRiskPanelElements } from "./riskPanelElements";

import { initializeAnalysisHandler } from "../handlers/analysisHandler";

import { PROPERTY_TYPES } from "../analysis/riskConstants";

// Initialize Risk Panel

export function initializeRiskPanel() {
  const elements = getRiskPanelElements();

  const {
    propertyType,
    buildingTypeElement,
    storiesElement,
    seismicQuestion,
    seismicAssessment,
    documentsSection,
    toggleButton,
    documentList,
    toggleIcon,
    reportSection,
    reportToggleBtn,
  } = elements;

  initializeReportToggle({
    reportToggleBtn,
    reportSection,
  });

  initializeFieldValidation({
    propertyType,
    buildingTypeElement,
    storiesElement,
  });

  initializePropertyTypeToggle({
    propertyType,
    seismicQuestion,
    documentsSection,
  });

  initializeSeismicToggle({
    seismicAssessment,
    documentsSection,
  });

  initializeDocumentToggle({
    toggleButton,
    documentList,
    toggleIcon,
  });

  initializeAnalysisHandler(elements);
}

// Report Toggle

function initializeReportToggle({ reportToggleBtn, reportSection }) {
  if (!reportToggleBtn || !reportSection) {
    return;
  }

  reportToggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    const isCollapsed = toggleCollapsedState(reportSection);

    reportToggleBtn.textContent = isCollapsed ? "+" : "−";
  });
}

// Field Validation

function initializeFieldValidation({
  propertyType,
  buildingTypeElement,
  storiesElement,
}) {
  removeFieldErrorOnChange(propertyType, "change");

  removeFieldErrorOnChange(buildingTypeElement, "change");

  removeFieldErrorOnChange(storiesElement, "input");
}

// Property Type Toggle

function initializePropertyTypeToggle({
  propertyType,
  seismicQuestion,
  documentsSection,
}) {
  hideElement(seismicQuestion);

  hideElement(documentsSection);

  if (!propertyType) {
    return;
  }

  propertyType.addEventListener("change", () => {
    const isLeaseRenewal = propertyType.value === PROPERTY_TYPES.LEASE_RENEWAL;

    toggleElement(seismicQuestion, isLeaseRenewal);

    toggleElement(documentsSection, !isLeaseRenewal);
  });
}

// Seismic Toggle

function initializeSeismicToggle({ seismicAssessment, documentsSection }) {
  if (!seismicAssessment) {
    return;
  }

  seismicAssessment.addEventListener("change", () => {
    const hasAssessment = seismicAssessment.value === "yes";

    toggleElement(documentsSection, !hasAssessment);
  });
}

// Document Toggle

function initializeDocumentToggle({ toggleButton, documentList, toggleIcon }) {
  if (!toggleButton || !documentList || !toggleIcon) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    const isCollapsed = toggleCollapsedState(documentList);

    toggleIcon.innerHTML = isCollapsed ? "+" : "−";
  });
}

// Remove Field Error

function removeFieldErrorOnChange(element, eventType) {
  if (!element) {
    return;
  }

  element.addEventListener(eventType, () => {
    element.classList.remove("field-error");
  });
}

// Toggle Element

function toggleElement(element, shouldShow) {
  if (!element) {
    return;
  }

  element.classList.toggle("hidden", !shouldShow);
}

// Hide Element

function hideElement(element) {
  if (!element) {
    return;
  }

  element.classList.add("hidden");
}

// Toggle Collapsed State

function toggleCollapsedState(element) {
  element.classList.toggle("collapsed");

  return element.classList.contains("collapsed");
}
