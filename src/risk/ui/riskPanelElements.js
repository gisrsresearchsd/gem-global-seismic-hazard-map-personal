// Get Risk Panel Elements

export function getRiskPanelElements() {
  return {
    // Form Fields

    propertyType: getElement("propertyType"),
    buildingTypeElement: getElement("buildingType"),
    storiesElement: getElement("buildingStories"),
    seismicAssessment: getElement("seismicAssessmentDone"),

    // Sections

    seismicQuestion: getElement("leaseRenewalQuestion"),
    documentsSection: getElement("documentsSection"),
    reportSection: document.querySelector(".risk-report-section"),

    // Buttons

    analyzeButton: getElement("analyzeBtn"),
    toggleButton: getElement("documentToggleBtn"),
    reportToggleBtn: document.querySelector(".report-toggle-btn"),

    // Document Controls

    documentList: getElement("documentList"),
    toggleIcon: getElement("documentToggleIcon"),

    // Messages

    validationMessage: getElement("validationMessage"),
    riskResult: getElement("riskResult"),
  };
}

// Get Element

function getElement(id) {
  return document.getElementById(id);
}
