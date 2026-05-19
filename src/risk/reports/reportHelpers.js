import {
  BUILDING_TYPES,
  RECOMMENDATION_TYPES,
} from "../analysis/riskConstants";

// Escape HTML

export function escapeHtml(text) {
  if (!text) {
    return "";
  }

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// Create Report Row

export function createReportRow(label, value) {
  return `
    <div class="report-row">

      <div class="report-label">
        ${label}
      </div>

      <div class="report-value">
        ${value}
      </div>

    </div>
  `;
}

// Format Building Type

export function formatBuildingType(buildingType) {
  switch (buildingType) {
    case BUILDING_TYPES.URM:
      return "Unreinforced Masonry / Wood";

    case BUILDING_TYPES.RC:
      return "RC Frame / Shear Wall / Steel";

    default:
      return buildingType;
  }
}

// Format Fault Label

export function formatFaultLabel(nearestFault) {
  if (!nearestFault || !nearestFault.name) {
    return "No nearby fault detected";
  }

  const distance = Number(nearestFault.distance).toFixed(2);

  return `
    ${nearestFault.name}
    (${distance} km)
  `;
}

// Get Recommendation Class

export function getRecommendationClass(recommendationType) {
  switch (recommendationType) {
    case RECOMMENDATION_TYPES.TIER_3:
      return "tier3";

    case RECOMMENDATION_TYPES.TIER_2:
      return "tier2";

    default:
      return "tier1";
  }
}
