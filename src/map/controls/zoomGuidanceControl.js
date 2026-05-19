// src/map/controls/zoomGuidanceControl.js

import L from "leaflet";

// Create Zoom Guidance Control
export function createZoomGuidanceControl(map) {

  // Create Custom Control
  const ZoomGuidanceControl = L.Control.extend({

    options: {
      position: "topleft",
    },

    onAdd() {

      // Create Container
      const container = L.DomUtil.create(
        "div",
        "zoom-guidance-control"
      );

      // Initial Content
      container.innerHTML =
        "⚠️ Zoom to level 4+ for PGA values";

      // Prevent Map Interaction
      L.DomEvent.disableClickPropagation(container);

      // Update Guidance
      const updateGuidance = () => {

        const zoom = map.getZoom();

        // Low Zoom
        if (zoom < 4) {

          container.innerHTML =
            "⚠️ Zoom to level 4+ for PGA values";

          container.style.borderColor =
            "rgba(239, 68, 68, 0.25)";
        }

        // Medium Zoom
        else if (zoom < 6) {

          container.innerHTML =
            "ℹ️ Zoom to level 6+ for precise PGA values";

          container.style.borderColor =
            "rgba(245, 158, 11, 0.25)";
        }

        // Optimal Zoom
        else {

          container.innerHTML =
            "✓ Optimal zoom level for PGA analysis";

          container.style.borderColor =
            "rgba(34, 197, 94, 0.22)";
        }
      };

      // Initial Update
      updateGuidance();

      // Listen To Zoom
      map.on("zoomend", updateGuidance);

      return container;
    },
  });

  // Add Control To Map
  map.addControl(new ZoomGuidanceControl());
}