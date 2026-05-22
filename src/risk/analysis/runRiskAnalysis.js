import { getSeismicClassification } from "../../utils/seismicUtils";
import { getDocumentChecks } from "./documentChecks";

import {
  RECOMMENDATION_TYPES,
  BUILDING_TYPES,
  PROPERTY_TYPES,
  RISK_THRESHOLDS,
} from "./riskConstants";

/* Run risk analysis */
export function runRiskAnalysis({
  pga,
  propertyType,
  buildingType,
  stories,
  hasExistingSeismicAssessment,
  selectedDocuments,
}) {
  const numericPga = Number(pga);
  const storyCount = Number(stories);

  /* Validate input */
  const validationError = validateAnalysisInput({
    pga: numericPga,
    propertyType,
    buildingType,
    stories: storyCount,
  });

  if (validationError) {
    return validationError;
  }

  /* Seismic classification */
  const seismicData = getSeismicClassification(numericPga);

  /* Document checks */
  const {
    hasTier1Documents,
    hasPeerReviewDocuments,
    hasOnlyStructuralReport,
    hasAllTier3Documents,
    hasAnyTier3Documents,
    hasAnyRelevantDocuments,
  } = getDocumentChecks(selectedDocuments);

  let result = createDefaultResult();

  /* Lease renewal */
  if (
    propertyType === PROPERTY_TYPES.LEASE_RENEWAL &&
    hasExistingSeismicAssessment
  ) {
    result = createResult(
      "Submit Document",
      RECOMMENDATION_TYPES.SUBMIT_DOCUMENT,
    );
  } else if (hasOnlyStructuralReport) {

  /* High-level review */
    result = createResult(
      "High-Level Review – See Note 1",
      RECOMMENDATION_TYPES.HIGH_LEVEL_REVIEW,
    );
  } else if (hasPeerReviewDocuments) {

  /* Peer review */
    result = createResult(
      "Peer Review – See Note 2",
      RECOMMENDATION_TYPES.PEER_REVIEW,
    );
  } else if (

  /* Tier 3 */
    shouldRunTier3({
      buildingType,
      pga: numericPga,
      stories: storyCount,
    })
  ) {
    if (hasAllTier3Documents) {
      result = createResult(
        "ASCE41 Tier 3 - See Note 4",
        RECOMMENDATION_TYPES.TIER_3,
      );
    } else if (hasAnyTier3Documents) {
      result = createResult(
        "ASCE41 Tier 3 - See Note 4 (Insufficient Document)",
        RECOMMENDATION_TYPES.TIER_3,
      );
    }
  } else if (

  /* Tier 1 */
    shouldRunTier1({
      buildingType,
      pga: numericPga,
      stories: storyCount,
    })
  ) {
    if (hasTier1Documents) {
      result = createResult(
        "ASCE41 Tier 1 - See Note 3",
        RECOMMENDATION_TYPES.TIER_1,
      );
    } else if (hasAnyRelevantDocuments) {
      result = createResult(
        "ASCE41 Tier 1 - Insufficient Document",
        RECOMMENDATION_TYPES.TIER_1,
      );
    }
  }

  return {
    success: true,
    seismicity: seismicData?.label || "Unknown",
    recommendation: result.recommendation,
    recommendationType: result.recommendationType,
  };
}

/* Validate analysis input */
function validateAnalysisInput({ pga, propertyType, buildingType, stories }) {
  if (!propertyType || !buildingType) {
    return {
      success: false,
      message: "Please complete all required fields.",
    };
  }

  if (!Number.isFinite(stories) || stories < 1) {
    return {
      success: false,
      message: "Please enter a valid number of stories.",
    };
  }

  if (!Number.isFinite(pga)) {
    return {
      success: false,
      message: "Please select the land area.",
    };
  }

  if (pga >= 0 && pga < RISK_THRESHOLDS.PGA_MINIMUM) {
    return {
      success: false,
      message: "PGA value is less than 0.01g",
    };
  }

  return null;
}

/* Default result */
function createDefaultResult() {
  return createResult(
    "Available documentation is not sufficient. Please see Notes Sheet to see the list of required documentation for each type of analysis.",
    RECOMMENDATION_TYPES.DEFAULT,
  );
}

/* Result helper */
function createResult(recommendation, recommendationType) {
  return {
    recommendation,
    recommendationType,
  };
}

/* Tier 3 rules */
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

/* Tier 1 rules */
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
