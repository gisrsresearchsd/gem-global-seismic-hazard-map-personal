/* Get risk panel elements */
export function getRiskPanelElements() {
  return {
    /* Form fields */
    propertyType: getElement("propertyType"),

    buildingTypeElement: getElement("buildingType"),

    storiesElement: getElement("buildingStories"),

    seismicAssessment: getElement("seismicAssessmentDone"),

    /* Sections */
    seismicQuestion: getElement("leaseRenewalQuestion"),

    documentsSection: getElement("documentsSection"),

    reportSection: getQueryElement(".risk-report-section"),

    /* Buttons */
    analyzeButton: getElement("analyzeBtn"),

    toggleButton: getElement("documentToggleBtn"),

    reportToggleBtn: getQueryElement(".report-toggle-btn"),

    /* Document controls */
    documentList: getElement("documentList"),

    toggleIcon: getElement("documentToggleIcon"),

    /* Messages */
    validationMessage: getElement("validationMessage"),

    riskResult: getElement("riskResult"),
  };
}

/* Get element by ID */
function getElement(id) {
  return document.getElementById(id);
}

/* Get element by selector */
function getQueryElement(selector) {
  return document.querySelector(selector);
}