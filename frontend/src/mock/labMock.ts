import {
  User,
  Patient,
  Doctor,
  LabOrder,
  LabOrderItem,
  LabResult,
  LabTest,
  LabOrderItemWithDetails,
} from '../types/lab';

// Mock Users
export const mockLabUsers: User[] = [
  { id: '1', full_name: 'Nimal Perera', email: 'nimal@example.com', phone: '0771234567', role: 'patient' },
  { id: '2', full_name: 'Kamani Silva', email: 'kamani@example.com', phone: '0772234567', role: 'patient' },
  { id: '3', full_name: 'Sunil Fernando', email: 'sunil@example.com', phone: '0773234567', role: 'patient' },
  { id: '10', full_name: 'Dr. Milinda Abeykoon', email: 'milinda@example.com', phone: '0779234567', role: 'doctor' },
  { id: '11', full_name: 'Dr. Samanthi Perera', email: 'samanthi@example.com', phone: '0778234567', role: 'doctor' },
];

// Mock Patients
export const mockLabPatients: Patient[] = [
  { id: 'P1', user_id: '1', nic: '921234567V', date_of_birth: '1992-05-15', gender: 'Male' },
  { id: 'P2', user_id: '2', nic: '901234567V', date_of_birth: '1990-08-20', gender: 'Female' },
  { id: 'P3', user_id: '3', nic: '881234567V', date_of_birth: '1988-12-10', gender: 'Male' },
];

// Mock Doctors
export const mockLabDoctors: Doctor[] = [
  { id: 'D1', user_id: '10', specialization: 'Cardiologist' },
  { id: 'D2', user_id: '11', specialization: 'General Practitioner' },
];

// Mock Lab Tests
export const mockLabTests: LabTest[] = [
  { id: 1, name: 'Complete Blood Count (CBC)', price: 1500, description: 'Full blood count analysis', type: 'Blood Test' },
  { id: 2, name: 'Lipid Profile', price: 2500, description: 'Cholesterol and triglycerides', type: 'Blood Test' },
  { id: 3, name: 'Thyroid Function Test (TFT)', price: 3000, description: 'TSH, T3, T4 levels', type: 'Blood Test' },
  { id: 4, name: 'Blood Sugar (Fasting)', price: 800, description: 'Fasting glucose test', type: 'Blood Test' },
  { id: 5, name: 'Urine Analysis', price: 600, description: 'Complete urine examination', type: 'Urine Test' },
];

// Mock Lab Orders
export const mockLabOrders: LabOrder[] = [
  {
    id: 'LO1',
    visit_id: 'V1',
    doctor_id: 'D1',
    patient_id: 'P1',
    status: 'IN_PROGRESS',
    created_at: '2026-01-27T08:30:00',
  },
  {
    id: 'LO2',
    visit_id: 'V2',
    doctor_id: 'D1',
    patient_id: 'P2',
    status: 'ORDERED',
    created_at: '2026-01-27T09:15:00',
  },
  {
    id: 'LO3',
    visit_id: 'V3',
    doctor_id: 'D2',
    patient_id: 'P3',
    status: 'IN_PROGRESS',
    created_at: '2026-01-27T10:00:00',
  },
  {
    id: 'LO4',
    visit_id: 'V4',
    doctor_id: 'D1',
    patient_id: 'P1',
    status: 'COMPLETED',
    created_at: '2026-01-26T14:00:00',
  },
];

// Mock Lab Order Items
export const mockLabOrderItems: LabOrderItem[] = [
  // LO1 - 2 tests (1 pending, 1 done)
  { id: 'LOI1', lab_order_id: 'LO1', lab_test_id: 1, status: 'PENDING' },
  { id: 'LOI2', lab_order_id: 'LO1', lab_test_id: 2, status: 'DONE' },
  
  // LO2 - 2 tests (both pending)
  { id: 'LOI3', lab_order_id: 'LO2', lab_test_id: 3, status: 'PENDING' },
  { id: 'LOI4', lab_order_id: 'LO2', lab_test_id: 4, status: 'PENDING' },
  
  // LO3 - 1 test (pending)
  { id: 'LOI5', lab_order_id: 'LO3', lab_test_id: 5, status: 'PENDING' },
  
  // LO4 - 2 tests (both done - completed order)
  { id: 'LOI6', lab_order_id: 'LO4', lab_test_id: 1, status: 'DONE' },
  { id: 'LOI7', lab_order_id: 'LO4', lab_test_id: 4, status: 'DONE' },
];

