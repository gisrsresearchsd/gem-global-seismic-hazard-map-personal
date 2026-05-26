// analysisHandler.js - Zoom-aware location analysis

import L from "leaflet";

import {
  getPGAValue,
  isValidZoomForPGA,
  getZoomRecommendation,
} from "../layers/pgaLayer";

import { getNearestFault } from "../layers/faultLayer";
import { getSeismicClassification } from "../../utils/seismicUtils";
import { mapState } from "../../state/mapState";

import {
  createLocationMarker,
  clearLocationMarker,
} from "../utils/markerManager";

function getRiskElements() {
  return {
    riskPGA: document.getElementById("riskPGA"),
    riskLevel: document.getElementById("riskLevel"),
    riskFault: document.getElementById("riskFault"),
  };
}

/*
=====================
Popup Helper
=====================
*/
function showPopup(map, lat, lng, content) {
  map.closePopup();

  L.popup().setLatLng([lat, lng]).setContent(content).openOn(map);
}

/*
=====================
Map State Update
=====================
*/
function updateMapStateLocation(lat, lng, pga, classification, nearestFault) {
  mapState.location.lat = lat;
  mapState.location.lng = lng;

  mapState.analysis.pga = pga;

  mapState.analysis.classification = classification;

  mapState.analysis.nearestFault = nearestFault;
}

/*
=====================
Analysis UI Update
=====================
*/
function updateAnalysisUI({ formattedPGA, classification, nearestFault }) {
  const { riskPGA, riskLevel, riskFault } = getRiskElements();

  // Guard if panel not mounted yet
  if (!riskPGA || !riskLevel || !riskFault) {
    return;
  }

  riskPGA.textContent = `${formattedPGA} g`;

  riskLevel.className = "risk-badge";

  if (classification?.colorClass) {
    riskLevel.classList.add(classification.colorClass);
  }

  riskLevel.textContent = classification?.label || "No Data";

  riskFault.textContent = nearestFault
    ? `${nearestFault.name} (${nearestFault.distance.toFixed(2)} km)`
    : "--";
}

/*
=====================
Reset Analysis UI
=====================
*/
function resetAnalysisUI() {
  riskPGA.textContent = "--";

  riskLevel.className = "risk-badge";

  riskLevel.textContent = "No Data";

  riskFault.textContent = "--";
}

/*
=====================
Analyze Location
=====================
*/
export async function analyzeLocation(map, lat, lng) {
  try {
    const currentZoom = map.getZoom();

    /*
    ---------------------
    Validate Zoom
    ---------------------
    */
    if (!isValidZoomForPGA(currentZoom)) {
      const zoomWarning = getZoomRecommendation(currentZoom);

      riskPGA.textContent = "--";

      riskLevel.className = "risk-badge";

      riskLevel.textContent = "Zoom In Required";

      riskFault.textContent = "--";

      createLocationMarker(map, lat, lng);

      showPopup(map, lat, lng, `⚠️ ${zoomWarning.message}`);

      updateMapStateLocation(lat, lng, null, null, null);

      return;
    }

    /*
    ---------------------
    Create Shared Marker
    ---------------------
    */
    createLocationMarker(map, lat, lng);

    /*
    ---------------------
    PGA + Fault Query
    ---------------------
    */
    const pgaValue = await getPGAValue(lat, lng, currentZoom);

    const nearestFault = getNearestFault(map, lat, lng);

    /*
    ---------------------
    No PGA Data
    ---------------------
    */
    if (pgaValue === null || Number.isNaN(pgaValue)) {
      resetAnalysisUI();

      updateMapStateLocation(lat, lng, null, null, nearestFault);

      const zoomRec = getZoomRecommendation(currentZoom);

      if (zoomRec?.message) {
        showPopup(map, lat, lng, `ℹ️ ${zoomRec.message}`);
      }

      return;
    }

    /*
    ---------------------
    PGA Classification
    ---------------------
    */
    const classification = getSeismicClassification(pgaValue);

    const formattedPGA = Number(pgaValue).toFixed(4);

    updateMapStateLocation(lat, lng, pgaValue, classification, nearestFault);

    updateAnalysisUI({
      formattedPGA,
      classification,
      nearestFault,
    });

    /*
    ---------------------
    Popup
    ---------------------
    */
    const popupContent =
      currentZoom < 6
        ? `${formattedPGA} g (approx - zoom ${currentZoom})`
        : `${formattedPGA} g`;

    showPopup(map, lat, lng, popupContent);
  } catch (error) {
    console.error("Location analysis failed:", error);
  }
}

/*
=====================
External Clear
(resetControl / searchControl)
=====================
*/
export function clearAnalysisMarker(map) {
  clearLocationMarker(map);
}
