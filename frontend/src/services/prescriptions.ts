import { Prescription, PrescriptionItem } from '../types';

export interface PrescriptionsResponse {
  ok: boolean;
  prescriptions: Prescription[];
}

export interface PrescriptionItemsResponse {
  ok: boolean;
  items: PrescriptionItem[];
}

// Dummy prescription data
const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    doctor_name: 'Dr. Milinda Abeykoon',
    prescription_date: '2026-01-20',
    diagnosis: 'Common Cold and Flu',
    notes: 'Rest and take medicines as prescribed. Drink plenty of fluids.',
    status: 'active',
    created_at: '2026-01-20T10:30:00Z',
  },
  {
    id: 2,
    patient_id: 1,
    doctor_id: 2,
    doctor_name: 'Dr. Milinda Abeykoon',
    prescription_date: '2026-01-15',
    diagnosis: 'Seasonal Allergies',
    notes: 'Avoid allergens. Take antihistamines as needed.',
    status: 'completed',
    created_at: '2026-01-15T14:20:00Z',
  },
  {
    id: 3,
    patient_id: 1,
    doctor_id: 1,
    doctor_name: 'Dr. Milinda Abeykoon',
    prescription_date: '2026-01-10',
    diagnosis: 'Vitamin D Deficiency',
    notes: 'Take supplements daily. Get more sunlight exposure.',
    status: 'active',
    created_at: '2026-01-10T09:15:00Z',
  },
];

// Dummy prescription items data
const mockPrescriptionItems: Record<number, PrescriptionItem[]> = {
  1: [
    {
      id: 1,
      prescription_id: 1,
      medicine_id: 1,
      medicine_name: 'Paracetamol 500mg',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: '5 days',
      quantity: 15,
      instructions: 'Take after meals',
    },
    {
      id: 2,
      prescription_id: 1,
      medicine_id: 2,
      medicine_name: 'Cetirizine 10mg',
      dosage: '10mg',
      frequency: 'Once daily at night',
      duration: '7 days',
      quantity: 7,
      instructions: 'Take before bedtime',
    },
  ],
  2: [
    {
      id: 3,
      prescription_id: 2,
      medicine_id: 3,
      medicine_name: 'Loratadine 10mg',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      quantity: 30,
      instructions: 'Take in the morning',
    },
  ],
  3: [
    {
      id: 4,
      prescription_id: 3,
      medicine_id: 4,
      medicine_name: 'Vitamin D3 1000 IU',
      dosage: '1000 IU',
      frequency: 'Once daily',
      duration: '90 days',
      quantity: 90,
      instructions: 'Take with breakfast',
    },
  ],
};

/**
 * Get all prescriptions for the logged-in patient (Mock data)
 */
export const getPatientPrescriptions = async (): Promise<Prescription[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPrescriptions;
};

/**
 * Get prescription items (medicines) for a specific prescription (Mock data)
 */
export const getPrescriptionItems = async (prescriptionId: number): Promise<PrescriptionItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPrescriptionItems[prescriptionId] || [];
};
