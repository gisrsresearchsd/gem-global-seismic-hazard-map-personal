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
  // Recommendation Class

  const recommendationClass =
    recommendationType === "tier3"
      ? "tier3"
      : recommendationType === "tier2"
        ? "tier2"
        : "tier1";

  // Building Label

  const buildingLabel =
    buildingType === "URM"
      ? "Unreinforced Masonry"
      : buildingType === "RC"
        ? "RC Frame / Steel"
        : buildingType;

  // Fault Label

  const faultLabel =
    nearestFault && nearestFault.name
      ? `${nearestFault.name}
         (${Number(nearestFault.distance).toFixed(2)} km)`
      : "--";

  return `

    <div class="report-card">

      <!-- Recommendation -->

      <div class="report-top-row">

        <div
          class="
            report-badge
            ${recommendationClass}
          "
        >

          ${recommendation}

        </div>

      </div>

      <!-- Report Body -->

      <div class="report-body">

        <!-- PGA -->

        <div class="report-row">

          <div class="report-label">
            PGA
          </div>

          <div class="report-value">
            ${Number(pga).toFixed(4)} g
          </div>

        </div>

        <!-- Seismicity -->

        <div class="report-row">

          <div class="report-label">
            Seismicity
          </div>

          <div class="report-value">
            ${seismicity}
          </div>

        </div>

        <!-- Fault -->

        <div class="report-row">

          <div class="report-label">
            Nearest Fault
          </div>

          <div class="report-value">
            ${faultLabel}
          </div>

        </div>

        <!-- Property -->

        <div class="report-row">

          <div class="report-label">
            Property
          </div>

          <div class="report-value">
            ${propertyType}
          </div>

        </div>

        <!-- Building -->

        <div class="report-row">

          <div class="report-label">
            Building
          </div>

          <div class="report-value">
            ${buildingLabel}
          </div>

        </div>

        <!-- Stories -->

        <div class="report-row">

          <div class="report-label">
            Stories
          </div>

          <div class="report-value">
            ${stories}
          </div>

        </div>

        ${
          propertyType === "Lease Renewal"
            ? `

          <div class="report-row">

            <div class="report-label">
              WB Assessment
            </div>

            <div class="report-value">

              ${
                seismicValue === "yes"
                  ? "Yes"
                  : seismicValue === "no"
                    ? "No"
                    : "--"
              }

            </div>

          </div>

        `
            : ""
        }

        ${
          selectedDocuments.length
            ? `

          <div class="report-documents">

            <div
              class="
                report-doc-title
              "
            >

              Documents

            </div>

            <ul>

              ${selectedDocuments
                .map(
                  (doc) => `
                    <li>
                      ${doc}
                    </li>
                  `,
                )
                .join("")}

            </ul>

          </div>

        `
            : ""
        }

      </div>

    </div>
  `;
}
