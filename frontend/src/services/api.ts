import axios from 'axios';
import { 
  User, 
  Patient, 
  Appointment, 
  Prescription, 
  LabTest, 
  Medicine, 
  VitalSigns, 
  Bill,
  ApiResponse,
  PaginatedResponse,
  Notification
} from '../types';

// Axios instance configured for backend API
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data stores
let mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@aanya.com',
    full_name: 'Dr. Admin',
    role: 'admin',
    phone: '+1234567890',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'doctor@aanya.com',
    full_name: 'Dr. Sarah Wilson',
    role: 'doctor',
    phone: '+1234567891',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'receptionist@aanya.com',
    full_name: 'Emma Davis',
    role: 'receptionist',
    phone: '+1234567893',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    email: 'pharmacist@aanya.com',
    full_name: 'David Miller',
    role: 'pharmacist',
    phone: '+1234567894',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    email: 'labtech@aanya.com',
    full_name: 'Lisa Brown',
    role: 'lab',
    phone: '+1234567895',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    email: 'patient@aanya.com',
    full_name: 'Kasun Bandara',
    role: 'patient',
    phone: '+94771234570',
    created_at: '2024-01-01T00:00:00Z'
  }
];

let mockPatients: Patient[] = [
  {
    id: '1',
    patient_id: 'P001',
    full_name: 'Kasun Bandara',
    email: 'kasun.bandara@email.com',
    phone: '+94771234570',
    date_of_birth: '1990-05-15',
    gender: 'male',
    address: 'No. 123, Main Street, Colombo 07',
    emergency_contact: 'Nimal Bandara',
    emergency_phone: '+94771234571',
    medical_history: 'Diabetes Type 2',
    allergies: 'Penicillin',
    blood_group: 'O+',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    patient_id: 'P002',
    full_name: 'Alice Smith',
    email: 'alice.smith@email.com',
    phone: '+1234567898',
    date_of_birth: '1985-08-22',
    gender: 'female',
    address: '456 Oak Ave, City, State',
    emergency_contact: 'Bob Smith',
    emergency_phone: '+1234567899',
    medical_history: 'Hypertension',
    allergies: 'None',
    blood_group: 'A+',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
];

let mockAppointments: Appointment[] = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: '2',
    appointment_date: '2024-12-20',
    appointment_time: '10:00',
    status: 'scheduled',
    reason: 'Regular checkup',
    notes: 'Patient prefers morning appointments',
    patient: mockPatients[0],
    doctor: mockUsers[1],
    created_at: '2024-12-15T00:00:00Z'
  },
  {
    id: '2',
    patient_id: '2',
    doctor_id: '2',
    appointment_date: '2024-12-20',
    appointment_time: '11:00',
    status: 'scheduled',
    reason: 'Blood pressure follow-up',
    patient: mockPatients[1],
    doctor: mockUsers[1],
    created_at: '2024-12-16T00:00:00Z'
  }
];

let mockPrescriptions: Prescription[] = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: '2',
    medicines: [
      {
        medicine_name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        quantity: 60,
        instructions: 'Take with food'
      }
    ],
    status: 'active',
    issued_date: '2024-12-15T00:00:00Z',
    notes: 'Monitor blood sugar levels',
    patient: mockPatients[0],
    doctor: mockUsers[1]
  }
];

let mockLabTests: LabTest[] = [
  {
    id: '1',
    patient_id: '1',
    doctor_id: '2',
    test_name: 'Complete Blood Count',
    test_type: 'Blood Test',
    status: 'completed',
    requested_date: '2024-12-15T00:00:00Z',
    completed_date: '2024-12-16T00:00:00Z',
    results: 'All values within normal range',
    report_url: '/reports/cbc-report-001.pdf',
    lab_tech_id: '6',
    patient: mockPatients[0],
    doctor: mockUsers[1],
    lab_tech: mockUsers[5]
  }
];

let mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Metformin',
    generic_name: 'Metformin HCl',
    manufacturer: 'Generic Pharma',
    batch_number: 'MF2024001',
    expiry_date: '2025-12-31',
    stock_quantity: 500,
    unit_price: 2.50,
    reorder_level: 50,
    category: 'Diabetes',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Lisinopril',
    generic_name: 'Lisinopril',
    manufacturer: 'CardioMed',
    batch_number: 'LS2024001',
    expiry_date: '2025-06-30',
    stock_quantity: 25, // Low stock
    unit_price: 1.80,
    reorder_level: 30,
    category: 'Hypertension',
    created_at: '2024-01-01T00:00:00Z'
  }
];

let mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: '1',
    title: 'New Appointment',
    message: 'You have a new appointment scheduled for tomorrow',
    type: 'info',
    read: false,
    created_at: '2024-12-19T00:00:00Z'
  }
];

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generic API response helper
const createResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => ({
  data,
  message,
  success: true
});

const createErrorResponse = (message: string): ApiResponse<null> => ({
  data: null,
  message,
  success: false
});

// Users API
export const usersApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    await delay();
    return createResponse(mockUsers);
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    await delay();
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return createResponse(user);
  },

  update: async (id: string, updates: Partial<User>): Promise<ApiResponse<User>> => {
    await delay();
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    mockUsers[index] = { ...mockUsers[index], ...updates };
    return createResponse(mockUsers[index]);
  }
};

