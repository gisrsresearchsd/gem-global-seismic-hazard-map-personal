import { runRiskAnalysis } from "../risk/riskRules";

import { generateRiskReport } from "../risk/riskReport";

import { mapState } from "../state/mapState";
// Initialize Risk Panel

export function initializeRiskPanel() {
  // Elements

  const propertyType = document.getElementById("propertyType");

  const seismicQuestion = document.getElementById("leaseRenewalQuestion");

  const seismicAssessment = document.getElementById("seismicAssessmentDone");

  const documentsSection = document.getElementById("documentsSection");

  // Document Toggle

  const toggleButton = document.getElementById("documentToggleBtn");

  const documentList = document.getElementById("documentList");

  const toggleIcon = document.getElementById("documentToggleIcon");

  // Report Elements

  const analyzeButton = document.getElementById("analyzeBtn");

  const riskResult = document.getElementById("riskResult");

  // Default State

  seismicQuestion.classList.add("hidden");

  documentsSection.classList.add("hidden");

  // Property Type Change

  propertyType.addEventListener("change", () => {
    const selectedValue = propertyType.value;

    // Lease Renewal

    if (selectedValue === "Lease Renewal") {
      seismicQuestion.classList.remove("hidden");

      documentsSection.classList.add("hidden");

      return;
    }

    // Other Types

    seismicQuestion.classList.add("hidden");

    documentsSection.classList.remove("hidden");
  });

  // Seismic Assessment Change

  seismicAssessment.addEventListener("change", () => {
    const selectedValue = seismicAssessment.value;

    // YES → Hide Documents

    if (selectedValue === "yes") {
      documentsSection.classList.add("hidden");

      return;
    }

    // NO → Show Documents

    documentsSection.classList.remove("hidden");
  });

  // Toggle Document List

  toggleButton.addEventListener("click", () => {
    documentList.classList.toggle("collapsed");

    const isCollapsed = documentList.classList.contains("collapsed");

    toggleIcon.innerHTML = isCollapsed ? "+" : "−";
  });

  // Analyze Button

  analyzeButton.addEventListener("click", () => {
    const pga = mapState.pga;

    // Form Values

    const propertyTypeValue = propertyType.value;

    const buildingType = document.getElementById("buildingType").value;

    const stories = parseInt(document.getElementById("buildingStories").value);

    const seismicValue = seismicAssessment.value;

    // Selected Documents

    const selectedDocuments = [
      ...document.querySelectorAll(".document-item input:checked"),
    ].map((item) => item.value);

    // Validation

    if (isNaN(pga)) {
      riskResult.innerHTML = "Please select a map location first.";

      return;
    }

    if (!propertyTypeValue) {
      riskResult.innerHTML = "Please select property type.";

      return;
    }

    if (!buildingType) {
      riskResult.innerHTML = "Please select building type.";

      return;
    }

    if (!stories || stories <= 0) {
      riskResult.innerHTML = "Invalid number of stories.";

      return;
    }

    // Run Analysis

    const result = runRiskAnalysis({
      pga,

      propertyType: propertyTypeValue,

      buildingType,

      stories,

      seismicValue,

      selectedDocuments,
    });

    // Failed

    if (!result.success) {
      riskResult.innerHTML = result.message;

      return;
    }

    // Generate Report

    riskResult.innerHTML = generateRiskReport({
      pga,

      seismicity: result.seismicity,

      recommendation: result.recommendation,

      recommendationType: result.recommendationType,

      propertyType: propertyTypeValue,

      buildingType,

      stories,

      seismicValue,

      selectedDocuments,

      nearestFault: mapState.nearestFault,
    });
  });
}
