/* Validate risk form */
export function validateRiskForm(data = {}) {
  const { pga, propertyType, buildingType, stories } = data;

  const numericPga = Number(pga);

  const storyCount = Number(stories);

  /* PGA validation */
  if (!Number.isFinite(numericPga)) {
    return createValidationError("pga", "Please select a valid seismic area.");
  }

  /* Property type validation */
  if (!propertyType) {
    return createValidationError(
      "propertyType",
      "Please select property type.",
    );
  }

  /* Building type validation */
  if (!buildingType) {
    return createValidationError(
      "buildingType",
      "Please select building type.",
    );
  }

  /* Stories validation */
  if (!Number.isInteger(storyCount) || storyCount <= 0) {
    return createValidationError("stories", "Invalid number of stories.");
  }

  return {
    valid: true,
  };
}

/* Create validation error */
function createValidationError(field, message) {
  return {
    valid: false,
    field,
    message,
  };
}
