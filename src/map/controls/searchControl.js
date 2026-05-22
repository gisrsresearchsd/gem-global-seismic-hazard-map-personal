import L from "leaflet";

import {
  createLocationMarker,
  clearLocationMarker,
} from "../utils/markerManager";

/* Constants */
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 8;
const MAX_CACHE_SIZE = 50;
const FLY_TO_ZOOM = 10;

/*
=====================
Debounce
=====================
*/
function debounce(func, wait) {
  let timeout;

  return function debouncedFunction(
    ...args
  ) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/*
=====================
Helpers
=====================
*/
function escapeHtml(
  text = ""
) {
  const div =
    document.createElement("div");

  div.textContent =
    String(text);

  return div.innerHTML;
}

function formatCoordinates(
  lat,
  lng
) {
  return (
    `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"}, ` +
    `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`
  );
}

function isValidCoordinate(
  lat,
  lng
) {
  return (
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function parseCoordinateInput(
  query
) {
  const patterns = [
    /^(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)$/,
    /^(-?\d+(?:\.\d+)?)°?[\s,]+(-?\d+(?:\.\d+)?)°?$/,
  ];

  for (const pattern of patterns) {
    const match =
      query.match(pattern);

    if (!match) {
      continue;
    }

    const lat = Number(
      match[1]
    );

    const lng = Number(
      match[2]
    );

    if (
      isValidCoordinate(
        lat,
        lng
      )
    ) {
      return {
        lat,
        lng,
        type: "coordinate",
      };
    }
  }

  return null;
}

/*
=====================
Search Control
=====================
*/
export function createSearchControl(
  map,
  onLocationSelect
) {
  const searchControl =
    L.control({
      position: "topleft",
    });

  searchControl.onAdd =
    function () {
      const container =
        L.DomUtil.create(
          "div",
          "search-control"
        );

      L.DomEvent.disableClickPropagation(
        container
      );

      /*
      ---------------------
      Wrapper
      ---------------------
      */
      const searchWrapper =
        L.DomUtil.create(
          "div",
          "search-wrapper",
          container
        );

      /*
      ---------------------
      Input
      ---------------------
      */
      const input =
        document.createElement(
          "input"
        );

      input.type = "text";
      input.className =
        "search-input";

      input.placeholder =
        "Search city, country, or coordinates...";

      searchWrapper.appendChild(
        input
      );

      /*
      ---------------------
      Suggestions
      ---------------------
      */
      const suggestionsDropdown =
        L.DomUtil.create(
          "div",
          "search-suggestions",
          searchWrapper
        );

      suggestionsDropdown.style.display =
        "none";

      /*
      ---------------------
      Loading
      ---------------------
      */
      const loadingIndicator =
        L.DomUtil.create(
          "div",
          "search-loading",
          searchWrapper
        );

      loadingIndicator.textContent =
        "🔍 Searching...";

      loadingIndicator.style.display =
        "none";

      /*
      ---------------------
      Clear button
      ---------------------
      */
      const clearBtn =
        L.DomUtil.create(
          "button",
          "search-clear-btn",
          searchWrapper
        );

      clearBtn.type =
        "button";

      clearBtn.textContent =
        "✕";

      clearBtn.style.display =
        "none";

      /*
      ---------------------
      State
      ---------------------
      */
      const suggestionCache =
        new Map();

      let currentRequest =
        null;

      let selectedIndex =
        -1;

      /*
      ---------------------
      UI helpers
      ---------------------
      */
      function showElement(
        element,
        displayType = "block"
      ) {
        element.style.display =
          displayType;
      }

      function hideElement(
        element
      ) {
        element.style.display =
          "none";
      }

      function hideSuggestions() {
        hideElement(
          suggestionsDropdown
        );

        selectedIndex =
          -1;
      }

      function updateSelectedItem(
        items
      ) {
        items.forEach(
          (
            item,
            index
          ) => {
            item.classList.toggle(
              "selected",
              index ===
                selectedIndex
            );

            if (
              index ===
              selectedIndex
            ) {
              item.scrollIntoView(
                {
                  block:
                    "nearest",
                }
              );
            }
          }
        );
      }

      /*
      ---------------------
      Fetch suggestions
      ---------------------
      */
      async function fetchSuggestions(
        query
      ) {
        if (
          !query ||
          query.length < 2
        ) {
          hideSuggestions();
          hideElement(
            loadingIndicator
          );
          return [];
        }

        if (
          suggestionCache.has(
            query
          )
        ) {
          return suggestionCache.get(
            query
          );
        }

        showElement(
          loadingIndicator,
          "flex"
        );

        try {
          if (
            currentRequest
          ) {
            currentRequest.abort();
          }

          const controller =
            new AbortController();

          currentRequest =
            controller;

          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${SEARCH_LIMIT}&addressdetails=1&accept-language=en`,
              {
                signal:
                  controller.signal,
              }
            );

          const results =
            await response.json();

          suggestionCache.set(
            query,
            results
          );

          if (
            suggestionCache.size >
            MAX_CACHE_SIZE
          ) {
            const firstKey =
              suggestionCache
                .keys()
                .next().value;

            suggestionCache.delete(
              firstKey
            );
          }

          return results;
        } catch (error) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.error(
              "Search failed:",
              error
            );
          }

          return [];
        } finally {
          hideElement(
            loadingIndicator
          );

          currentRequest =
            null;
        }
      }

      /*
      ---------------------
      Move to location
      ---------------------
      */
      function flyToLocation(
        lat,
        lng
      ) {
        if (
          !isValidCoordinate(
            lat,
            lng
          )
        ) {
          return;
        }

        map.flyTo(
          [lat, lng],
          FLY_TO_ZOOM,
          {
            duration: 1.5,
            easeLinearity: 0.25,
          }
        );

        createLocationMarker(
          map,
          lat,
          lng
        );

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

      /*
      ---------------------
      Render suggestions
      ---------------------
      */
      function renderSuggestions(
        results
      ) {
        if (
          !results ||
          results.length === 0
        ) {
          hideSuggestions();
          return;
        }

        suggestionsDropdown.innerHTML =
          "";

        selectedIndex =
          -1;

        results.forEach(
          (
            result,
            index
          ) => {
            const suggestionItem =
              L.DomUtil.create(
                "div",
                "suggestion-item"
              );

            const displayName =
              result.display_name;

            const lat =
              Number(
                result.lat
              );

            const lng =
              Number(
                result.lon
              );

            const shortName =
              displayName.length >
              60
                ? `${displayName.substring(0, 57)}...`
                : displayName;

            suggestionItem.innerHTML = `
              <div class="suggestion-icon">📍</div>
              <div class="suggestion-content">
                <div class="suggestion-title">${escapeHtml(shortName)}</div>
                <div class="suggestion-subtitle">${formatCoordinates(lat, lng)}</div>
              </div>
            `;

            suggestionItem.addEventListener(
              "click",
              (
                event
              ) => {
                event.stopPropagation();

                input.value =
                  displayName;

                hideSuggestions();

                showElement(
                  clearBtn,
                  "flex"
                );

                flyToLocation(
                  lat,
                  lng
                );
              }
            );

            suggestionItem.addEventListener(
              "mouseenter",
              () => {
                const items =
                  suggestionsDropdown.querySelectorAll(
                    ".suggestion-item"
                  );

                items.forEach(
                  (
                    item
                  ) =>
                    item.classList.remove(
                      "selected"
                    )
                );

                suggestionItem.classList.add(
                  "selected"
                );

                selectedIndex =
                  index;
              }
            );

            suggestionsDropdown.appendChild(
              suggestionItem
            );
          }
        );

        showElement(
          suggestionsDropdown
        );
      }

      /*
      ---------------------
      Input
      ---------------------
      */
      const handleInput =
        debounce(
          async () => {
            const query =
              input.value.trim();

            if (!query) {
              hideSuggestions();
              hideElement(
                clearBtn
              );
              return;
            }

            showElement(
              clearBtn,
              "flex"
            );

            const coordResult =
              parseCoordinateInput(
                query
              );

            if (
              coordResult
            ) {
              hideSuggestions();

              flyToLocation(
                coordResult.lat,
                coordResult.lng
              );

              return;
            }

            const results =
              await fetchSuggestions(
                query
              );

            renderSuggestions(
              results
            );
          },
          SEARCH_DEBOUNCE_MS
        );

      input.addEventListener(
        "input",
        handleInput
      );

      /*
      ---------------------
      Keyboard
      ---------------------
      */
      input.addEventListener(
        "keydown",
        async (
          event
        ) => {
          const items =
            suggestionsDropdown.querySelectorAll(
              ".suggestion-item"
            );

          switch (
            event.key
          ) {
            case "ArrowDown":
              event.preventDefault();

              if (
                items.length >
                0
              ) {
                selectedIndex =
                  Math.min(
                    selectedIndex +
                      1,
                    items.length -
                      1
                  );

                updateSelectedItem(
                  items
                );
              }
              break;

            case "ArrowUp":
              event.preventDefault();

              if (
                items.length >
                0
              ) {
                selectedIndex =
                  Math.max(
                    selectedIndex -
                      1,
                    0
                  );

                updateSelectedItem(
                  items
                );
              }
              break;

            case "Enter":
              event.preventDefault();

              if (
                selectedIndex >=
                  0 &&
                items[
                  selectedIndex
                ]
              ) {
                items[
                  selectedIndex
                ].click();

                return;
              }

              if (
                !input.value.trim()
              ) {
                return;
              }

              hideSuggestions();

              const query =
                input.value.trim();

              const coordResult =
                parseCoordinateInput(
                  query
                );

              if (
                coordResult
              ) {
                flyToLocation(
                  coordResult.lat,
                  coordResult.lng
                );

                return;
              }

              const results =
                await fetchSuggestions(
                  query
                );

              if (
                results.length >
                0
              ) {
                const result =
                  results[0];

                flyToLocation(
                  Number(
                    result.lat
                  ),
                  Number(
                    result.lon
                  )
                );
              }
              break;

            case "Escape":
              hideSuggestions();
              break;

            default:
              break;
          }
        }
      );

      /*
      ---------------------
      Clear button
      ---------------------
      */
      clearBtn.addEventListener(
        "click",
        () => {
          input.value = "";

          hideSuggestions();

          hideElement(
            clearBtn
          );

          clearLocationMarker(
            map
          );

          input.focus();
        }
      );

      /*
      ---------------------
      Outside click
      ---------------------
      */
      const handleOutsideClick =
        (event) => {
          if (
            !container.contains(
              event.target
            )
          ) {
            hideSuggestions();
          }
        };

      document.addEventListener(
        "click",
        handleOutsideClick
      );

      return container;
    };

  searchControl.addTo(map);

  return searchControl;
}

/*
=====================
External cleanup
=====================
*/
export function clearSearchMarker(
  map
) {
  clearLocationMarker(map);
}