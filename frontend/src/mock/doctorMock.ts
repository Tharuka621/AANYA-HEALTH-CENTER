import {
  Doctor,
  DoctorSlot,
  Appointment,
  Visit,
  Vital,
  Prescription,
  PrescriptionItem,
  LabOrder,
  LabOrderItem,
  LabTest,
  Patient,
  User,
  VisitWithDetails,
  AppointmentWithDetails,
} from '../types/doctor';

// Users
export const mockUsers: User[] = [
  { id: 'U001', full_name: 'Dr. Milinda Abeykoon', email: 'milinda@hospital.com', phone: '+94771234560', role: 'doctor' },
  { id: 'U002', full_name: 'Nimal Perera', email: 'nimal@email.com', phone: '+94771234567', role: 'patient' },
  { id: 'U003', full_name: 'Kamani Silva', email: 'kamani@email.com', phone: '+94771234568', role: 'patient' },
  { id: 'U004', full_name: 'Sunil Fernando', email: 'sunil@email.com', phone: '+94771234569', role: 'patient' },
];

// Patients
export const mockPatients: Patient[] = [
  {
    id: 'P001',
    user_id: 'U002',
    nic: '199012345678',
    date_of_birth: '1990-05-15',
    gender: 'Male',
    blood_group: 'O+',
    allergies: 'Penicillin',
    emergency_contact_name: 'Saman Perera',
    emergency_contact_phone: '+94771111111',
  },
  {
    id: 'P002',
    user_id: 'U003',
    nic: '199523456789',
    date_of_birth: '1995-08-20',
    gender: 'Female',
    blood_group: 'A+',
    allergies: null,
    emergency_contact_name: 'Kumari Silva',
    emergency_contact_phone: '+94772222222',
  },
  {
    id: 'P003',
    user_id: 'U004',
    nic: '198234567890',
    date_of_birth: '1982-03-10',
    gender: 'Male',
    blood_group: 'B+',
    allergies: 'Shellfish',
    emergency_contact_name: 'Mala Fernando',
    emergency_contact_phone: '+94773333333',
  },
];

// Doctor
export const mockDoctor: Doctor = {
  id: 'D001',
  user_id: 'U001',
  specialization: 'General Medicine',
  room: 'Room 205',
};

// Doctor Slots (Today)
const today = new Date().toISOString().split('T')[0];
export const mockSlots: DoctorSlot[] = [
  { id: 'SL001', doctor_id: 'D001', slot_date: today, start_time: '10:00:00', end_time: '10:30:00', max_appointments: 1, is_active: true },
  { id: 'SL002', doctor_id: 'D001', slot_date: today, start_time: '11:30:00', end_time: '12:00:00', max_appointments: 1, is_active: true },
  { id: 'SL003', doctor_id: 'D001', slot_date: today, start_time: '14:00:00', end_time: '14:30:00', max_appointments: 1, is_active: true },
];

// Appointments
export const mockAppointments: Appointment[] = [
  { id: 'A001', patient_id: 'P001', doctor_id: 'D001', slot_id: 'SL001', reason: 'Regular checkup', status: 'CONFIRMED', booked_by: 'U002', created_at: new Date().toISOString() },
  { id: 'A002', patient_id: 'P002', doctor_id: 'D001', slot_id: 'SL002', reason: 'Blood pressure follow-up', status: 'CONFIRMED', booked_by: 'U003', created_at: new Date().toISOString() },
  { id: 'A003', patient_id: 'P003', doctor_id: 'D001', slot_id: 'SL003', reason: 'Diabetes consultation', status: 'CONFIRMED', booked_by: 'U004', created_at: new Date().toISOString() },
];

// Visits (Today's active visits)
export const mockVisits: Visit[] = [
  { id: 'V001', appointment_id: 'A001', patient_id: 'P001', doctor_id: 'D001', check_in_time: new Date().toISOString(), status: 'WAITING', doctor_notes: null, diagnosis: null },
  { id: 'V002', appointment_id: 'A002', patient_id: 'P002', doctor_id: 'D001', check_in_time: new Date().toISOString(), status: 'IN_CONSULTATION', doctor_notes: null, diagnosis: null },
];

