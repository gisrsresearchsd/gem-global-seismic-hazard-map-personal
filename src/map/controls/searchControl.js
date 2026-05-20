import L from 'leaflet';

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Shared marker reference
let activeMarker = null;
let activePulseMarker = null;

// Create consistent marker style (same as analysisHandler)
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

// Create Search Control with Autocomplete
export function createSearchControl(map, onLocationSelect) {
  const searchControl = L.control({
    position: 'topleft',
  });

  searchControl.onAdd = function () {
    // Container
    const container = L.DomUtil.create('div', 'search-control');
    
    // Prevent Map Drag
    L.DomEvent.disableClickPropagation(container);

    // Search Wrapper
    const searchWrapper = L.DomUtil.create('div', 'search-wrapper');
    container.appendChild(searchWrapper);

    // Input
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search city, country, or coordinates...';
    input.className = 'search-input';
    searchWrapper.appendChild(input);

    // Suggestions Dropdown
    const suggestionsDropdown = L.DomUtil.create('div', 'search-suggestions');
    suggestionsDropdown.style.display = 'none';
    searchWrapper.appendChild(suggestionsDropdown);

    // Loading Indicator
    const loadingIndicator = L.DomUtil.create('div', 'search-loading');
    loadingIndicator.innerHTML = '🔍 Searching...';
    loadingIndicator.style.display = 'none';
    searchWrapper.appendChild(loadingIndicator);

    // Clear Button
    const clearBtn = L.DomUtil.create('button', 'search-clear-btn');
    clearBtn.innerHTML = '✕';
    clearBtn.style.display = 'none';
    clearBtn.type = 'button';
    searchWrapper.appendChild(clearBtn);

    // Cache for suggestions
    let suggestionCache = new Map();
    let currentRequest = null;
    let selectedIndex = -1;

    // Fetch suggestions from Nominatim
    async function fetchSuggestions(query) {
      if (!query || query.length < 2) {
        suggestionsDropdown.style.display = 'none';
        loadingIndicator.style.display = 'none';
        return [];
      }

      // Check cache
      if (suggestionCache.has(query)) {
        return suggestionCache.get(query);
      }

      loadingIndicator.style.display = 'flex';

      try {
        // Abort previous request
        if (currentRequest) {
          currentRequest.abort();
        }

        const controller = new AbortController();
        currentRequest = controller;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&accept-language=en`,
          {
            headers: {
              'User-Agent': 'eq-hazard-gem',
            },
            signal: controller.signal,
          }
        );

        const results = await response.json();
        
        // Cache results
        suggestionCache.set(query, results);
        
        // Limit cache size
        if (suggestionCache.size > 50) {
          const firstKey = suggestionCache.keys().next().value;
          suggestionCache.delete(firstKey);
        }
        
        return results;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search failed:', error);
        }
        return [];
      } finally {
        loadingIndicator.style.display = 'none';
        currentRequest = null;
      }
    }

    // Render suggestions
    function renderSuggestions(results, searchQuery) {
      if (!results || results.length === 0) {
        suggestionsDropdown.style.display = 'none';
        return;
      }

      suggestionsDropdown.innerHTML = '';
      selectedIndex = -1;

      results.forEach((result, index) => {
        const suggestionItem = L.DomUtil.create('div', 'suggestion-item');
        
        // Extract location details
        const displayName = result.display_name;
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const type = result.type || 'place';
        
        // Icon based on place type
        let icon = '📍';
        if (type === 'city') icon = '🏙️';
        else if (type === 'town') icon = '🏘️';
        else if (type === 'village') icon = '🏡';
        else if (type === 'country') icon = '🌍';
        else if (type === 'state') icon = '🗺️';
        else if (type === 'river' || type === 'lake') icon = '💧';
        else if (type === 'mountain') icon = '⛰️';
        
        // Truncate long names
        const shortName = displayName.length > 60 
          ? displayName.substring(0, 57) + '...' 
          : displayName;
        
        suggestionItem.innerHTML = `
          <div class="suggestion-icon">${icon}</div>
          <div class="suggestion-content">
            <div class="suggestion-title">${escapeHtml(shortName)}</div>
            <div class="suggestion-subtitle">${formatCoordinates(lat, lon)}</div>
          </div>
        `;
        
        suggestionItem.dataset.lat = lat;
        suggestionItem.dataset.lon = lon;
        suggestionItem.dataset.name = displayName;
        suggestionItem.dataset.index = index;
        
        // Click handler
        suggestionItem.addEventListener('click', (e) => {
          e.stopPropagation();
          const lat = parseFloat(suggestionItem.dataset.lat);
          const lng = parseFloat(suggestionItem.dataset.lon);
          input.value = suggestionItem.dataset.name;
          suggestionsDropdown.style.display = 'none';
          clearBtn.style.display = 'flex';
          flyToLocation(lat, lng);
        });
        
        // Hover effect
        suggestionItem.addEventListener('mouseenter', () => {
          document.querySelectorAll('.suggestion-item').forEach(item => {
            item.classList.remove('selected');
          });
          suggestionItem.classList.add('selected');
          selectedIndex = index;
        });
        
        suggestionsDropdown.appendChild(suggestionItem);
      });
      
      suggestionsDropdown.style.display = 'block';
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Format coordinates for display
    function formatCoordinates(lat, lon) {
      return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
    }

    // Coordinate validation
    function isValidCoordinate(lat, lon) {
      return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    // Parse coordinate input
    function parseCoordinateInput(query) {
      // Format: lat, lng or lat lng
      let match = query.match(/^(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)$/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (isValidCoordinate(lat, lng)) {
          return { lat, lng, type: 'coordinate' };
        }
      }
      
      // Format: lat°, lng°
      match = query.match(/^(-?\d+(?:\.\d+)?)°?[\s,]+(-?\d+(?:\.\d+)?)°?$/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (isValidCoordinate(lat, lng)) {
          return { lat, lng, type: 'coordinate' };
        }
      }
      
      return null;
    }

    // Fly to location with consistent marker
    function flyToLocation(lat, lng) {
      // Validate coordinates
      if (!isValidCoordinate(lat, lng)) {
        alert('Invalid coordinates');
        return;
      }

      // Remove existing marker before adding new one
      if (activeMarker) {
        map.removeLayer(activeMarker);
        activeMarker = null;
      }
      if (activePulseMarker) {
        map.removeLayer(activePulseMarker);
        activePulseMarker = null;
      }

      // Zoom to location
      map.flyTo([lat, lng], 10, {
        duration: 1.5,
        easeLinearity: 0.25
      });

      // Create consistent marker
      createLocationMarker(lat, lng, map);

      // Trigger analysis
      if (onLocationSelect) {
        onLocationSelect(map, lat, lng);
      }
    }

    // Handle input with debounce
    const handleInput = debounce(async () => {
      const query = input.value.trim();
      
      if (!query) {
        suggestionsDropdown.style.display = 'none';
        clearBtn.style.display = 'none';
        return;
      }
      
      clearBtn.style.display = 'flex';
      
      // Check if it's coordinates
      const coordResult = parseCoordinateInput(query);
      if (coordResult) {
        suggestionsDropdown.style.display = 'none';
        flyToLocation(coordResult.lat, coordResult.lng);
        return;
      }
      
      // Fetch suggestions
      const results = await fetchSuggestions(query);
      renderSuggestions(results, query);
    }, 300);

    // Keyboard navigation
    input.addEventListener('keydown', async (event) => {
      const items = document.querySelectorAll('.suggestion-item');
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (items.length > 0) {
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelectedItem(items);
          }
          break;
          
        case 'ArrowUp':
          event.preventDefault();
          if (items.length > 0) {
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelectedItem(items);
          }
          break;
          
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].click();
          } else if (input.value.trim()) {
            suggestionsDropdown.style.display = 'none';
            const query = input.value.trim();
            const coordResult = parseCoordinateInput(query);
            
            if (coordResult) {
              flyToLocation(coordResult.lat, coordResult.lng);
            } else {
              const results = await fetchSuggestions(query);
              if (results && results.length > 0) {
                const result = results[0];
                flyToLocation(parseFloat(result.lat), parseFloat(result.lon));
              } else {
                alert('Location not found. Try a different search term or use coordinates (e.g., 40.7128, -74.0060)');
              }
            }
          }
          break;
          
        case 'Escape':
          suggestionsDropdown.style.display = 'none';
          selectedIndex = -1;
          break;
      }
    });
    
    function updateSelectedItem(items) {
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    }
    
    input.addEventListener('input', handleInput);
    
    // Clear button handler
    clearBtn.addEventListener('click', () => {
      input.value = '';
      suggestionsDropdown.style.display = 'none';
      clearBtn.style.display = 'none';
      input.focus();
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        suggestionsDropdown.style.display = 'none';
        selectedIndex = -1;
      }
    });

    return container;
  };

  searchControl.addTo(map);
}

// Export marker cleanup function
export function clearSearchMarker(map) {
  if (activeMarker) {
    map.removeLayer(activeMarker);
    activeMarker = null;
  }
  if (activePulseMarker) {
    map.removeLayer(activePulseMarker);
    activePulseMarker = null;
  }
}