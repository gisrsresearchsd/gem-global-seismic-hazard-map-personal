import { DOCUMENT_TYPES } from "./riskConstants";

// Get Document Checks

export function getDocumentChecks(selectedDocuments) {
  // Individual Documents
  const hasStructuralDesignReport = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.STRUCTURAL_DESIGN_REPORT,
  );
  const hasArchitecturalDrawings = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.ARCHITECTURAL_DRAWINGS,
  );
  const hasStructuralAsBuilt = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.STRUCTURAL_AS_BUILT,
  );
  const hasFloorPlan = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.FLOOR_PLAN,
  );
  const hasDigitalStructuralModel = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.DIGITAL_STRUCTURAL_MODEL,
  );
  const hasInspectionReports = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.INSPECTION_REPORTS,
  );
  const hasMaintenanceRecords = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.MAINTENANCE_RECORDS,
  );
  const hasMEPDocumentation = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.MEP_DOCUMENTATION,
  );
  const hasGeotechnicalReport = hasDocument(
    selectedDocuments,
    DOCUMENT_TYPES.GEOTECHNICAL_REPORT,
  );

  // Document Groups

  const hasPeerReviewDocuments =
    hasStructuralDesignReport &&
    hasArchitecturalDrawings &&
    hasStructuralAsBuilt &&
    hasDigitalStructuralModel;

  const hasOnlyStructuralReport =
    hasStructuralDesignReport &&
    !hasArchitecturalDrawings &&
    !hasStructuralAsBuilt &&
    !hasFloorPlan &&
    !hasGeotechnicalReport;

  const hasTier1Documents = hasStructuralAsBuilt || hasFloorPlan;

  const tier3DocumentCount = [
    hasArchitecturalDrawings,
    hasStructuralAsBuilt,
    hasGeotechnicalReport,
  ].filter(Boolean).length;

  const hasAllTier3Documents = tier3DocumentCount === 3;
  const hasAnyTier3Documents = tier3DocumentCount > 0;

  const hasPartialTier3Documents =
    tier3DocumentCount > 0 && tier3DocumentCount < 3;

  const hasAnyRelevantDocuments =
  hasStructuralDesignReport ||
  hasArchitecturalDrawings ||
  hasStructuralAsBuilt ||
  hasFloorPlan ||
  hasDigitalStructuralModel ||
  hasGeotechnicalReport;

  return {
    // Individual Documents
    hasStructuralDesignReport,
    hasArchitecturalDrawings,
    hasStructuralAsBuilt,
    hasFloorPlan,
    hasDigitalStructuralModel,
    hasInspectionReports,
    hasMaintenanceRecords,
    hasMEPDocumentation,
    hasGeotechnicalReport,

    // Document Groups
    hasPeerReviewDocuments,
    hasOnlyStructuralReport,
    hasTier1Documents,
    tier3DocumentCount,
    hasAllTier3Documents,
    hasAnyTier3Documents,
    hasPartialTier3Documents,

    //Any Document
    hasAnyRelevantDocuments,
  };
}

// Check Document
function hasDocument(selectedDocuments, documentType) {
  return selectedDocuments.includes(documentType);
}