// Patients API
export const patientsApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Patient>> => {
    await delay();
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = mockPatients.slice(start, end);
    
    return {
      data,
      total: mockPatients.length,
      page,
      limit,
      totalPages: Math.ceil(mockPatients.length / limit)
    };
  },

  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    await delay();
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return createResponse(patient);
  },

  create: async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Patient>> => {
    await delay();
    const newPatient: Patient = {
      ...patient,
      id: (mockPatients.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockPatients.push(newPatient);
    return createResponse(newPatient);
  },

  update: async (id: string, updates: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    await delay();
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Patient not found');
    }
    mockPatients[index] = { 
      ...mockPatients[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    return createResponse(mockPatients[index]);
  }
};

// Appointments API
export const appointmentsApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Appointment>> => {
    await delay();
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = mockAppointments.slice(start, end);
    
    return {
      data,
      total: mockAppointments.length,
      page,
      limit,
      totalPages: Math.ceil(mockAppointments.length / limit)
    };
  },

  getByDate: async (date: string): Promise<ApiResponse<Appointment[]>> => {
    await delay();
    const appointments = mockAppointments.filter(a => a.appointment_date === date);
    return createResponse(appointments);
  },

  getByPatient: async (patientId: string): Promise<ApiResponse<Appointment[]>> => {
    try {
      const response = await axiosInstance.get('/appointments/patient/appointments');
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Appointments fetched successfully'
      };
    } catch (error: any) {
      console.error('Error fetching patient appointments:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch appointments'
      };
    }
  },

  getByDoctor: async (doctorId: string): Promise<ApiResponse<Appointment[]>> => {
    await delay();
    const appointments = mockAppointments.filter(a => a.doctor_id === doctorId);
    return createResponse(appointments);
  },

  create: async (appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<ApiResponse<Appointment>> => {
    await delay();
    const newAppointment: Appointment = {
      ...appointment,
      id: (mockAppointments.length + 1).toString(),
      created_at: new Date().toISOString()
    };
    mockAppointments.push(newAppointment);
    return createResponse(newAppointment);
  },

  update: async (id: string, updates: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    await delay();
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    mockAppointments[index] = { ...mockAppointments[index], ...updates };
    return createResponse(mockAppointments[index]);
  }
};

// Prescriptions API
export const prescriptionsApi = {
  getAll: async (): Promise<ApiResponse<Prescription[]>> => {
    await delay();
    return createResponse(mockPrescriptions);
  },

  getByPatient: async (patientId: string): Promise<ApiResponse<Prescription[]>> => {
    await delay();
    const prescriptions = mockPrescriptions.filter(p => p.patient_id === patientId);
    return createResponse(prescriptions);
  },

  getPending: async (): Promise<ApiResponse<Prescription[]>> => {
    await delay();
    const pending = mockPrescriptions.filter(p => p.status === 'active');
    return createResponse(pending);
  },

  create: async (prescription: Omit<Prescription, 'id'>): Promise<ApiResponse<Prescription>> => {
    await delay();
    const newPrescription: Prescription = {
      ...prescription,
      id: (mockPrescriptions.length + 1).toString()
    };
    mockPrescriptions.push(newPrescription);
    return createResponse(newPrescription);
  },

  dispense: async (id: string): Promise<ApiResponse<Prescription>> => {
    await delay();
    const index = mockPrescriptions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Prescription not found');
    }
    mockPrescriptions[index].status = 'dispensed';
    return createResponse(mockPrescriptions[index]);
  }
};

// Lab Tests API
export const labTestsApi = {
  getAll: async (): Promise<ApiResponse<LabTest[]>> => {
    await delay();
    return createResponse(mockLabTests);
  },

  getPending: async (): Promise<ApiResponse<LabTest[]>> => {
    await delay();
    const pending = mockLabTests.filter(t => t.status === 'requested');
    return createResponse(pending);
  },

  getByPatient: async (patientId: string): Promise<ApiResponse<LabTest[]>> => {
    await delay();
    const tests = mockLabTests.filter(t => t.patient_id === patientId);
    return createResponse(tests);
  },

  create: async (test: Omit<LabTest, 'id'>): Promise<ApiResponse<LabTest>> => {
    await delay();
    const newTest: LabTest = {
      ...test,
      id: (mockLabTests.length + 1).toString()
    };
    mockLabTests.push(newTest);
    return createResponse(newTest);
  },

  uploadResult: async (id: string, reportUrl: string): Promise<ApiResponse<LabTest>> => {
    await delay();
    const index = mockLabTests.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Lab test not found');
    }
    mockLabTests[index] = {
      ...mockLabTests[index],
      status: 'completed',
      completed_date: new Date().toISOString(),
      report_url: reportUrl
    };
    return createResponse(mockLabTests[index]);
  }
};

// Medicines API
export const medicinesApi = {
  getAll: async (): Promise<ApiResponse<Medicine[]>> => {
    await delay();
    return createResponse(mockMedicines);
  },

  getLowStock: async (): Promise<ApiResponse<Medicine[]>> => {
    await delay();
    const lowStock = mockMedicines.filter(m => m.stock_quantity <= m.reorder_level);
    return createResponse(lowStock);
  },

  updateStock: async (id: string, quantity: number): Promise<ApiResponse<Medicine>> => {
    await delay();
    const index = mockMedicines.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error('Medicine not found');
    }
    mockMedicines[index].stock_quantity = quantity;
    return createResponse(mockMedicines[index]);
  }
};

// Notifications API
export const notificationsApi = {
  getByUser: async (userId: string): Promise<ApiResponse<Notification[]>> => {
    await delay();
    const notifications = mockNotifications.filter(n => n.user_id === userId);
    return createResponse(notifications);
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    await delay();
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    mockNotifications[index].read = true;
    return createResponse(mockNotifications[index]);
  }
};

// Export all APIs
export const api = {
  users: usersApi,
  patients: patientsApi,
  appointments: appointmentsApi,
  prescriptions: prescriptionsApi,
  labTests: labTestsApi,
  medicines: medicinesApi,
  notifications: notificationsApi
};

