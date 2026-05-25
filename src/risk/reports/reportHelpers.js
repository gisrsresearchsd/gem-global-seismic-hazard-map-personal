import { BUILDING_TYPES } from "../analysis/riskConstants";

/* Escape HTML */
export function escapeHtml(text) {
  if (text === null || text === undefined) {
    return "";
  }

  const div = document.createElement("div");

  div.textContent = String(text);

  return div.innerHTML;
}

/* Create report row */
export function createReportRow(label, value) {
  return `
    <div class="report-row">
      <div class="report-label">
        ${escapeHtml(label)}
      </div>

      <div class="report-value">
        ${value}
      </div>
    </div>
  `;
}

/* Format building type */
export function formatBuildingType(buildingType) {
  switch (buildingType) {
    case BUILDING_TYPES.URM:
      return "Unreinforced Masonry / Wood";

    case BUILDING_TYPES.RC:
      return "RC Frame / Shear Wall / Steel";

    default:
      return buildingType || "Unknown";
  }
}

/* Format fault label */
export function formatFaultLabel(nearestFault) {
  if (!nearestFault || !nearestFault.name) {
    return "No nearby fault detected";
  }

  const numericDistance = Number(nearestFault.distance);

  const distance = Number.isFinite(numericDistance)
    ? `${numericDistance.toFixed(2)} km`
    : "Unknown distance";

  return `${nearestFault.name} (${distance})`;
}

/* Get recommendation badge class */
export function getRecommendationClass() {
  return "all-results-green";
}
