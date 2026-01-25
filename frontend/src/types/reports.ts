// Report Types and DTOs for AANYA Health Management System

export type ReportType = 'PATIENT_VISIT' | 'LAB_TEST' | 'PRESCRIPTION' | 'INVENTORY';

export type ReportStatus = 'draft' | 'published' | 'under_review';

export type GroupBy = 'daily' | 'weekly' | 'monthly';

export type OutputFormat = 'table' | 'summary';

export type VisitStatus = 'checked_in' | 'completed' | 'cancelled';

export type LabResultStatus = 'pending' | 'completed' | 'cancelled';

export type InventoryStatus = 'ok' | 'low' | 'expiring';

// Base Report Interface
export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  createdBy: string;
  createdDate: string; // DD/MM/YYYY
  filters: ReportFilters;
  generatedAt?: string;
}

// Filter Interfaces
export interface BaseFilters {
  dateFrom: string | null;
  dateTo: string | null;
  groupBy: GroupBy;
  outputFormat: OutputFormat;
}

export interface PatientVisitFilters extends BaseFilters {
  doctorId?: string;
  patientId?: string;
  status?: VisitStatus;
}

export interface LabTestFilters extends BaseFilters {
  testType?: string;
  resultStatus?: LabResultStatus;
  labTechId?: string;
}

export interface PrescriptionFilters extends BaseFilters {
  doctorId?: string;
  medicineId?: string;
  issuedOnly?: boolean;
}

export interface InventoryFilters extends BaseFilters {
  lowStockOnly?: boolean;
  expiringWithinDays?: 7 | 30 | 60 | null;
  medicineId?: string;
}

export type ReportFilters = 
  | PatientVisitFilters 
  | LabTestFilters 
  | PrescriptionFilters 
  | InventoryFilters;

// Data Row Interfaces
export interface PatientVisitRow {
  visitId: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  checkInTime: string;
  diagnosis: string;
  vitalsSummary: string;
  status: VisitStatus;
  date: string; // DD/MM/YYYY
}

export interface LabTestRow {
  labOrderId: string;
  patientName: string;
  patientId: string;
  testName: string;
  orderedDate: string; // DD/MM/YYYY
  resultValue: string;
  resultStatus: LabResultStatus;
  labTechName?: string;
  completedDate?: string;
}

export interface PrescriptionRow {
  prescriptionId: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  medicineName: string;
  qty: number;
  dosage: string;
  durationDays: number;
  issuedQty?: number;
  prescribedDate: string; // DD/MM/YYYY
}

export interface InventoryRow {
  medicineId: string;
  medicineName: string;
  batchNo: string;
  qtyRemaining: number;
  expiryDate: string; // DD/MM/YYYY
  reorderLevel: number;
  status: InventoryStatus;
  daysUntilExpiry?: number;
}

export type ReportRow = PatientVisitRow | LabTestRow | PrescriptionRow | InventoryRow;

// Report Generation Payload
export interface GenerateReportPayload {
  type: ReportType;
  title: string;
  filters: ReportFilters;
}

// Report Preview Response
export interface ReportPreview {
  reportId: string;
  type: ReportType;
  data: ReportRow[];
  summary?: ReportSummary;
  generatedAt: string;
}

// Summary Statistics
export interface ReportSummary {
  totalRecords: number;
  [key: string]: number | string;
}

// Chart Data (for Insights tab)
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
}

// Saved Report List Item
export interface SavedReport {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  createdBy: string;
  createdDate: string; // DD/MM/YYYY
  lastModified?: string;
}
