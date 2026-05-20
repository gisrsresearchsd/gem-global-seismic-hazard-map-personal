// Recommendation Types
export const RECOMMENDATION_TYPES = Object.freeze({
  DEFAULT: "default",
  SUBMIT_DOCUMENT: "submitDocument",
  HIGH_LEVEL_REVIEW: "highLevelReview",
  PEER_REVIEW: "peerReview",
  TIER_1: "tier1",
  TIER_3: "tier3",
});

// Building Types
export const BUILDING_TYPES = Object.freeze({
  URM: "URM",
  RC: "RC",
});

// Property Types
export const PROPERTY_TYPES = Object.freeze({
  LEASE_RENEWAL: "Lease Renewal",
});

// Document Types
export const DOCUMENT_TYPES = Object.freeze({
  STRUCTURAL_DESIGN_REPORT: "Structural design report",
  ARCHITECTURAL_DRAWINGS: "Architectural drawings",
  STRUCTURAL_AS_BUILT: "Structural as-built drawings",
  FLOOR_PLAN: "Floor plan showing structural columns and walls location",
  DIGITAL_STRUCTURAL_MODEL: "Digital structural model (ETABS or equivalent)",
  INSPECTION_REPORTS: "Inspection/material testing reports",
  MAINTENANCE_RECORDS: "Building maintenance records",
  MEP_DOCUMENTATION:
    "Mechanical, Electrical and Plumbing (MEP) construction documentation",
  GEOTECHNICAL_REPORT: "Geotechnical report",
});

// Risk Thresholds
export const RISK_THRESHOLDS = Object.freeze({
  // PGA Thresholds
  PGA_MINIMUM: 0.01,
  PGA_MEDIUM: 0.03,
  PGA_HIGH: 0.08,

  // Tier 3 (RC)
  // Moderate PGA => >= 13 stories
  RC_TIER3_STORIES_MODERATE: 13,

  // High PGA => >= 9 stories
  RC_TIER3_STORIES_HIGH: 9,

  // Tier 1 (RC)
  // Low/Moderate PGA => <= 12 stories
  RC_TIER1_STORIES_LOW: 12,

  // High PGA => <= 8 stories
  RC_TIER1_STORIES_HIGH: 8,
});
