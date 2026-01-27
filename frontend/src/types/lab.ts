// Lab-specific types and interfaces

export type LabOrderStatus = 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED';
export type LabOrderItemStatus = 'PENDING' | 'DONE';

export interface LabOrder {
  id: string;
  visit_id: string;
  doctor_id: string;
  patient_id: string;
  status: LabOrderStatus;
  created_at: string;
}

export interface LabOrderItem {
  id: string;
  lab_order_id: string;
  lab_test_id: number;
  status: LabOrderItemStatus;
}

export interface LabResult {
  id: string;
  lab_order_item_id: string;
  result_text: string | null;
  file_url: string | null;
  completed_at: string;
}

export interface LabTest {
  id: number;
  name: string;
  price: number;
  description: string | null;
  type: string;
}

export interface Patient {
  id: string;
  user_id: string;
  nic: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
}

// Derived types for UI
export interface LabOrderItemWithDetails extends LabOrderItem {
  patient_name: string;
  patient_phone: string;
  test_name: string;
  test_type: string;
  requested_date: string;
  doctor_name: string;
  order_status: LabOrderStatus;
}
