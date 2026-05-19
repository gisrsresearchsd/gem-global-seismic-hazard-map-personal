// Get Seismic Classification
export function getSeismicClassification(pga) {
  // Invalid

  if (pga === null || isNaN(pga)) {
    return {
      level: null,
      label: "No Data",
      colorClass: "",
    };
  }

  // Negligible
  if (pga >= 0 && pga <= 0.01) {
    return {
      level: "negligible",
      label: "Negligible",
      colorClass: "negligible",
    };
  }

  // Low
  if (pga > 0.01 && pga < 0.03) {
    return {
      level: "low",
      label: "Low Risk",
      colorClass: "low",
    };
  }

  // Moderate
  if (pga >= 0.03 && pga < 0.08) {
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
