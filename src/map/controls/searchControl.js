import L from 'leaflet';

// Active Marker

let activeMarker = null;

// Create Search Control

export function createSearchControl(
  map,
  onLocationSelect
) {

  const searchControl =
    L.control({
      position: 'topleft',
    });

  searchControl.onAdd =
    function () {

      // Container

      const container =
        L.DomUtil.create(
          'div',
          'search-control'
        );

      // Prevent Map Drag

      L.DomEvent.disableClickPropagation(
        container
      );

      // Input

      const input =
        document.createElement(
          'input'
        );

      input.type = 'text';

      input.placeholder =
        'Search place or lat,lng';

      input.className =
        'search-input';

      container.appendChild(
        input
      );

      // Search on Enter

      input.addEventListener(
        'keydown',
        async (event) => {

          if (
            event.key !== 'Enter'
          ) {
            return;
          }

          const query =
            input.value.trim();

          if (!query) {
            return;
          }

          // Coordinate Search

          const coordinateMatch =
            query.match(
              /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/
            );

          if (coordinateMatch) {

            const lat =
              parseFloat(
                coordinateMatch[1]
              );

            const lng =
              parseFloat(
                coordinateMatch[3]
              );

            flyToLocation(
              lat,
              lng
            );

            return;
          }

          // Nominatim Search

          try {

            const response =
  await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
    {
      headers: {
        'User-Agent':
          'eq-hazard-gem',
      },
    }
  );
            const results =
              await response.json();

            if (
              !results.length
            ) {

              alert(
                'Location not found'
              );

              return;
            }

            const result =
              results[0];

            const lat =
              parseFloat(
                result.lat
              );

            const lng =
              parseFloat(
                result.lon
              );

            flyToLocation(
              lat,
              lng
            );

          } catch (error) {

            console.error(
              'Search failed:',
              error
            );
          }
        }
      );

      return container;

      // Fly Function

      function flyToLocation(
        lat,
        lng
      ) {

        // Zoom

        map.flyTo(
          [lat, lng],
          8,
          {
            duration: 2,
          }
        );

        // Remove Old Marker

        if (activeMarker) {

          map.removeLayer(
            activeMarker
          );
        }

        // Marker

        activeMarker =
          L.circleMarker(
            [lat, lng],
            {
              radius: 8,

              color: '#ffffff',

              weight: 2,

              fillColor:
                '#ff4d4f',

              fillOpacity: 1,

              pane:
                'overlayPane',
            }
          );

        activeMarker.addTo(map);

        // Trigger Analysis

        if (
          onLocationSelect
        ) {

          onLocationSelect(
  map,
  lat,
  lng
);
        }
      }
    };

  searchControl.addTo(map);
}