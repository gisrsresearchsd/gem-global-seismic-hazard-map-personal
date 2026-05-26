import { RISK_THRESHOLDS } from "../risk/analysis/riskConstants";

// Get Seismic Classification

export function getSeismicClassification(pga) {
  const numericPga = Number(pga);
  const { PGA_MINIMUM, PGA_MEDIUM, PGA_HIGH } = RISK_THRESHOLDS || {};

  // Invalid value
  if (!Number.isFinite(numericPga) || numericPga < 0) {
    return {
      level: null,
      label: "No Data",
      colorClass: "none",
    };
  }

  // Too low (< threshold)
  if (numericPga >= 0 && numericPga < PGA_MINIMUM) {
    return {
      level: null,
      label: "Below Threshold",
      colorClass: "below-threshold",
    };
  }

  // Low
  if (numericPga >= PGA_MINIMUM && numericPga < PGA_MEDIUM) {
    return {
      level: "low",
      label: "Low Risk",
      colorClass: "low",
    };
  }

  // Moderate
  if (numericPga >= PGA_MEDIUM && numericPga < PGA_HIGH) {
    return {
      level: "moderate",
      label: "Moderate Risk",
      colorClass: "moderate",
    };
  }

  // High
  return {
    level: "high",
    label: "High Risk",
    colorClass: "high",
  };
}
