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

  // Invalid PGA

  if (isNaN(pga) || pga <= 0.01) {
    return {
      success: false,

      message: "PGA value is less than 0.01g",
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

  const hasGeotechnicalReport = selectedDocuments.includes(
    "Geotechnical report",
  );

  // Tier 1 Documents

  const hasTier1Documents =
    hasArchitecturalDrawings || hasStructuralAsBuilt ;

  // Peer Review Documents

  const hasPeerReviewDocuments =
    hasStructuralDesignReport &&
    hasArchitecturalDrawings &&
    hasStructuralAsBuilt;

  // High-Level Review

  const hasOnlyStructuralReport =
    hasStructuralDesignReport &&
    !hasArchitecturalDrawings &&
    !hasStructuralAsBuilt &&
    !hasGeotechnicalReport;

  // Tier 3 Documents Count

  const tier3DocCount =
    (hasArchitecturalDrawings ? 1 : 0) +
    (hasStructuralAsBuilt ? 1 : 0) +
    (hasGeotechnicalReport ? 1 : 0);

  // Default Result

  let recommendation =
    "Available documentation is not sufficient. Please see Notes Sheet to see the list of required documentation for each type of analysis.";

  let recommendationType = "tier2";

  // Lease Renewal

  if (propertyType === "Lease Renewal" && seismicValue === "yes") {
    recommendation = "Submit Document";

    recommendationType = "tier2";
  }

  // Peer Review
  else if (hasPeerReviewDocuments) {
    recommendation = "Peer Review – See Note 2";

    recommendationType = "tier2";
  }

  // High-Level Review
  else if (hasOnlyStructuralReport) {
    recommendation = "High-Level Review – See Note 1";

    recommendationType = "tier1";
  }

  // Tier 3
  else if (
    (buildingType === "URM" && pga > 0.01) ||
    (buildingType === "RC" &&
      ((pga >= 0.03 && pga < 0.08 && stories >= 13) ||
        (pga >= 0.08 && stories >= 9)))
  ) {
    // All Tier 3 Docs

    if (tier3DocCount === 3) {
      recommendation = "ASCE41 Tier 3 - See Note 4";
    } else {
      recommendation = "ASCE41 Tier 3 - See Note 4 (Insufficient Document)";
    }

    recommendationType = "tier3";
  }

  // Tier 1
  else if (
    buildingType === "RC" &&
    ((pga >= 0.01 && pga < 0.03) ||
      (pga >= 0.03 && pga < 0.08 && stories <= 12) ||
      (pga >= 0.08 && stories <= 8))
  ) {
    if (hasTier1Documents) {
      recommendation = "ASCE41 Tier 1 - See Note 3";

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
