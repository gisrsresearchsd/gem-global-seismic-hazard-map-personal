import L from 'leaflet';

import {
  PGA_LEGEND,
} from '../config/hazardLegendConfig';

// Create Legend Control

export function createLegendControl(map) {

  const legendControl = L.control({
    position: 'bottomright',
  });

  legendControl.onAdd = function () {

    const container = L.DomUtil.create(
      'div',
      'hazard-legend'
    );

    // Title

    const title = document.createElement('h4');

    title.innerHTML = 'PGA Hazard (g)';

    title.className = 'legend-title';

    container.appendChild(title);

    // Legend Items

    PGA_LEGEND.forEach((item) => {

      const row = document.createElement('div');

      row.className = 'legend-row';

      // Color Box

      const colorBox =
        document.createElement('div');

      colorBox.className =
        'legend-color';

      colorBox.style.background =
        `rgb(${item.color.join(',')})`;

      // Label

      const label =
        document.createElement('span');

      label.className =
        'legend-label';

      label.innerHTML =
        `${item.min} - ${item.max}`;

      row.appendChild(colorBox);

      row.appendChild(label);

      container.appendChild(row);
    });

    return container;
  };

  legendControl.addTo(map);
}