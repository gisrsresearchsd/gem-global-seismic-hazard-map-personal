// Validate Risk Form

export function validateRiskForm(data = {}) {
  const numericPga = Number(data.pga);

  // PGA Validation
  if (!Number.isFinite(numericPga)) {
    return createValidationError(
      "pga",
      "Please select a valid seismic area.",
    );
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

  if (
    !Number.isInteger(stories) ||
    stories <= 0
  ) {
    return createValidationError(
      "stories",
      "Invalid number of stories.",
    );
  }

  return {
    valid: true,
  };
}

// Create Validation Error

function createValidationError(
  field,
  message,
) {
  return {
    valid: false,
    field,
    message,
  };
}