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

  const buildingLabel = formatBuildingType(buildingType);

  const faultLabel = formatFaultLabel(nearestFault);

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

// Recommendation Section

function generateRecommendationSection({
  recommendation,
  recommendationClass,
}) {
  return `
    <div class="report-top-row">

      <div class="
        report-badge
        ${recommendationClass}
      ">
        ${escapeHtml(recommendation)}
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

  rows += createReportRow(
    "Peak Ground Acceleration",
    `${Number(pga).toFixed(4)} g`,
  );

  rows += createReportRow("Seismic Hazard Level", escapeHtml(seismicity));

  rows += createReportRow("Nearest Seismic Source", escapeHtml(faultLabel));

  rows += createReportRow("Property Type", escapeHtml(propertyType));

  rows += createReportRow("Structural System", escapeHtml(buildingLabel));

  rows += createReportRow(
    "Building Height",
    `${stories} story${stories !== 1 ? "s" : ""}`,
  );

  if (propertyType === PROPERTY_TYPES.LEASE_RENEWAL) {
    rows += createReportRow(
      "Existing Assessment",

      hasExistingSeismicAssessment === "yes" ? "Available" : "Not Available",
    );
  }

  return rows;
}

// Documents Section

function generateDocumentsSection(selectedDocuments) {
  const hasDocuments = selectedDocuments && selectedDocuments.length > 0;

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
