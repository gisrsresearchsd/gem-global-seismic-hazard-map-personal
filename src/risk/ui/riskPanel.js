import { getRiskPanelElements } from "./riskPanelElements";
import { initializeAnalysisHandler } from "../handlers/riskAnalysisHandler";
import { PROPERTY_TYPES } from "../analysis/riskConstants";

/* Initialize risk panel */
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

/* Report toggle */
function initializeReportToggle({ reportToggleBtn, reportSection }) {
  if (!reportToggleBtn || !reportSection) {
    return;
  }

  reportToggleBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    updateCollapseIndicator(reportSection, reportToggleBtn);
  });
}

/* Field validation */
function initializeFieldValidation({
  propertyType,
  buildingTypeElement,
  storiesElement,
}) {
  removeFieldErrorOnChange(propertyType, "change");

  removeFieldErrorOnChange(buildingTypeElement, "change");

  removeFieldErrorOnChange(storiesElement, "input");
}

/* Property type toggle */
function initializePropertyTypeToggle({
  propertyType,
  seismicQuestion,
  documentsSection,
}) {
  if (!propertyType) {
    hideElement(seismicQuestion);
    hideElement(documentsSection);
    return;
  }

  const updatePropertyUI = () => {
    const isLeaseRenewal = propertyType.value === PROPERTY_TYPES.LEASE_RENEWAL;

    toggleElement(seismicQuestion, isLeaseRenewal);

    toggleElement(documentsSection, !isLeaseRenewal);
  };

  propertyType.addEventListener("change", updatePropertyUI);

  updatePropertyUI();
}

/* Seismic assessment toggle */
function initializeSeismicToggle({ seismicAssessment, documentsSection }) {
  if (!seismicAssessment) {
    return;
  }

  const updateSeismicUI = () => {
    const hasAssessment = seismicAssessment.value === "yes";

    toggleElement(documentsSection, !hasAssessment);
  };

  seismicAssessment.addEventListener("change", updateSeismicUI);

  updateSeismicUI();
}

/* Document list toggle */
function initializeDocumentToggle({ toggleButton, documentList, toggleIcon }) {
  if (!toggleButton || !documentList || !toggleIcon) {
    return;
  }

  toggleButton.addEventListener("click", () => {
    updateCollapseIndicator(documentList, toggleIcon);
  });
}

/* Remove field error on change */
function removeFieldErrorOnChange(element, eventType) {
  if (!element) {
    return;
  }

  element.addEventListener(eventType, () => {
    element.classList.remove("field-error");
  });
}

/* Show or hide element */
function toggleElement(element, shouldShow) {
  if (!element) {
    return;
  }

  element.classList.toggle("hidden", !shouldShow);
}

/* Hide element */
function hideElement(element) {
  if (!element) {
    return;
  }

  element.classList.add("hidden");
}

/* Toggle collapsed state */
function toggleCollapsedState(element) {
  element.classList.toggle("collapsed");

  return element.classList.contains("collapsed");
}

/* Update + / − indicator */
function updateCollapseIndicator(targetElement, indicatorElement) {
  const isCollapsed = toggleCollapsedState(targetElement);

  indicatorElement.textContent = isCollapsed ? "+" : "−";
}
