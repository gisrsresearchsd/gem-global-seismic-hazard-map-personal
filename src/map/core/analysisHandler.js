// analysisHandler.js - Add zoom-aware analysis

import L from "leaflet";
import { getPGAValue, isValidZoomForPGA, getZoomRecommendation } from "../layers/pgaLayer";
import { getNearestFault } from "../layers/faultLayer";
import { getSeismicClassification } from "../../utils/seismicUtils";
import { mapState } from "../../state/mapState";

const riskPGA = document.getElementById("riskPGA");
const riskLevel = document.getElementById("riskLevel");
const riskFault = document.getElementById("riskFault");

let activeMarker = null;
let activePulseMarker = null;

function createLocationMarker(lat, lng, map) {
  if (activeMarker) {
    map.removeLayer(activeMarker);
    activeMarker = null;
  }
  if (activePulseMarker) {
    map.removeLayer(activePulseMarker);
    activePulseMarker = null;
  }

  const marker = L.circleMarker([lat, lng], {
    radius: 10,
    color: '#ffffff',
    weight: 3,
    fillColor: '#0066b3',
    fillOpacity: 0.9,
    pane: 'overlayPane',
  });

  const pulseMarker = L.circleMarker([lat, lng], {
    radius: 20,
    color: '#0066b3',
    weight: 2,
    fillColor: '#0066b3',
    fillOpacity: 0.2,
    pane: 'overlayPane',
  });

  marker.addTo(map);
  pulseMarker.addTo(map);

  setTimeout(() => {
    if (pulseMarker) {
      map.removeLayer(pulseMarker);
      activePulseMarker = null;
    }
  }, 1000);

  activeMarker = marker;
  activePulseMarker = pulseMarker;
  return marker;
}

// Updated analyzeLocation with zoom awareness
export async function analyzeLocation(map, lat, lng) {
  try {
    // Get current zoom level
    const currentZoom = map.getZoom();
    
    // Check if zoom is valid for PGA query
    if (!isValidZoomForPGA(currentZoom)) {
      const zoomWarning = getZoomRecommendation(currentZoom);
      
      // Update UI with zoom warning
      riskPGA.innerHTML = "--";
      riskLevel.className = "risk-badge";
      riskLevel.innerHTML = "Zoom In Required";
      riskFault.innerHTML = "--";
      
      // Show warning popup
      map.closePopup();
      L.popup()
        .setLatLng([lat, lng])
        .setContent(`⚠️ ${zoomWarning.message}`)
        .openOn(map);
      
      // Still add marker but don't query PGA
      createLocationMarker(lat, lng, map);
      updateMapStateLocation(lat, lng, null, null, null);
      return;
    }

    // Remove existing marker
    if (activeMarker) {
      map.removeLayer(activeMarker);
      activeMarker = null;
    }
    if (activePulseMarker) {
      map.removeLayer(activePulseMarker);
      activePulseMarker = null;
    }
    
    createLocationMarker(lat, lng, map);

    // Pass zoom level to PGA query
    const pgaValue = await getPGAValue(lat, lng, currentZoom);
    const nearestFault = getNearestFault(map, lat, lng);

    if (pgaValue === null || isNaN(pgaValue)) {
      resetAnalysisUI();
      updateMapStateLocation(lat, lng, null, null, nearestFault);
      
      // Show zoom recommendation if applicable
      const zoomRec = getZoomRecommendation(currentZoom);
      if (zoomRec.message) {
        showInfoPopup(map, lat, lng, `ℹ️ ${zoomRec.message}`);
      }
      return;
    }

    const classification = getSeismicClassification(pgaValue);
    const formattedPGA = Number(pgaValue).toFixed(4);

    updateMapStateLocation(lat, lng, pgaValue, classification, nearestFault);
    updateAnalysisUI({ formattedPGA, classification, nearestFault });
    
    // Show PGA popup with zoom info
    const popupContent = currentZoom < 6 
      ? `${formattedPGA} g (approx - zoom ${currentZoom})`
      : `${formattedPGA} g`;
    showSimplePopup(map, lat, lng, popupContent);
    
  } catch (error) {
    console.error("Location analysis failed:", error);
  }
}

// Helper to show info popup
function showInfoPopup(map, lat, lng, message) {
  map.closePopup();
  L.popup()
    .setLatLng([lat, lng])
    .setContent(message)
    .openOn(map);
}

function updateMapStateLocation(lat, lng, pga, classification, nearestFault) {
  mapState.lat = lat;
  mapState.lng = lng;
  mapState.pga = pga;
  mapState.classification = classification;
  mapState.nearestFault = nearestFault;
}

function updateAnalysisUI({ formattedPGA, classification, nearestFault }) {
  riskPGA.innerHTML = `${formattedPGA} g`;
  riskLevel.className = "risk-badge";
  
  if (classification.colorClass) {
    riskLevel.classList.add(classification.colorClass);
  }
  
  riskLevel.innerHTML = classification.label;
  riskFault.innerHTML = nearestFault
    ? `${nearestFault.name} (${nearestFault.distance.toFixed(2)} km)`
    : "--";
}

function resetAnalysisUI() {
  riskPGA.innerHTML = "--";
  riskLevel.className = "risk-badge";
  riskLevel.innerHTML = "No Data";
  riskFault.innerHTML = "--";
}

function showSimplePopup(map, lat, lng, formattedPGA) {
  map.closePopup();
  L.popup()
    .setLatLng([lat, lng])
    .setContent(formattedPGA)
    .openOn(map);
}

export function clearLocationMarker(map) {
  if (activeMarker) {
    map.removeLayer(activeMarker);
    activeMarker = null;
  }
  if (activePulseMarker) {
    map.removeLayer(activePulseMarker);
    activePulseMarker = null;
  }
}