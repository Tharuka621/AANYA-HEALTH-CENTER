// User roles and authentication types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab' | 'patient';

// Patient types
export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  medical_history?: string;
  allergies?: string;
  blood_group?: string;
  created_at: string;
  updated_at: string;
}

// Appointment types
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  patient?: Patient;
  doctor?: User;
  created_at: string;
}

// Lab test types
export interface LabTest {
  id: string;
  patient_id: string;
  doctor_id: string;
  test_name: string;
  test_type: string;
  status: 'requested' | 'in_progress' | 'completed';
  requested_date: string;
  completed_date?: string;
  results?: string;
  report_url?: string;
  lab_tech_id?: string;
  patient?: Patient;
  doctor?: User;
  lab_tech?: User;
}

// Prescription types
export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medicines: PrescribedMedicine[];
  status: 'active' | 'dispensed' | 'expired';
  issued_date: string;
  notes?: string;
  patient?: Patient;
  doctor?: User;
}

export interface PrescribedMedicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
}

// Pharmacy types
export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  manufacturer: string;
  batch_number: string;
  expiry_date: string;
  stock_quantity: number;
  unit_price: number;
  reorder_level: number;
  category: string;
  created_at: string;
}

// Vital signs types
export interface VitalSigns {
  id: string;
  patient_id: string;
  nurse_id: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  weight?: number;
  height?: number;
  recorded_date: string;
  patient?: Patient;
  nurse?: User;
}

// Billing types
export interface Bill {
  id: string;
  patient_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  bill_date: string;
  due_date: string;
  description: string;
  payment_method?: string;
  payment_date?: string;
  patient?: Patient;
}

// Authentication types
export interface AuthResponse {
  ok: boolean;
  token?: string;
  user?: User;
  message?: string;
  requiresVerification?: boolean;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  nic?: string;
  allergies?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Doctor specialization types
export interface DoctorSpecialization {
  id: string;
  name: string;
  description: string;
}

// Time slot types for appointments
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}