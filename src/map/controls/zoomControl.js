import L from 'leaflet';

// Create Zoom Control with wrapper container for side-by-side layout
export function createZoomControl(map) {
  // Create a custom container to hold both zoom and search
  const topLeftContainer = L.DomUtil.create('div', 'top-left-controls');
  topLeftContainer.style.display = 'flex';
  topLeftContainer.style.flexDirection = 'row';
  topLeftContainer.style.alignItems = 'flex-start';
  topLeftContainer.style.gap = '8px';
  
  // Create zoom control wrapper
  const zoomWrapper = L.DomUtil.create('div', 'zoom-wrapper');
  
  // Add standard zoom control to wrapper
  const zoomControl = L.control.zoom({
    position: 'topleft',
  });
  
  // Override zoom control's onAdd to add to our wrapper
  const originalOnAdd = zoomControl.onAdd;
  zoomControl.onAdd = function(map) {
    const container = originalOnAdd.call(this, map);
    zoomWrapper.appendChild(container);
    return zoomWrapper;
  };
  
  zoomControl.addTo(map);
  
  // Store reference to container for search control to attach
  window.topLeftContainer = topLeftContainer;
  
  // Add the container to the map's topleft corner
  const existingPane = document.querySelector('.leaflet-top.leaflet-left');
  if (existingPane) {
    existingPane.style.display = 'flex';
    existingPane.style.flexDirection = 'row';
    existingPane.style.alignItems = 'flex-start';
    existingPane.style.gap = '8px';
    existingPane.appendChild(topLeftContainer);
  }
  
  return zoomControl;
}