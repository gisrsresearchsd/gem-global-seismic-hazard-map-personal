// Convert Decimal Degree to DMS

function convertToDMS(value, type) {

  const absoluteValue = Math.abs(value);

  const degrees = Math.floor(absoluteValue);

  const minutesFloat =
    (absoluteValue - degrees) * 60;

  const minutes = Math.floor(minutesFloat);

  const secondsFloat =
    (minutesFloat - minutes) * 60;

  const seconds =
    Math.round(secondsFloat);

  let direction = '';

  // Latitude Direction

  if (type === 'lat') {
    direction =
      value >= 0 ? 'N' : 'S';
  }

  // Longitude Direction

  if (type === 'lng') {
    direction =
      value >= 0 ? 'E' : 'W';
  }

  return `
    ${degrees}° ${minutes}' ${seconds}" ${direction}
  `;
}

// Create Coordinate Display

export function createCoordinateControl(map) {

  const coordinateDiv =
    document.querySelector('.coordinate-control');

  // Default Message

  coordinateDiv.innerHTML =
    'Move cursor over map';

  // Mouse Move

  map.on('mousemove', (event) => {

    const { lat, lng } = event.latlng;

    const latDMS =
      convertToDMS(lat, 'lat');

    const lngDMS =
      convertToDMS(lng, 'lng');

    coordinateDiv.innerHTML =
      `${latDMS} | ${lngDMS}`;
  });

  // Mouse Leave Map

  map.on('mouseout', () => {

    coordinateDiv.innerHTML =
      'Move cursor over map';
  });
}