export interface Invoice {
  id: number;
  patientName: string;
  totalAmount: number;
  status: 'UNPAID' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

export interface InvoicePayment {
  id: number;
  invoiceId: number;
  method: 'CASH' | 'CARD' | 'ONLINE';
  amount: number;
  paidAt: string;
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  medicineName: string;
  batchNo: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}
