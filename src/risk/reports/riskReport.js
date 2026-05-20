import {
  escapeHtml,
  createReportRow,
  formatBuildingType,
  formatFaultLabel,
  getRecommendationClass,
} from "./reportHelpers";

import { PROPERTY_TYPES } from "../analysis/riskConstants";

// Generate Risk Report

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

// Recommendation Section with Note Links
function generateRecommendationSection({
  recommendation,
  recommendationClass,
}) {
  // First escape the HTML to prevent XSS
  let recommendationHtml = escapeHtml(recommendation || "No Recommendation");
  
  // Replace "Note 1", "Note 2", etc. with clickable modal links
  recommendationHtml = recommendationHtml.replace(
    /(Note \d)/g,
    function(match) {
      const noteNumber = match;
      // Use window.openNoteModal (now available globally)
      return `<a href="#" onclick="window.openNoteModal('${noteNumber}'); return false;" class="note-link" style="color: #4ade80; text-decoration: underline; cursor: pointer; font-weight: 800; margin: 0 2px; display: inline-block;">${noteNumber}</a>`;
    }
  );
  
  return `
    <div class="report-top-row">
      <div class="report-badge ${escapeHtml(recommendationClass || "")}">
        ${recommendationHtml}
      </div>
    </div>
  `;
}

// Report Rows

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

  rows += createReportRow(
    "Nearest Seismic Source",
    escapeHtml(faultLabel || "Unknown"),
  );

  rows += createReportRow(
    "Property Type",
    escapeHtml(propertyType || "Unknown"),
  );

  rows += createReportRow(
    "Structural System",
    escapeHtml(buildingLabel || "Unknown"),
  );

  rows += createReportRow("Building Height", buildingHeight);

  if (propertyType === PROPERTY_TYPES.LEASE_RENEWAL) {
    rows += createReportRow(
      "Existing Assessment",
      hasExistingSeismicAssessment ? "Available" : "Not Available",
    );
  }

  return rows;
}

// Documents Section

function generateDocumentsSection(selectedDocuments = []) {
  const hasDocuments =
    Array.isArray(selectedDocuments) && selectedDocuments.length > 0;

  if (!hasDocuments) {
    return `
      <div class="report-documents">

        <div class="
          report-doc-title
        ">
          Selected Documentation
        </div>

        <div class="
          no-documents-message
        ">
          No documentation selected
        </div>

      </div>
    `;
  }

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
    <div class="report-documents">

      <div class="
        report-doc-title
      ">
        Selected Documentation
      </div>

      <ul>
        ${documentItems}
      </ul>

    </div>
  `;
}