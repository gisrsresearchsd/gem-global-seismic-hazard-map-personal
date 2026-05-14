import L from 'leaflet';

import {
  APP_CONFIG,
} from '../../config/appConfig';

import {
  mapState,
} from '../../state/mapState';

// Create Reset Control

export function createResetControl(
  map
) {

  const resetControl =
    L.control({
      position: 'topright',
    });

  resetControl.onAdd =
    function () {

      // Container

      const container =
        L.DomUtil.create(
          'div',
          'reset-control'
        );

      container.innerHTML =
        'Reset';

      // Prevent Map Drag

      L.DomEvent.disableClickPropagation(
        container
      );

      // Click

      container.addEventListener(
        'click',
        () => {

          // Reset Map View

          map.flyTo(
            APP_CONFIG.MAP.CENTER,
            APP_CONFIG.MAP.DEFAULT_ZOOM
          );

          // Reset State

          mapState.lat = null;

          mapState.lng = null;

          mapState.pga = null;

          mapState.classification =
            null;

          mapState.nearestFault =
            null;

          // Reset PGA

          document.getElementById(
            'riskPGA'
          ).innerHTML = '--';

          // Reset Risk

          const riskLevel =
            document.getElementById(
              'riskLevel'
            );

          riskLevel.className =
            'risk-badge';

          riskLevel.innerHTML =
            'No Data';

          // Reset Fault

          document.getElementById(
            'riskFault'
          ).innerHTML = '--';

          // Reset Report

          document.getElementById(
            'riskResult'
          ).innerHTML =
            'No analysis yet';

          // Reset Form

          document.getElementById(
            'propertyType'
          ).value = '';

          document.getElementById(
            'buildingType'
          ).value = '';

          document.getElementById(
            'buildingStories'
          ).value = '';

          document.getElementById(
            'seismicAssessmentDone'
          ).value = '';

          // Reset Checkboxes

          document
            .querySelectorAll(
              '.document-item input'
            )
            .forEach(
              (checkbox) => {

                checkbox.checked =
                  false;
              }
            );

          // Hide Sections

          document
            .getElementById(
              'leaseRenewalQuestion'
            )
            .classList.add(
              'hidden'
            );

          document
            .getElementById(
              'documentsSection'
            )
            .classList.add(
              'hidden'
            );
        }
      );

      return container;
    };

  resetControl.addTo(map);
}