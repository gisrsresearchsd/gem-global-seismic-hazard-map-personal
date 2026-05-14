import L from 'leaflet';

import {
  getPGAValue,
} from '../layers/pgaLayer';

import {
  getNearestFault,
} from '../layers/faultLayer';

import {
  getSeismicClassification,
} from '../../utils/seismicUtils';

import {
  mapState,
} from '../../state/mapState';

// Analyze Location

export async function analyzeLocation(
  map,
  lat,
  lng
) {

  // PGA

  const pgaValue =
    await getPGAValue(
      lat,
      lng
    );

  // Nearest Fault

  const nearestFault =
    getNearestFault(
      map,
      lat,
      lng
    );

  // UI Elements

  const riskPGA =
    document.getElementById(
      'riskPGA'
    );

  const riskLevel =
    document.getElementById(
      'riskLevel'
    );

  const riskFault =
    document.getElementById(
      'riskFault'
    );

  // No Data

  if (pgaValue === null) {

    riskPGA.innerHTML = '--';

    riskLevel.innerHTML =
      'No Data';

    riskFault.innerHTML =
      '--';

    return;
  }

  // Classification

  const classification =
    getSeismicClassification(
      pgaValue
    );

  // Update State

  mapState.lat = lat;

  mapState.lng = lng;

  mapState.pga = pgaValue;

  mapState.classification =
    classification;

  mapState.nearestFault =
    nearestFault;

  // PGA

  riskPGA.innerHTML =
    `${Number(
      pgaValue
    ).toFixed(4)} g`;

  // Badge

  riskLevel.className =
    'risk-badge';

  if (
    classification.colorClass
  ) {

    riskLevel.classList.add(
      classification.colorClass
    );
  }

  riskLevel.innerHTML =
    classification.label;

  // Fault

  if (
    nearestFault
  ) {

    riskFault.innerHTML = `
      ${nearestFault.name}
      (${nearestFault.distance.toFixed(2)} km)
    `;

  } else {

    riskFault.innerHTML =
      '--';
  }

  // Popup

  L.popup()
    .setLatLng([lat, lng])
    .setContent(`
      <b>PGA Value</b><br>
      ${Number(
        pgaValue
      ).toFixed(4)} g
    `)
    .openOn(map);
}