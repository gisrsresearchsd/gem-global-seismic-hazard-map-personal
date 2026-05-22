import "leaflet/dist/leaflet.css";
import "./styles/main.css";

import { initializeMap } from "./map/core/mapInitializer";
import { initializeRiskPanel } from "./risk/ui/riskPanel";

/* Initialize note modal */
import "./utils/noteModal";

/* Initialize application */
initializeMap();
initializeRiskPanel();