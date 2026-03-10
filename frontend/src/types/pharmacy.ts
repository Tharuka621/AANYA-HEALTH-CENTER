// Pharmacy-related type definitions

export interface Medicine {
  medicine_id?: string;
  name: string;
  dosage: string;
  unit?: string;
  quantity: number;
}

export interface Prescription {
  id: string;
  prescriptionId: string;
  patient: string;
  doctor: string;
  medicines: Medicine[];
  issued_date: string;
  status: 'ACTIVE' | 'DISPENSED';
}

export interface InventoryBatch {
  id: string;
  medicine_id: string;
  medicine_name: string;
  dosage: string;
  batch_no: string;
  expiry_date: string | null;
  qty_available: number;
  sell_price: number;
}

export interface MedicineInfo {
  id: string;
  name: string;
  dosage: string;
  low_stock_threshold: number;
}

export interface BatchDeduction {
  batch_id: string;
  batch_no: string;
  qty_to_deduct: number;
  unit_price: number;
}

export interface BatchDeductionPlan {
  medicine_name: string;
  dosage: string;
  batches: BatchDeduction[];
  total_deducted: number;
  remaining_needed: number;
  error?: string;
}

export interface InvoiceItem {
  medicine_name: string;
  dosage: string;
  batch_no: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  prescription_id: string;
  patient_name: string;
  created_at: string;
  total_amount: number;
  items: InvoiceItem[];
}

// Database-aligned entities for billing
export interface DBInvoice {
  id: string;
  patient_id: string;
  visit_id?: string;
  total_amount: number;
  status: 'UNPAID' | 'PAID' | 'CANCELLED';
  created_at: string;
}

export interface DBInvoiceItem {
  id: string;
  invoice_id: string;
  batch_id: string;
  medicine_name: string;
  dosage: string;
  batch_no: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface DBInvoicePayment {
  id: string;
  invoice_id: string;
  method: 'CASH' | 'CARD' | 'ONLINE';
  amount: number;
  payment_ref?: string;
  paid_at: string;
}
