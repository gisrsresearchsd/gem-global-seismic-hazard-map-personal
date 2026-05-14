import { getSeismicClassification } from "../utils/seismicUtils";

// Run Risk Analysis

export function runRiskAnalysis({
  pga,
  propertyType,
  buildingType,
  stories,
  seismicValue,
  selectedDocuments,
}) {
  // Validation

  if (!propertyType || !buildingType || !stories) {
    return {
      success: false,

      message: "Please complete all required fields.",
    };
  }

  // Document Checks

  const hasStructuralDesignReport = selectedDocuments.includes(
    "Structural design report",
  );
  const hasArchitecturalDrawings = selectedDocuments.includes(
    "Architectural drawings",
  );
  const hasStructuralAsBuilt = selectedDocuments.includes(
    "Structural as-built drawings",
  );
  const hasFloorPlan = selectedDocuments.includes(
    "Floor plan showing structural columns and walls location",
  );
  const hasDigitalModel = selectedDocuments.includes(
    "Digital structural model (ETABS or equivalent)",
  );
  const hasGeotechnicalReport = selectedDocuments.includes(
    "Geotechnical report",
  );

  // Peer Review
  const hasPeerReviewDocuments =
    hasStructuralDesignReport &&
    hasArchitecturalDrawings &&
    hasStructuralAsBuilt &&
    hasStructuralAsBuilt;

  // Tier 3 Docs
  const tier3DocCount =
    (hasArchitecturalDrawings ? 1 : 0) +
    (hasStructuralAsBuilt ? 1 : 0) +
    (hasGeotechnicalReport ? 1 : 0);

  // Default Result
  let recommendation = "Insufficient documentation";

  let recommendationType = "tier2";

  // Lease Renewal
  if (propertyType === "Lease Renewal" && seismicValue === "yes") {
    recommendation = "Submit Document";

    recommendationType = "tier2";
  }

  // Peer Review
  else if (hasPeerReviewDocuments) {
    recommendation = "Peer Review";

    recommendationType = "tier2";
  }

  // Tier 3
  else if (buildingType === "URM" && pga > 0.01) {
    recommendation =
      tier3DocCount >= 1
        ? "ASCE41 Tier 3"
        : "ASCE41 Tier 3 (Insufficient Document)";

    recommendationType = "tier3";
  }

  // RC Logic
  else if (buildingType === "RC") {
    // Tier 3

    if (
      (pga >= 0.03 && pga < 0.08 && stories >= 13) ||
      (pga >= 0.08 && stories >= 9)
    ) {
      recommendation =
        tier3DocCount >= 2
          ? "ASCE41 Tier 3"
          : "ASCE41 Tier 3 (Insufficient Document)";

      recommendationType = "tier3";
    }

    // Tier 1
    else {
      recommendation = "ASCE41 Tier 1";

      recommendationType = "tier1";
    }
  }

  return {
    success: true,

    seismicity: getSeismicClassification(pga).label,

    recommendation,

    recommendationType,
  };
}
