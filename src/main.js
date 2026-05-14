import "leaflet/dist/leaflet.css";

import "./styles/main.css";

import { initializeMap } from "./map/core/mapInitializer";
import { initializeRiskPanel } from "./ui/riskPanel";

// Initialize application map
initializeMap();
initializeRiskPanel();
