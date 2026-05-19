import { getSeismicClassification } from "../../utils/seismicUtils";
import { getDocumentChecks } from "./documentChecks";

import {
  RECOMMENDATION_TYPES,
  BUILDING_TYPES,
  PROPERTY_TYPES,
  RISK_THRESHOLDS,
} from "./riskConstants";

// Run Risk Analysis
export function runRiskAnalysis({
  pga,
  propertyType,
  buildingType,
  stories,
  hasExistingSeismicAssessment,
  selectedDocuments,
}) {
  // Validation
  const validationError = validateAnalysisInput({
    pga,
    propertyType,
    buildingType,
    stories,
  });

  if (validationError) {
    return validationError;
  }

  // Document Checks
  const {
    hasTier1Documents,
    hasPeerReviewDocuments,
    hasOnlyStructuralReport,
    hasAllTier3Documents,
    hasAnyTier3Documents,
    hasAnyRelevantDocuments,
  } = getDocumentChecks(selectedDocuments);

  // Default Result
  let result = {
    recommendation:
      "Available documentation is not sufficient. Please see Notes Sheet to see the list of required documentation for each type of analysis.",

    recommendationType: RECOMMENDATION_TYPES.DEFAULT,
  };

  // Lease Renewal
  if (
    propertyType === PROPERTY_TYPES.LEASE_RENEWAL &&
    hasExistingSeismicAssessment
  ) {
    result = createResult(
      "Submit Document",
      RECOMMENDATION_TYPES.SUBMIT_DOCUMENT,
    );
  }

  // High-Level Review
  else if (hasOnlyStructuralReport) {
    result = createResult(
      "High-Level Review – See Note 1",
      RECOMMENDATION_TYPES.HIGH_LEVEL_REVIEW,
    );
  }

  // Peer Review
  else if (hasPeerReviewDocuments) {
    result = createResult(
      "Peer Review – See Note 2",
      RECOMMENDATION_TYPES.PEER_REVIEW,
    );
  }

  // Tier 3
  else if (
    shouldRunTier3({
      buildingType,
      pga,
      stories,
    })
  ) {
    // Full Tier 3

    if (hasAllTier3Documents) {
      result = createResult(
        "ASCE41 Tier 3 - See Note 4",

        RECOMMENDATION_TYPES.TIER_3,
      );
    }

    // Partial Tier 3 Docs
    else if (hasAnyTier3Documents) {
      result = createResult(
        "ASCE41 Tier 3 - See Note 4 (Insufficient Document)",

        RECOMMENDATION_TYPES.TIER_3,
      );
    }
  }

  // Tier 1
  else if (
    shouldRunTier1({
      buildingType,
      pga,
      stories,
    })
  ) {
    // Valid Tier 1 Docs

    if (hasTier1Documents) {
      result = createResult(
        "ASCE41 Tier 1 - See Note 3",

        RECOMMENDATION_TYPES.TIER_1,
      );
    }

    // Wrong Documents Selected
    else if (hasAnyRelevantDocuments) {
      result = createResult(
        "ASCE41 Tier 1 - Insufficient Document",

        RECOMMENDATION_TYPES.TIER_1,
      );
    }
  }

  // Final Result

  return {
    success: true,
    seismicity: getSeismicClassification(pga).label,
    recommendation: result.recommendation,
    recommendationType: result.recommendationType,
  };
}

// Validation

function validateAnalysisInput({ pga, propertyType, buildingType, stories }) {
  if (!propertyType || !buildingType || !stories) {
    return {
      success: false,

      message: "Please complete all required fields.",
    };
  }

  if (isNaN(pga) || pga < RISK_THRESHOLDS.PGA_MINIMUM) {
    return {
      success: false,

      message: "PGA value is less than 0.01g",
    };
  }

  return null;
}

// Result Helper

function createResult(recommendation, recommendationType) {
  return {
    recommendation,

    recommendationType,
  };
}

// Tier 3 Rules

function shouldRunTier3({ buildingType, pga, stories }) {
  const {
    PGA_MINIMUM,
    PGA_MEDIUM,
    PGA_HIGH,

    RC_TIER3_STORIES_MODERATE,
    RC_TIER3_STORIES_HIGH,
  } = RISK_THRESHOLDS;

  return (
    (buildingType === BUILDING_TYPES.URM && pga > PGA_MINIMUM) ||
    (buildingType === BUILDING_TYPES.RC &&
      ((pga >= PGA_MEDIUM &&
        pga < PGA_HIGH &&
        stories >= RC_TIER3_STORIES_MODERATE) ||
        (pga >= PGA_HIGH && stories >= RC_TIER3_STORIES_HIGH)))
  );
}

// Tier 1 Rules

function shouldRunTier1({ buildingType, pga, stories }) {
  const {
    PGA_MINIMUM,
    PGA_MEDIUM,
    PGA_HIGH,

    RC_TIER1_STORIES_LOW,
    RC_TIER1_STORIES_HIGH,
  } = RISK_THRESHOLDS;

  return (
    buildingType === BUILDING_TYPES.RC &&
    ((pga >= PGA_MINIMUM && pga < PGA_MEDIUM) ||
      (pga >= PGA_MEDIUM &&
        pga < PGA_HIGH &&
        stories <= RC_TIER1_STORIES_LOW) ||
      (pga >= PGA_HIGH && stories <= RC_TIER1_STORIES_HIGH))
  );
}
