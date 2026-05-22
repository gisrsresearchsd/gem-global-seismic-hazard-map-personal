import L from "leaflet";

/* Layer control refs */
let layerRefs = null;

/* Toggle layer safely */
function toggleLayerVisibility(
  map,
  layer,
  visible,
) {
  if (!layer) {
    return;
  }

  if (visible) {
    if (!map.hasLayer(layer)) {
      layer.addTo(map);
    }
    return;
  }

  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
  }
}

/* Slider state */
function setSliderState(
  slider,
  enabled,
) {
  if (!slider) {
    return;
  }

  slider.disabled = !enabled;
}

/* Sync UI from actual map state */
function syncLayerUI(map) {
  if (!layerRefs) {
    return;
  }

  const {
    pgaLayer,
    faultLayer,
    countryLayer,
    pgaToggle,
    faultToggle,
    countryToggle,
    opacitySlider,
  } = layerRefs;

  pgaToggle.checked =
    map.hasLayer(pgaLayer);

  countryToggle.checked =
    map.hasLayer(
      countryLayer,
    );

  const canUseFault =
    map.getZoom() >= 4;

  faultToggle.disabled =
    !canUseFault;

  faultToggle.checked =
    canUseFault &&
    map.hasLayer(
      faultLayer,
    );

  setSliderState(
    opacitySlider,
    pgaToggle.checked,
  );
}

/* Reset layer state */
export function resetLayerControl(
  map,
) {
  if (!layerRefs) {
    return;
  }

  const {
    pgaLayer,
    faultLayer,
    countryLayer,
    pgaToggle,
    faultToggle,
    countryToggle,
    opacitySlider,
  } = layerRefs;

  toggleLayerVisibility(
    map,
    pgaLayer,
    true,
  );

  toggleLayerVisibility(
    map,
    countryLayer,
    true,
  );

  if (map.getZoom() >= 4) {
    toggleLayerVisibility(
      map,
      faultLayer,
      true,
    );
  }

  pgaLayer.setOpacity?.(
    0.75,
  );

  opacitySlider.value =
    75;

  pgaToggle.checked =
    true;

  countryToggle.checked =
    true;

  syncLayerUI(map);
}

/* Create control */
export function createLayerControl({
  map,
  pgaLayer,
  faultLayer,
  countryLayer,
}) {
  const layerControl =
    L.control({
      position:
        "bottomright",
    });

  layerControl.onAdd =
    function () {
      const container =
        L.DomUtil.create(
          "div",
          "hazard-layer-control",
        );

      container.innerHTML =
        `
        <h4 class="layer-title">Layers</h4>

        <label class="layer-toggle-row">
          <input type="checkbox" id="toggle-pga" checked />
          <span class="layer-label">PGA Layer</span>
        </label>

        <label class="layer-toggle-row">
          <input type="checkbox" id="toggle-fault" checked />
          <span class="layer-label">Fault Lines</span>
        </label>

        <label class="layer-toggle-row">
          <input type="checkbox" id="toggle-country" checked />
          <span class="layer-label">Country Map</span>
        </label>

        <div class="layer-opacity-section">
          <span class="layer-opacity-label">
            PGA Opacity
          </span>

          <input
            type="range"
            id="pga-opacity"
            min="0"
            max="100"
            value="75"
          />
        </div>
      `;

      L.DomEvent.disableClickPropagation(
        container,
      );

      L.DomEvent.disableScrollPropagation(
        container,
      );

      const pgaToggle =
        container.querySelector(
          "#toggle-pga",
        );

      const faultToggle =
        container.querySelector(
          "#toggle-fault",
        );

      const countryToggle =
        container.querySelector(
          "#toggle-country",
        );

      const opacitySlider =
        container.querySelector(
          "#pga-opacity",
        );

      layerRefs = {
        pgaLayer,
        faultLayer,
        countryLayer,
        pgaToggle,
        faultToggle,
        countryToggle,
        opacitySlider,
      };

      map.on(
        "zoomend",
        () => syncLayerUI(map),
      );

      /* PGA */
      pgaToggle.addEventListener(
        "change",
        (event) => {
          const visible =
            event.target
              .checked;

          toggleLayerVisibility(
            map,
            pgaLayer,
            visible,
          );

          setSliderState(
            opacitySlider,
            visible,
          );
        },
      );

      /* Fault */
      faultToggle.addEventListener(
        "change",
        (event) => {
          toggleLayerVisibility(
            map,
            faultLayer,
            event.target
              .checked,
          );
        },
      );

      /* Country */
      countryToggle.addEventListener(
        "change",
        (event) => {
          toggleLayerVisibility(
            map,
            countryLayer,
            event.target
              .checked,
          );
        },
      );

      /* Opacity */
      opacitySlider.addEventListener(
        "input",
        (event) => {
          pgaLayer.setOpacity?.(
            Number(
              event.target
                .value,
            ) / 100,
          );
        },
      );

      syncLayerUI(map);

      return container;
    };

  return layerControl;
}