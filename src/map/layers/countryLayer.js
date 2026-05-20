import L from "leaflet";

export async function loadCountryLayer(
  map
) {
  try {
    const url =
      "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const text =
      await response.text();

    if (
      text
        .trim()
        .startsWith(
          "<!doctype"
        ) ||
      text
        .trim()
        .startsWith(
          "<html"
        )
    ) {
      throw new Error(
        "GeoJSON URL returned HTML instead of JSON"
      );
    }

    const geojson =
      JSON.parse(text);

    const countryLayer =
      L.geoJSON(
        geojson,
        {
          style: {
            color: "#64748b",
            weight: 1,
            fillOpacity: 0,
          },

          onEachFeature:
            (
              feature,
              layer
            ) => {
              const countryName =
                feature
                  .properties
                  ?.ADMIN ||
                feature
                  .properties
                  ?.name ||
                feature
                  .properties
                  ?.NAME ||
                "Unknown Country";

              // Hover label
              layer.bindTooltip(
                countryName,
                {
                  sticky:
                    true,
                }
              );

              // Hover highlight
              layer.on(
                "mouseover",
                () => {
                  layer.setStyle(
                    {
                      weight: 2,
                      color:
                        "#2563eb",
                    }
                  );
                }
              );

              // Reset style
              layer.on(
                "mouseout",
                () => {
                  countryLayer.resetStyle(
                    layer
                  );
                }
              );
            },
        }
      );

    countryLayer.addTo(
      map
    );

    console.log(
      "Country layer loaded"
    );

    return countryLayer;
  } catch (error) {
    console.error(
      "Country layer error:",
      error
    );
  }
}