const DEFAULT_MESSAGE = "Move cursor over map";

/* Convert decimal degree to DMS */
function convertToDMS(value, type) {
  const absoluteValue = Math.abs(value);

  let degrees = Math.floor(absoluteValue);

  let minutesFloat = (absoluteValue - degrees) * 60;

  let minutes = Math.floor(minutesFloat);

  let seconds = Math.round((minutesFloat - minutes) * 60);

  /* Normalize overflow */
  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }

  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }

  const direction =
    type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

/* Create coordinate display */
export function createCoordinateControl(map) {
  const coordinateDiv = document.querySelector(".coordinate-control");

  if (!coordinateDiv) {
    return;
  }

  coordinateDiv.textContent = DEFAULT_MESSAGE;

  map.on("mousemove", (event) => {
    const { lat, lng } = event.latlng;

    const latDMS = convertToDMS(lat, "lat");

    const lngDMS = convertToDMS(lng, "lng");

    coordinateDiv.textContent = `${latDMS} | ${lngDMS}`;
  });

  map.on("mouseout", () => {
    coordinateDiv.textContent = DEFAULT_MESSAGE;
  });
}
