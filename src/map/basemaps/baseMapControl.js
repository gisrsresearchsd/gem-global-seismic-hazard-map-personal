import L from 'leaflet';

import { BASE_MAPS } from './baseMaps';

// Create Custom Base Map Control

export function createBaseMapControl(
  map,
  activeOverlayLayers = []
) {

  const baseMapControl = L.control({
    position: 'topright',
  });

  baseMapControl.onAdd = function () {

    // Main Container

    const container = L.DomUtil.create(
      'div',
      'custom-basemap-control'
    );

    // Prevent Map Interaction

    L.DomEvent.disableClickPropagation(
      container
    );

    // Create Buttons

    Object.keys(BASE_MAPS).forEach(
      (baseMapName) => {

        const button = L.DomUtil.create(
          'button',
          'basemap-btn',
          container
        );

        button.innerHTML = baseMapName;

        // Default Active

        if (
          baseMapName ===
          'Light'
        ) {
          button.classList.add(
            'active'
          );
        }

        // Click Event

        button.addEventListener(
          'click',
          () => {

            // Remove ONLY basemaps

            Object.values(BASE_MAPS)
              .forEach((layer) => {

                if (
                  map.hasLayer(layer)
                ) {
                  map.removeLayer(layer);
                }
              });

            // Add Selected Basemap

            BASE_MAPS[
              baseMapName
            ].addTo(map);

            // Re-add overlays

            activeOverlayLayers
              .forEach((layer) => {

                if (
                  !map.hasLayer(layer)
                ) {
                  layer.addTo(map);
                }

                // Bring Overlay to Front

                if (
                  layer.bringToFront
                ) {
                  layer.bringToFront();
                }
              });

            // Active State

            const buttons =
              container.querySelectorAll(
                '.basemap-btn'
              );

            buttons.forEach((btn) => {
              btn.classList.remove(
                'active'
              );
            });

            button.classList.add(
              'active'
            );
          }
        );
      }
    );

    return container;
  };

  baseMapControl.addTo(map);
}