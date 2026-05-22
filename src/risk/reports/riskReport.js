import {
  escapeHtml,
  createReportRow,
  formatBuildingType,
  formatFaultLabel,
  getRecommendationClass,
} from "./reportHelpers";

import { PROPERTY_TYPES } from "../analysis/riskConstants";

/* Generate risk report */
export function generateRiskReport({
  pga,
  seismicity,
  recommendation,
  recommendationType,
  propertyType,
  buildingType,
  stories,
  hasExistingSeismicAssessment,
  selectedDocuments,
  nearestFault,
}) {
  const recommendationClass = getRecommendationClass(recommendationType);

  const buildingLabel = formatBuildingType(buildingType) || "Unknown";

  const faultLabel = formatFaultLabel(nearestFault) || "Unknown";

  const reportRows = generateReportRows({
    pga,
    seismicity,
    propertyType,
    buildingLabel,
    faultLabel,
    stories,
    hasExistingSeismicAssessment,
  });

  const documentsSection = generateDocumentsSection(selectedDocuments);

  return `
    <div class="report-card">
      ${generateRecommendationSection({
        recommendation,
        recommendationClass,
      })}

      <div class="report-body">
        ${reportRows}
      </div>

      ${documentsSection}
    </div>
  `;
}

/* Recommendation section */
function generateRecommendationSection({
  recommendation,
  recommendationClass,
}) {
  let recommendationHtml = escapeHtml(recommendation || "No Recommendation");

  // Convert "Note X" text to modal links
  recommendationHtml = recommendationHtml.replace(/(Note \d)/g, (match) => {
    return `
          <a
            href="#"
            onclick="window.openNoteModal('${match}'); return false;"
            class="note-link"
          >
            ${match}
          </a>
        `;
  });

  return `
    <div class="report-top-row">
      <div class="report-badge ${escapeHtml(recommendationClass || "")}">
        ${recommendationHtml}
      </div>
    </div>
  `;
}

/* Report detail rows */
function generateReportRows({
  pga,
  seismicity,
  propertyType,
  buildingLabel,
  faultLabel,
  stories,
  hasExistingSeismicAssessment,
}) {
  let rows = "";

  const numericPga = Number(pga);

  const formattedPga = Number.isFinite(numericPga)
    ? `${numericPga.toFixed(4)} g`
    : "Unavailable";

  const storyCount = Number(stories);

  const buildingHeight = Number.isFinite(storyCount)
    ? `${storyCount} stor${storyCount === 1 ? "y" : "ies"}`
    : "Unknown";

  rows += createReportRow("Peak Ground Acceleration", formattedPga);

  rows += createReportRow(
    "Seismic Hazard Level",
    escapeHtml(seismicity || "Unknown"),
  );

  rows += createReportRow("Nearest Seismic Source", escapeHtml(faultLabel));

  rows += createReportRow(
    "Property Type",
    escapeHtml(propertyType || "Unknown"),
  );

  rows += createReportRow("Structural System", escapeHtml(buildingLabel));

  rows += createReportRow("Building Height", buildingHeight);

  if (propertyType === PROPERTY_TYPES.LEASE_RENEWAL) {
    rows += createReportRow(
      "Existing Assessment",
      hasExistingSeismicAssessment ? "Available" : "Not Available",
    );
  }

  return rows;
}

/* Documents section */
function generateDocumentsSection(selectedDocuments = []) {
  const hasDocuments =
    Array.isArray(selectedDocuments) && selectedDocuments.length > 0;

  const documentContent = hasDocuments
    ? generateDocumentList(selectedDocuments)
    : `
        <div class="no-documents-message">
          No documentation selected
        </div>
      `;

  return `
    <div class="report-documents">
      <div class="report-doc-title">
        Selected Documentation
      </div>

      ${documentContent}
    </div>
  `;
}

/* Document list */
function generateDocumentList(selectedDocuments) {
  const documentItems = selectedDocuments
    .filter(Boolean)
    .map(
      (doc) => `
          <li>
            ${escapeHtml(doc)}
          </li>
        `,
    )
    .join("");

  return `
    <ul>
      ${documentItems}
    </ul>
  `;
}
