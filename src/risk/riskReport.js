
// Generate Risk Report HTML

export function generateRiskReport({
  pga,
  seismicity,
  recommendation,
  recommendationType,
  propertyType,
  buildingType,
  stories,
  seismicValue,
  selectedDocuments,
  nearestFault,
}) {
  // Report Color

  const reportColor =
    recommendationType === "tier3"
      ? "#ef4444"
      : recommendationType === "tier2"
        ? "#f59e0b"
        : "#22c55e";

  // Building Display

  const buildingLabel =
    buildingType === "URM"
      ? "Unreinforced Masonry"
      : buildingType === "RC"
        ? "RC Frame / Steel"
        : buildingType;

  return `
  
    <div class="report-card">

      <!-- PGA -->

      <div class="report-row">

        <span class="report-label">
          PGA
        </span>

        <span class="report-value">
          ${pga.toFixed(4)} g
        </span>

      </div>

      <!-- Seismicity -->

      <div class="report-row">

        <span class="report-label">
          Seismicity
        </span>

        <span class="report-value">
          ${seismicity}
        </span>

      </div>

      <!-- Fault -->

      <div class="report-row">

        <span class="report-label">
          Nearest Fault
        </span>

        <span class="report-value">
          ${
  nearestFault &&
  nearestFault.name

    ? `${nearestFault.name}
       (${Number(
         nearestFault.distance
       ).toFixed(2)} km)`

    : '--'
}
        </span>

      </div>

      <!-- Property -->

      <div class="report-row">

        <span class="report-label">
          Property Type
        </span>

        <span class="report-value">
          ${propertyType}
        </span>

      </div>

      <!-- Building -->

      <div class="report-row">

        <span class="report-label">
          Building
        </span>

        <span class="report-value">
          ${buildingLabel}
        </span>

      </div>

      <!-- Stories -->

      <div class="report-row">

        <span class="report-label">
          Stories
        </span>

        <span class="report-value">
          ${stories}
        </span>

      </div>

      ${
        propertyType === "Lease Renewal"
          ? `

        <div class="report-row">

          <span class="report-label">
            WB Assessment
          </span>

          <span class="report-value">
            ${
              seismicValue === "yes"
                ? "Yes"
                : seismicValue === "no"
                  ? "No"
                  : "--"
            }
          </span>

        </div>

      `
          : ""
      }

      ${
        selectedDocuments.length
          ? `

        <div class="report-documents">

          <div class="report-doc-title">
            Documents
          </div>

          <ul>

            ${selectedDocuments.map((doc) => `<li>${doc}</li>`).join("")}

          </ul>

        </div>

      `
          : ""
      }

      <!-- Recommendation -->

      <div
        class="report-recommendation"
        style="
          border-color:
          ${reportColor};
        "
      >

        ${recommendation}

      </div>

    </div>
  `;
}
