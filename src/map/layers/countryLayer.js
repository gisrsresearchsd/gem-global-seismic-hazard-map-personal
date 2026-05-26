import L from "leaflet";

/* Singleton */
let countryLayer = null;

/* Styles */
const DEFAULT_COUNTRY_STYLE = {
  color: "#64748b",
  weight: 1,
  fillOpacity: 0,
};

const HOVER_COUNTRY_STYLE = {
  color: "#2563eb",
  weight: 2,
};

/* Safe country name */
function getCountryName(feature) {
  return (
    feature?.properties?.ADMIN ||
    feature?.properties?.name ||
    feature?.properties?.NAME ||
    "Unknown Country"
  );
}

/* Load country layer */
export async function loadCountryLayer(map) {
  if (countryLayer) {
    return countryLayer;
  }

  try {
    const url =
      "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    const trimmedText = text.trim().toLowerCase();

    if (
      trimmedText.startsWith("<!doctype") ||
      trimmedText.startsWith("<html")
    ) {
      throw new Error("GeoJSON URL returned HTML instead of JSON");
    }

    const geojson = JSON.parse(text);

    countryLayer = L.geoJSON(geojson, {
      style: DEFAULT_COUNTRY_STYLE,

      onEachFeature(feature, layer) {
        const originalStyle = {
          color: "#64748b",
          weight: 1,
          fillOpacity: 0,
        };

        layer.bindTooltip(getCountryName(feature), {
          sticky: true,
        });

        layer.on("mouseover", () => {
          layer.setStyle({
            color: "#2563eb",
            weight: 2,
          });
        });

        layer.on("mouseout", () => {
          layer.setStyle(originalStyle);
        });
      },
    });

    

    return countryLayer;
  } catch (error) {
    console.error("Country layer error:", error);

    return null;
  }
}
