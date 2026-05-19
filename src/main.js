// main.js
import "leaflet/dist/leaflet.css";
import "./styles/main.css";

import { initializeMap } from "./map/core/mapInitializer";
import { initializeRiskPanel } from "./risk/ui/riskPanel";

// IMPORTANT: Import the note modal
import "./utils/noteModal";  // ← THIS MUST BE HERE

// Initialize application map
initializeMap();
initializeRiskPanel();