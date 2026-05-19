import { mapState } from "../../state/mapState";
import { runRiskAnalysis } from "../analysis/runRiskAnalysis";
import { generateRiskReport } from "../reports/riskReport";
import { validateRiskForm } from "../../ui/validation/validateRiskForm";

// Initialize Analysis Handler

export function initializeAnalysisHandler({
  analyzeButton,
  propertyType,
  buildingTypeElement,
  storiesElement,
  seismicAssessment,
  validationMessage,
  riskResult,
  reportSection,
  reportToggleBtn,
}) {
  if (!analyzeButton) {
    return;
  }

  // Prevent duplicate click handlers
  analyzeButton.onclick = () => {
    clearValidationUI({
      validationMessage,
      propertyType,
      buildingTypeElement,
      storiesElement,
    });

    const formData = getFormData({
      propertyType,
      buildingTypeElement,
      storiesElement,
      seismicAssessment,
    });

    const validation = validateRiskForm(formData);

    if (!validation.valid) {
      showValidationError({
        validation,
        validationMessage,
        propertyType,
        buildingTypeElement,
        storiesElement,
      });

      return;
    }

    const selectedDocuments = getSelectedDocuments();

    const result = runRiskAnalysis({
      ...formData,
      selectedDocuments,
    });

    if (!result?.success) {
      showMessage(
        validationMessage,
        result?.message || "Risk analysis failed.",
      );
      return;
    }

    renderRiskReport({
      riskResult,
      formData,
      result,
      selectedDocuments,
    });

    expandReportSection({
      reportSection,
      reportToggleBtn,
    });
  };
}

// Form Data

function getFormData({
  propertyType,
  buildingTypeElement,
  storiesElement,
  seismicAssessment,
}) {
  return {
    pga: mapState?.analysis?.pga ?? null,
    propertyType: propertyType?.value || null,
    buildingType: buildingTypeElement?.value || null,
    stories: storiesElement?.value || null,
    hasExistingSeismicAssessment: seismicAssessment?.value === "yes",
  };
}

// Selected Documents

function getSelectedDocuments() {
  return Array.from(
    document.querySelectorAll(".document-item input:checked"),
  ).map((item) => item.value);
}

// Render Risk Report

function renderRiskReport({ riskResult, formData, result, selectedDocuments }) {
  if (!riskResult) {
    return;
  }

  riskResult.innerHTML = generateRiskReport({
    pga: formData.pga,
    seismicity: result.seismicity,
    recommendation: result.recommendation,
    recommendationType: result.recommendationType,
    propertyType: formData.propertyType,
    buildingType: formData.buildingType,
    stories: formData.stories,
    hasExistingSeismicAssessment: formData.hasExistingSeismicAssessment,
    selectedDocuments,
    nearestFault: mapState?.analysis?.nearestFault ?? null,
  });
}

// Validation UI

function clearValidationUI({
  validationMessage,
  propertyType,
  buildingTypeElement,
  storiesElement,
}) {
  showMessage(validationMessage, "");

  propertyType?.classList.remove("field-error");
  buildingTypeElement?.classList.remove("field-error");
  storiesElement?.classList.remove("field-error");
}

function showValidationError({
  validation,
  validationMessage,
  propertyType,
  buildingTypeElement,
  storiesElement,
}) {
  showMessage(validationMessage, validation?.message || "Validation failed.");

  switch (validation?.field) {
    case "propertyType":
      propertyType?.classList.add("field-error");
      break;

    case "buildingType":
      buildingTypeElement?.classList.add("field-error");
      break;

    case "stories":
      storiesElement?.classList.add("field-error");
      break;

    default:
      break;
  }
}

// Message Helper

function showMessage(element, message) {
  if (!element) {
    return;
  }

  // Safer than innerHTML
  element.textContent = message;
}

// Expand Report Section

function expandReportSection({ reportSection, reportToggleBtn }) {
  if (!reportSection || !reportSection.classList.contains("collapsed")) {
    return;
  }

  reportSection.classList.remove("collapsed");

  if (reportToggleBtn) {
    reportToggleBtn.textContent = "−";
  }
}
