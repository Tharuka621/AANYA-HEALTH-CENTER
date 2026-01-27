import { AppointmentStatus, VisitStatus, LabOrderStatus, PrescriptionStatus } from '../types/doctor';

// Status display mappings
export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  COMPLETED: 'Completed',
};

export const visitStatusLabels: Record<VisitStatus, string> = {
  WAITING: 'Waiting',
  IN_CONSULTATION: 'In Consultation',
  DONE: 'Done',
};

export const labOrderStatusLabels: Record<LabOrderStatus, string> = {
  ORDERED: 'Ordered',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export const prescriptionStatusLabels: Record<PrescriptionStatus, string> = {
  ACTIVE: 'Active',
  DISPENSED: 'Dispensed',
  CANCELLED: 'Cancelled',
};

// Status colors for Chip components
export const appointmentStatusColors: Record<AppointmentStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  CANCELLED: 'error',
  NO_SHOW: 'default',
  COMPLETED: 'success',
};

export const visitStatusColors: Record<VisitStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  WAITING: 'warning',
  IN_CONSULTATION: 'primary',
  DONE: 'success',
};

export const labOrderStatusColors: Record<LabOrderStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  ORDERED: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
};

// Helper to format time from HH:mm:ss to HH:mm AM/PM
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Helper to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper to check if patient is checked in (derived from visits table)
export function isPatientCheckedIn(appointmentId: string, visits: any[]): boolean {
  return visits.some(v => v.appointment_id === appointmentId && v.check_in_time !== null);
}

// Helper to format BP
export function formatBloodPressure(systolic: number | null, diastolic: number | null): string {
  if (systolic && diastolic) {
    return `${systolic}/${diastolic}`;
  }
  return 'N/A';
}

// Helper to calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
