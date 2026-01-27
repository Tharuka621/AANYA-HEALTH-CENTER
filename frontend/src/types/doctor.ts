// Schema-aligned types for Doctor module

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  room: string;
}

export interface DoctorSlot {
  id: string;
  doctor_id: string;
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  max_appointments: number;
  is_active: boolean;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  reason: string;
  status: AppointmentStatus;
  booked_by: string;
  created_at?: string;
}

export type VisitStatus = 'WAITING' | 'IN_CONSULTATION' | 'DONE';

export interface Visit {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  check_in_time: string | null;
  status: VisitStatus;
  doctor_notes: string | null;
  diagnosis: string | null;
}

export interface Vital {
  id: string;
  visit_id: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  sugar_level: number | null;
  temperature: number | null;
  weight: number | null;
  pulse: number | null;
  notes: string | null;
  recorded_at: string;
}

export type PrescriptionStatus = 'ACTIVE' | 'DISPENSED' | 'CANCELLED';

export interface Prescription {
  id: string;
  visit_id: string;
  doctor_id: string;
  patient_id: string;
  instructions: string | null;
  status: PrescriptionStatus;
  created_at?: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id: string;
  dosage: string;
  duration_days: number;
  qty: number;
  note: string | null;
}

export type LabOrderStatus = 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED';
export type LabOrderItemStatus = 'PENDING' | 'DONE';

export interface LabOrder {
  id: string;
  visit_id: string;
  doctor_id: string;
  patient_id: string;
  status: LabOrderStatus;
  created_at?: string;
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

export type LabTestType = 'Blood Test' | 'Urine Test' | 'Other';

export interface LabTest {
  id: number;
  name: string;
  price: number;
  description: string | null;
  type: LabTestType;
}

export interface Patient {
  id: string;
  user_id: string;
  nic: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string | null;
  allergies: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

// Derived/Joined types for UI
export interface PatientWithUser extends Patient {
  full_name: string;
  email: string;
  phone: string;
}

export interface VisitWithDetails extends Visit {
  patient_name: string;
  patient_phone: string;
  appointment_reason: string;
  appointment_time: string;
  vitals?: Vital;
}

export interface AppointmentWithDetails extends Appointment {
  patient_name: string;
  patient_phone: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  has_visit: boolean; // Derived: true if visit exists
}
