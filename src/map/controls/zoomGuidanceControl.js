import L from "leaflet";

const MIN_PGA_ZOOM = 4;
const PRECISE_PGA_ZOOM = 6;

const GUIDANCE_STATES = {
  warning: {
    message:
      "⚠️ Zoom to level 4+ for PGA values",
    borderColor:
      "rgba(239, 68, 68, 0.25)",
  },

  info: {
    message:
      "ℹ️ Zoom to level 6+ for precise PGA values",
    borderColor:
      "rgba(245, 158, 11, 0.25)",
  },

  success: {
    message:
      "✓ Optimal zoom level for PGA analysis",
    borderColor:
      "rgba(34, 197, 94, 0.22)",
  },
};

/* Get guidance state */
function getGuidanceState(zoom) {
  if (zoom < MIN_PGA_ZOOM) {
    return GUIDANCE_STATES.warning;
  }

  if (zoom < PRECISE_PGA_ZOOM) {
    return GUIDANCE_STATES.info;
  }

  return GUIDANCE_STATES.success;
}

/* Create zoom guidance control */
export function createZoomGuidanceControl(
  map,
) {
  const ZoomGuidanceControl =
    L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd() {
        const container =
          L.DomUtil.create(
            "div",
            "zoom-guidance-control",
          );

        L.DomEvent.disableClickPropagation(
          container,
        );

        const updateGuidance = () => {
          const zoom =
            map.getZoom();

          const state =
            getGuidanceState(
              zoom,
            );

          container.textContent =
            state.message;

          container.style.borderColor =
            state.borderColor;
        };

        updateGuidance();

        map.on(
          "zoomend",
          updateGuidance,
        );

        return container;
      },
    });

  map.addControl(
    new ZoomGuidanceControl(),
  );
}