// Vitals
export const mockVitals: Vital[] = [
  { id: 'VT001', visit_id: 'V001', systolic_bp: 120, diastolic_bp: 80, sugar_level: 95, temperature: 37.0, weight: 70, pulse: 72, notes: 'Normal vitals', recorded_at: new Date().toISOString() },
  { id: 'VT002', visit_id: 'V002', systolic_bp: 130, diastolic_bp: 85, sugar_level: 110, temperature: 36.8, weight: 65, pulse: 75, notes: 'Slightly elevated BP', recorded_at: new Date().toISOString() },
];

// Lab Tests
export const mockLabTests: LabTest[] = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 1500, description: 'Full blood analysis', type: 'Blood Test' },
  { id: 2, name: 'Blood Sugar (Fasting)', price: 500, description: 'Fasting glucose test', type: 'Blood Test' },
  { id: 3, name: 'Lipid Profile', price: 2000, description: 'Cholesterol and triglycerides', type: 'Blood Test' },
  { id: 4, name: 'Urine Full Report', price: 800, description: 'Complete urine analysis', type: 'Urine Test' },
  { id: 5, name: 'Liver Function Test', price: 2500, description: 'LFT panel', type: 'Blood Test' },
];

// Lab Orders
export const mockLabOrders: LabOrder[] = [
  { id: 'LO001', visit_id: 'V001', doctor_id: 'D001', patient_id: 'P001', status: 'ORDERED', created_at: new Date().toISOString() },
];

export const mockLabOrderItems: LabOrderItem[] = [
  { id: 'LOI001', lab_order_id: 'LO001', lab_test_id: 1, status: 'PENDING' },
  { id: 'LOI002', lab_order_id: 'LO001', lab_test_id: 2, status: 'PENDING' },
];

// Prescriptions
export const mockPrescriptions: Prescription[] = [];

export const mockPrescriptionItems: PrescriptionItem[] = [];

// Helper function to get visits with patient details (JOIN simulation)
export function getVisitsWithDetails(): VisitWithDetails[] {
  return mockVisits.map(visit => {
    const patient = mockPatients.find(p => p.id === visit.patient_id);
    const user = mockUsers.find(u => u.id === patient?.user_id);
    const appointment = mockAppointments.find(a => a.id === visit.appointment_id);
    const slot = mockSlots.find(s => s.id === appointment?.slot_id);
    const vitals = mockVitals.find(v => v.visit_id === visit.id);

    return {
      ...visit,
      patient_name: user?.full_name || 'Unknown',
      patient_phone: user?.phone || '',
      appointment_reason: appointment?.reason || '',
      appointment_time: slot?.start_time || '',
      vitals,
    };
  });
}

// Helper function to get appointments with details
export function getAppointmentsWithDetails(): AppointmentWithDetails[] {
  return mockAppointments.map(appointment => {
    const patient = mockPatients.find(p => p.id === appointment.patient_id);
    const user = mockUsers.find(u => u.id === patient?.user_id);
    const slot = mockSlots.find(s => s.id === appointment.slot_id);
    const hasVisit = mockVisits.some(v => v.appointment_id === appointment.id);

    return {
      ...appointment,
      patient_name: user?.full_name || 'Unknown',
      patient_phone: user?.phone || '',
      slot_date: slot?.slot_date || '',
      start_time: slot?.start_time || '',
      end_time: slot?.end_time || '',
      has_visit: hasVisit,
    };
  });
}

// Helper to get patient with user info
export function getPatientWithUser(patientId: string) {
  const patient = mockPatients.find(p => p.id === patientId);
  if (!patient) return null;
  
  const user = mockUsers.find(u => u.id === patient.user_id);
  return {
    ...patient,
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  };
}

// Helper to get visit vitals
export function getVisitVitals(visitId: string): Vital | undefined {
  return mockVitals.find(v => v.visit_id === visitId);
}

// Helper to get lab tests for a visit
export function getLabOrdersForVisit(visitId: string) {
  const orders = mockLabOrders.filter(o => o.visit_id === visitId);
  return orders.map(order => ({
    ...order,
    items: mockLabOrderItems.filter(item => item.lab_order_id === order.id).map(item => ({
      ...item,
      test: mockLabTests.find(t => t.id === item.lab_test_id),
    })),
  }));
}
