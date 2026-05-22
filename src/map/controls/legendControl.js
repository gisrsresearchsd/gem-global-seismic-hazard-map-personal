import L from "leaflet";
import { PGA_LEGEND } from "../settings/hazardLegendConfig";

/* Create legend control */
export function createLegendControl(map) {
  const legendControl = L.control({
    position: "bottomright",
  });

  legendControl.onAdd = function () {
    const container = L.DomUtil.create("div", "hazard-legend");

    const title = document.createElement("h4");
    title.className = "legend-title";
    title.textContent = "PGA Hazard (g)";
    container.appendChild(title);

    PGA_LEGEND.forEach((item) => {
      const row = document.createElement("div");
      row.className = "legend-row";

      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";
      colorBox.style.background = `rgb(${item.color.join(",")})`;

      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = `${item.min} - ${item.max}`;

      row.appendChild(colorBox);
      row.appendChild(label);

      container.appendChild(row);
    });

    return container;
  };

  legendControl.addTo(map);
}
