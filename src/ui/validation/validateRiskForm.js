// Validate Risk Form

export function validateRiskForm(data) {

  // PGA Validation
  if (data.pga == null || isNaN(data.pga)) {
    return createValidationError("pga", "Please select a land area.");
  }

  // Property Type Validation
  if (!data.propertyType) {
    return createValidationError(
      "propertyType",
      "Please select property type.",
    );
  }

  // Building Type Validation
  if (!data.buildingType) {
    return createValidationError(
      "buildingType",
      "Please select building type.",
    );
  }

  // Stories Validation
  const stories = Number(data.stories);

  if (!Number.isInteger(stories) || stories <= 0) {
    return createValidationError("stories", "Invalid number of stories.");
  }

  return {
    valid: true,
  };
}

// Create Validation Error
function createValidationError(field, message) {
  return {
    valid: false,
    field,
    message,
  };
}
