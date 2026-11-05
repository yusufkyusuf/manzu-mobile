// Shapes from manzu-b (med-version): pharmacy-medications.service.js fetchMedicationCatalog /
// updateOrCreateMedication, routes/pharmacy.js /medications*, utils/validation.js (validateFetchMedications,
// validateUpdateMedication). Prisma Float → number, DateTime → ISO string.

export type CatalogStatus = 'all' | 'stocked' | 'not_stocked' | 'low_stock' | 'out_of_stock' | 'expiring_soon';
export type RegulatoryClass = 'OTC' | 'PRESCRIPTION_ONLY' | 'SCHEDULE_I' | 'SCHEDULE_II' | 'SCHEDULE_III' | 'SCHEDULE_IV' | 'SCHEDULE_V' | 'RESTRICTED';

export interface MedicationIngredientInfo {
  id: number;
  activeSubstanceId: number | null;
  activeSubstanceName: string | null;
  strengthValue: number | null;
  strengthUnit: string | null;
  perUnitValue: number | null;
  perUnitType: string | null;
}

export interface CatalogMedication {
  medicationId: number;
  brandName: string;
  /** DosageForm enum value, e.g. TABLET. */
  form: string | null;
  packSizeExpression: string | null;
  packSizeUnit: string | null;
  regulatoryClass: RegulatoryClass | null;
  prescriptionRequired: boolean;
  ingredients: MedicationIngredientInfo[];
  activeSubstances: string;
  displayName: string;
  manufacturer: { id: number; name: string } | null;
  manufacturerName: string | null;
  /** inventory row exists and stock > 0. */
  isStocked: boolean;
  pharmacyId: number | null;
  /** `stock || null`, so 0 comes back as null. */
  stock: number | null;
  /** `price || null`. */
  price: number | null;
  expiryDate: string | null;
  receivedDate: string | null;
  batchNumber: string | null;
}

export interface CatalogSummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringSoonCount: number;
  totalValue: number;
  catalogSize: number;
  stockedCount: number;
  notStockedCount: number;
}

export interface CatalogResponse {
  medications: CatalogMedication[];
  pagination: { page: number; limit: number; total: number; pages: number };
  summary: CatalogSummary;
  pharmacyInfo: { type: string | null; name: string; accessRules: unknown };
}

export interface CatalogQuery {
  page?: number;
  /** 1–100, backend default 10. */
  limit?: number;
  search?: string;
  status?: CatalogStatus;
  prescriptionRequired?: 'true' | 'false';
}

/** PATCH /api/pharmacy/medications/:medicationId (upsert) — the body the web InventoryForm sends. */
export interface UpsertInventoryRequest {
  /** Integer ≥ 0. */
  stock: number;
  /** ≥ 0, 2 dp (the form requires > 0). */
  price: number;
  batchNumber: string;
  /** YYYY-MM-DD. */
  expiryDate: string;
}

export interface UpsertInventoryResponse {
  message: string;
  medication: {
    pharmacyId: number;
    medicationId: number;
    brandName: string;
    activeSubstances: string;
    stock: number | null;
    price: number | null;
    receivedDate: string | null;
    expiryDate: string | null;
    batchNumber: string | null;
  };
}

export interface DeleteInventoryResponse {
  message: string;
}

/** Web stockFilter values (mapped to CatalogStatus). */
export type StockFilter = 'stocked' | 'not_stocked' | 'low' | 'out' | 'expiring';
export type PrescriptionFilter = '' | 'true' | 'false';

export interface InventoryFilters {
  search: string;
  stock: StockFilter;
  prescription: PrescriptionFilter;
}
