import L from "leaflet";

import { getPGAValue } from "../layers/pgaLayer";
import { getNearestFault } from "../layers/faultLayer";
import { getSeismicClassification } from "../../utils/seismicUtils";
import { mapState } from "../../state/mapState";

// UI Elements
const riskPGA = document.getElementById("riskPGA");
const riskLevel = document.getElementById("riskLevel");
const riskFault = document.getElementById("riskFault");

// Active marker references
let activeMarker = null;
let activePulseMarker = null;

// Create consistent marker style
function createLocationMarker(lat, lng, map) {
  // Remove existing marker completely
  if (activeMarker) {
    map.removeLayer(activeMarker);
    activeMarker = null;
  }
  if (activePulseMarker) {
    map.removeLayer(activePulseMarker);
    activePulseMarker = null;
  }

  // Create main marker
  const marker = L.circleMarker([lat, lng], {
    radius: 10,
    color: '#ffffff',
    weight: 3,
    fillColor: '#0066b3',
    fillOpacity: 0.9,
    pane: 'overlayPane',
  });

  // Create pulse effect marker
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

  // Remove pulse after animation
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

// Analyze Location
export async function analyzeLocation(map, lat, lng) {
  try {
    // Remove existing marker before adding new one
    if (activeMarker) {
      map.removeLayer(activeMarker);
      activeMarker = null;
    }
    if (activePulseMarker) {
      map.removeLayer(activePulseMarker);
      activePulseMarker = null;
    }
    
    // Add marker for clicked location
    createLocationMarker(lat, lng, map);

    // PGA
    const pgaValue = await getPGAValue(lat, lng);

    // Fault
    const nearestFault = getNearestFault(map, lat, lng);

    // No Data
    if (pgaValue === null || isNaN(pgaValue)) {
      resetAnalysisUI();
      updateMapStateLocation(lat, lng, null, null, nearestFault);
      return;
    }

    // Classification
    const classification = getSeismicClassification(pgaValue);

    // Formatted PGA
    const formattedPGA = Number(pgaValue).toFixed(4);

    // Update State
    updateMapStateLocation(lat, lng, pgaValue, classification, nearestFault);

    // Update UI
    updateAnalysisUI({
      formattedPGA,
      classification,
      nearestFault,
    });

    // Simple popup with just PGA value
    showSimplePopup(map, lat, lng, formattedPGA);
  } catch (error) {
    console.error("Location analysis failed:", error);
  }
}

// Update map state location
function updateMapStateLocation(lat, lng, pga, classification, nearestFault) {
  mapState.lat = lat;
  mapState.lng = lng;
  mapState.pga = pga;
  mapState.classification = classification;
  mapState.nearestFault = nearestFault;
}

// Update Analysis UI
function updateAnalysisUI({ formattedPGA, classification, nearestFault }) {
  // PGA
  riskPGA.innerHTML = `${formattedPGA} g`;

  // Reset Badge
  riskLevel.className = "risk-badge";

  // Risk Class
  if (classification.colorClass) {
    riskLevel.classList.add(classification.colorClass);
  }

  // Risk Label
  riskLevel.innerHTML = classification.label;

  // Fault
  riskFault.innerHTML = nearestFault
    ? `
        ${nearestFault.name}
        (${nearestFault.distance.toFixed(2)} km)
      `
    : "--";
}

// Reset UI
function resetAnalysisUI() {
  riskPGA.innerHTML = "--";
  riskLevel.className = "risk-badge";
  riskLevel.innerHTML = "No Data";
  riskFault.innerHTML = "--";
}

// Simple popup without extra text
function showSimplePopup(map, lat, lng, formattedPGA) {
  // Close any existing popup
  map.closePopup();
  
  L.popup()
    .setLatLng([lat, lng])
    .setContent(`${formattedPGA} g`)
    .openOn(map);
}

// Export marker removal function
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