// Mock Lab Results
export const mockLabResults: LabResult[] = [
  {
    id: 'LR1',
    lab_order_item_id: 'LOI2',
    result_text: 'WBC: 7500, RBC: 4.8M, Hemoglobin: 14.2g/dL',
    file_url: null,
    completed_at: '2026-01-27T11:30:00',
  },
  {
    id: 'LR2',
    lab_order_item_id: 'LOI6',
    result_text: 'WBC: 8200, RBC: 5.1M, Hemoglobin: 15.1g/dL',
    file_url: null,
    completed_at: '2026-01-26T16:00:00',
  },
  {
    id: 'LR3',
    lab_order_item_id: 'LOI7',
    result_text: 'Fasting glucose: 92 mg/dL - Normal',
    file_url: null,
    completed_at: '2026-01-26T16:30:00',
  },
];

// Helper function to get lab order items with details (JOIN simulation)
export const getLabOrderItemsWithDetails = (): LabOrderItemWithDetails[] => {
  return mockLabOrderItems.map(item => {
    const order = mockLabOrders.find(o => o.id === item.lab_order_id);
    const test = mockLabTests.find(t => t.id === item.lab_test_id);
    const patient = mockLabPatients.find(p => p.id === order?.patient_id);
    const user = mockLabUsers.find(u => u.id === patient?.user_id);
    const doctor = mockLabDoctors.find(d => d.id === order?.doctor_id);
    const doctorUser = mockLabUsers.find(u => u.id === doctor?.user_id);

    return {
      ...item,
      patient_name: user?.full_name || 'Unknown',
      patient_phone: user?.phone || 'N/A',
      test_name: test?.name || 'Unknown Test',
      test_type: test?.type || 'N/A',
      requested_date: order?.created_at || '',
      doctor_name: doctorUser?.full_name || 'Unknown Doctor',
      order_status: order?.status || 'ORDERED',
    };
  });
};

// Helper function to get pending items only
export const getPendingLabOrderItems = (): LabOrderItemWithDetails[] => {
  return getLabOrderItemsWithDetails().filter(item => item.status === 'PENDING');
};

// Helper function to get completed items
export const getCompletedLabOrderItems = (): LabOrderItemWithDetails[] => {
  return getLabOrderItemsWithDetails().filter(item => item.status === 'DONE');
};

// Helper function to check if all items in an order are done
export const areAllItemsDone = (labOrderId: string): boolean => {
  const orderItems = mockLabOrderItems.filter(item => item.lab_order_id === labOrderId);
  return orderItems.length > 0 && orderItems.every(item => item.status === 'DONE');
};

// Helper function to update order item status
export const updateOrderItemStatus = (itemId: string, newStatus: 'PENDING' | 'DONE'): void => {
  const item = mockLabOrderItems.find(i => i.id === itemId);
  if (item) {
    item.status = newStatus;
    
    // Check if all items in the order are done
    if (areAllItemsDone(item.lab_order_id)) {
      const order = mockLabOrders.find(o => o.id === item.lab_order_id);
      if (order) {
        order.status = 'COMPLETED';
      }
    }
  }
};

// Helper function to update lab order status
export const updateLabOrderStatus = (orderId: string, newStatus: 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED'): void => {
  const order = mockLabOrders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
  }
};

// Helper function to add lab result
export const addLabResult = (
  labOrderItemId: string,
  resultText: string | null,
  fileUrl: string | null
): void => {
  const newResult: LabResult = {
    id: `LR${mockLabResults.length + 1}`,
    lab_order_item_id: labOrderItemId,
    result_text: resultText,
    file_url: fileUrl,
    completed_at: new Date().toISOString(),
  };
  mockLabResults.push(newResult);
};
