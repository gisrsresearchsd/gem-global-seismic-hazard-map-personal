import L from "leaflet";

export function createLayerControl({
  map,
  pgaLayer,
  faultLayer,
  countryLayer,
}) {
  const layerControl = L.control({
    position: "bottomright",
  });

  layerControl.onAdd = function () {
    const container = L.DomUtil.create(
      "div",
      "hazard-layer-control"
    );

    container.innerHTML = `
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

    // Prevent map drag / zoom when interacting
    L.DomEvent.disableClickPropagation(
      container
    );
    L.DomEvent.disableScrollPropagation(
      container
    );

    /*
    =====================
    DOM refs
    =====================
    */
    const pgaToggle =
      container.querySelector(
        "#toggle-pga"
      );

    const faultToggle =
      container.querySelector(
        "#toggle-fault"
      );

    const countryToggle =
      container.querySelector(
        "#toggle-country"
      );

    const opacitySlider =
      container.querySelector(
        "#pga-opacity"
      );

    /*
    =====================
    Initial PGA state
    =====================
    */
    pgaLayer.setOpacity?.(0.75);

    /*
    =====================
    Fault Zoom Sync
    Disabled below zoom 4
    =====================
    */
    function updateFaultToggleState() {
      const zoom =
        map.getZoom();

      const canUseFault =
        zoom >= 4;

      // disable checkbox
      faultToggle.disabled =
        !canUseFault;

      // keep UI synced
      if (!canUseFault) {
        faultToggle.checked =
          false;
      } else {
        faultToggle.checked =
          map.hasLayer(
            faultLayer
          );
      }
    }

    updateFaultToggleState();

    map.on(
      "zoomend",
      updateFaultToggleState
    );

    /*
    =====================
    PGA Toggle
    =====================
    */
    pgaToggle.addEventListener(
      "change",
      (e) => {
        const visible =
          e.target.checked;

        if (visible) {
          if (
            !map.hasLayer(
              pgaLayer
            )
          ) {
            pgaLayer.addTo(map);
          }

          opacitySlider.disabled =
            false;
        } else {
          if (
            map.hasLayer(
              pgaLayer
            )
          ) {
            map.removeLayer(
              pgaLayer
            );
          }

          opacitySlider.disabled =
            true;
        }
      }
    );

    /*
    =====================
    Fault Toggle
    Works only zoom >= 4
    =====================
    */
    faultToggle.addEventListener(
      "change",
      (e) => {
        const visible =
          e.target.checked;

        if (visible) {
          if (
            !map.hasLayer(
              faultLayer
            )
          ) {
            faultLayer.addTo(
              map
            );
          }
        } else {
          if (
            map.hasLayer(
              faultLayer
            )
          ) {
            map.removeLayer(
              faultLayer
            );
          }
        }
      }
    );

    /*
    =====================
    Country Toggle
    =====================
    */
    countryToggle.addEventListener(
      "change",
      (e) => {
        const visible =
          e.target.checked;

        if (visible) {
          if (
            !map.hasLayer(
              countryLayer
            )
          ) {
            countryLayer.addTo(
              map
            );
          }
        } else {
          if (
            map.hasLayer(
              countryLayer
            )
          ) {
            map.removeLayer(
              countryLayer
            );
          }
        }
      }
    );

    /*
    =====================
    PGA Opacity
    =====================
    */
    opacitySlider.addEventListener(
      "input",
      (e) => {
        const opacity =
          Number(
            e.target.value
          ) / 100;

        pgaLayer.setOpacity?.(
          opacity
        );
      }
    );

    return container;
  };

  return layerControl;
}