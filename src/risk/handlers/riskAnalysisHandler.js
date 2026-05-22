import { mapState } from "../../state/mapState";
import { runRiskAnalysis } from "../analysis/runRiskAnalysis";
import { generateRiskReport } from "../reports/riskReport";
import { validateRiskForm } from "../validation/validateRiskForm";

/* Initialize analysis handler */
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

  // Keep single click ownership
  analyzeButton.onclick = handleAnalysisClick;

  function handleAnalysisClick() {
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

    const validation =
      validateRiskForm(formData);

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

    const selectedDocuments =
      getSelectedDocuments();

    const result =
      runRiskAnalysis({
        ...formData,
        selectedDocuments,
      });

    if (!result?.success) {
      showMessage(
        validationMessage,
        result?.message ||
          "Risk analysis failed.",
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
  }
}

/* Get form data */
function getFormData({
  propertyType,
  buildingTypeElement,
  storiesElement,
  seismicAssessment,
}) {
  return {
    pga:
      mapState?.analysis?.pga ??
      null,

    propertyType:
      propertyType?.value ||
      null,

    buildingType:
      buildingTypeElement?.value ||
      null,

    stories:
      storiesElement?.value ||
      null,

    hasExistingSeismicAssessment:
      seismicAssessment?.value ===
      "yes",
  };
}

/* Get selected documents */
function getSelectedDocuments() {
  return Array.from(
    document.querySelectorAll(
      ".document-item input:checked",
    ),
  ).map(
    (item) => item.value,
  );
}

/* Render risk report */
function renderRiskReport({
  riskResult,
  formData,
  result,
  selectedDocuments,
}) {
  if (!riskResult) {
    return;
  }

  riskResult.innerHTML =
    generateRiskReport({
      pga: formData.pga,
      seismicity:
        result.seismicity,
      recommendation:
        result.recommendation,
      recommendationType:
        result.recommendationType,
      propertyType:
        formData.propertyType,
      buildingType:
        formData.buildingType,
      stories:
        formData.stories,
      hasExistingSeismicAssessment:
        formData.hasExistingSeismicAssessment,
      selectedDocuments,
      nearestFault:
        mapState?.analysis
          ?.nearestFault ??
        null,
    });
}

/* Clear validation UI */
function clearValidationUI({
  validationMessage,
  propertyType,
  buildingTypeElement,
  storiesElement,
}) {
  showMessage(
    validationMessage,
    "",
  );

  clearFieldErrors([
    propertyType,
    buildingTypeElement,
    storiesElement,
  ]);
}

/* Show validation error */
function showValidationError({
  validation,
  validationMessage,
  propertyType,
  buildingTypeElement,
  storiesElement,
}) {
  showMessage(
    validationMessage,
    validation?.message ||
      "Validation failed.",
  );

  switch (
    validation?.field
  ) {
    case "propertyType":
      propertyType?.classList.add(
        "field-error",
      );
      break;

    case "buildingType":
      buildingTypeElement?.classList.add(
        "field-error",
      );
      break;

    case "stories":
      storiesElement?.classList.add(
        "field-error",
      );
      break;

    default:
      break;
  }
}

/* Clear field errors */
function clearFieldErrors(
  elements,
) {
  elements.forEach(
    (element) => {
      element?.classList.remove(
        "field-error",
      );
    },
  );
}

/* Message helper */
function showMessage(
  element,
  message,
) {
  if (!element) {
    return;
  }

  element.textContent =
    message;
}

/* Expand report section */
function expandReportSection({
  reportSection,
  reportToggleBtn,
}) {
  if (
    !reportSection ||
    !reportSection.classList.contains(
      "collapsed",
    )
  ) {
    return;
  }

  reportSection.classList.remove(
    "collapsed",
  );

  if (
    reportToggleBtn
  ) {
    reportToggleBtn.textContent =
      "−";
  }
}