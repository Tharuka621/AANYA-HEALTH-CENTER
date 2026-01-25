// Mock API service for Reports Management
import {
  SavedReport,
  GenerateReportPayload,
  ReportPreview,
  PatientVisitRow,
  LabTestRow,
  PrescriptionRow,
  InventoryRow,
  ReportSummary,
} from '../types/reports';

// Mock data generators
const generatePatientVisitData = (): PatientVisitRow[] => [
  {
    visitId: 'V001',
    patientName: 'Priya Perera',
    patientId: 'P001',
    doctorName: 'Dr. Nimal Fernando',
    checkInTime: '09:30',
    diagnosis: 'Seasonal flu with fever',
    vitalsSummary: 'BP: 120/80, Temp: 101°F, Pulse: 78',
    status: 'completed',
    date: '20/01/2026',
  },
  {
    visitId: 'V002',
    patientName: 'Ravi Silva',
    patientId: 'P002',
    doctorName: 'Dr. Sunil Jayawardena',
    checkInTime: '10:15',
    diagnosis: 'Hypertension follow-up',
    vitalsSummary: 'BP: 145/95, Temp: 98.6°F, Pulse: 82',
    status: 'completed',
    date: '20/01/2026',
  },
  {
    visitId: 'V003',
    patientName: 'Anjali De Silva',
    patientId: 'P003',
    doctorName: 'Dr. Nimal Fernando',
    checkInTime: '11:00',
    diagnosis: 'Diabetes mellitus type 2',
    vitalsSummary: 'BP: 130/85, Glucose: 145 mg/dL, Pulse: 75',
    status: 'completed',
    date: '21/01/2026',
  },
  {
    visitId: 'V004',
    patientName: 'Kamal Wijesinghe',
    patientId: 'P004',
    doctorName: 'Dr. Sunil Jayawardena',
    checkInTime: '14:30',
    diagnosis: 'Pending assessment',
    vitalsSummary: 'BP: 118/76, Temp: 98.4°F',
    status: 'checked_in',
    date: '22/01/2026',
  },
];

const generateLabTestData = (): LabTestRow[] => [
  {
    labOrderId: 'LO001',
    patientName: 'Priya Perera',
    patientId: 'P001',
    testName: 'Complete Blood Count (CBC)',
    orderedDate: '20/01/2026',
    resultValue: 'WBC: 8500, RBC: 4.5M, Hb: 13.5 g/dL',
    resultStatus: 'completed',
    labTechName: 'Saman Kumara',
    completedDate: '21/01/2026',
  },
  {
    labOrderId: 'LO002',
    patientName: 'Ravi Silva',
    patientId: 'P002',
    testName: 'Lipid Profile',
    orderedDate: '20/01/2026',
    resultValue: 'Total: 220 mg/dL, LDL: 145, HDL: 40',
    resultStatus: 'completed',
    labTechName: 'Nisha Dias',
    completedDate: '21/01/2026',
  },
  {
    labOrderId: 'LO003',
    patientName: 'Anjali De Silva',
    patientId: 'P003',
    testName: 'Fasting Blood Sugar',
    orderedDate: '21/01/2026',
    resultValue: 'Pending',
    resultStatus: 'pending',
    labTechName: 'Saman Kumara',
  },
  {
    labOrderId: 'LO004',
    patientName: 'Kamal Wijesinghe',
    patientId: 'P004',
    testName: 'Liver Function Test',
    orderedDate: '22/01/2026',
    resultValue: 'Pending',
    resultStatus: 'pending',
  },
];

const generatePrescriptionData = (): PrescriptionRow[] => [
  {
    prescriptionId: 'RX001',
    patientName: 'Priya Perera',
    patientId: 'P001',
    doctorName: 'Dr. Nimal Fernando',
    medicineName: 'Paracetamol 500mg',
    qty: 20,
    dosage: '1 tablet 3 times daily',
    durationDays: 7,
    issuedQty: 20,
    prescribedDate: '20/01/2026',
  },
  {
    prescriptionId: 'RX002',
    patientName: 'Ravi Silva',
    patientId: 'P002',
    doctorName: 'Dr. Sunil Jayawardena',
    medicineName: 'Amlodipine 5mg',
    qty: 30,
    dosage: '1 tablet once daily',
    durationDays: 30,
    issuedQty: 30,
    prescribedDate: '20/01/2026',
  },
  {
    prescriptionId: 'RX003',
    patientName: 'Anjali De Silva',
    patientId: 'P003',
    doctorName: 'Dr. Nimal Fernando',
    medicineName: 'Metformin 500mg',
    qty: 60,
    dosage: '1 tablet twice daily',
    durationDays: 30,
    issuedQty: 60,
    prescribedDate: '21/01/2026',
  },
  {
    prescriptionId: 'RX004',
    patientName: 'Priya Perera',
    patientId: 'P001',
    doctorName: 'Dr. Nimal Fernando',
    medicineName: 'Amoxicillin 250mg',
    qty: 15,
    dosage: '1 capsule 3 times daily',
    durationDays: 5,
    prescribedDate: '20/01/2026',
  },
];

const generateInventoryData = (): InventoryRow[] => [
  {
    medicineId: 'M001',
    medicineName: 'Paracetamol 500mg',
    batchNo: 'BATCH-2024-001',
    qtyRemaining: 450,
    expiryDate: '15/12/2026',
    reorderLevel: 200,
    status: 'ok',
    daysUntilExpiry: 324,
  },
  {
    medicineId: 'M002',
    medicineName: 'Amlodipine 5mg',
    batchNo: 'BATCH-2024-002',
    qtyRemaining: 85,
    expiryDate: '30/06/2026',
    reorderLevel: 100,
    status: 'low',
    daysUntilExpiry: 156,
  },
  {
    medicineId: 'M003',
    medicineName: 'Metformin 500mg',
    batchNo: 'BATCH-2023-045',
    qtyRemaining: 120,
    expiryDate: '10/02/2026',
    reorderLevel: 150,
    status: 'expiring',
    daysUntilExpiry: 16,
  },
  {
    medicineId: 'M004',
    medicineName: 'Amoxicillin 250mg',
    batchNo: 'BATCH-2024-015',
    qtyRemaining: 320,
    expiryDate: '20/09/2026',
    reorderLevel: 150,
    status: 'ok',
    daysUntilExpiry: 238,
  },
  {
    medicineId: 'M005',
    medicineName: 'Atorvastatin 10mg',
    batchNo: 'BATCH-2024-008',
    qtyRemaining: 45,
    expiryDate: '05/03/2026',
    reorderLevel: 80,
    status: 'low',
    daysUntilExpiry: 39,
  },
];

// Mock saved reports
const mockSavedReports: SavedReport[] = [
  {
    id: 'RPT001',
    title: 'January Patient Visits Summary',
    type: 'PATIENT_VISIT',
    status: 'published',
    createdBy: 'Admin User',
    createdDate: '15/01/2026',
    lastModified: '16/01/2026',
  },
  {
    id: 'RPT002',
    title: 'Weekly Lab Test Analysis',
    type: 'LAB_TEST',
    status: 'draft',
    createdBy: 'Lab Manager',
    createdDate: '20/01/2026',
  },
  {
    id: 'RPT003',
    title: 'Prescription Trends - Q1 2026',
    type: 'PRESCRIPTION',
    status: 'under_review',
    createdBy: 'Dr. Nimal Fernando',
    createdDate: '18/01/2026',
    lastModified: '22/01/2026',
  },
  {
    id: 'RPT004',
    title: 'Inventory Stock Alert',
    type: 'INVENTORY',
    status: 'published',
    createdBy: 'Pharmacy Manager',
    createdDate: '22/01/2026',
  },
];

// API Functions
export const getSavedReports = async (): Promise<SavedReport[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockSavedReports;
};

export const generateReport = async (
  payload: GenerateReportPayload
): Promise<ReportPreview> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  let data: any[] = [];
  let summary: ReportSummary = { totalRecords: 0 };

  switch (payload.type) {
    case 'PATIENT_VISIT':
      data = generatePatientVisitData();
      summary = {
        totalRecords: data.length,
        completed: data.filter((d) => d.status === 'completed').length,
        checkedIn: data.filter((d) => d.status === 'checked_in').length,
      };
      break;

    case 'LAB_TEST':
      data = generateLabTestData();
      summary = {
        totalRecords: data.length,
        completed: data.filter((d) => d.resultStatus === 'completed').length,
        pending: data.filter((d) => d.resultStatus === 'pending').length,
      };
      break;

    case 'PRESCRIPTION':
      data = generatePrescriptionData();
      summary = {
        totalRecords: data.length,
        totalPrescribedQty: data.reduce((sum, d) => sum + d.qty, 0),
        totalIssuedQty: data.reduce((sum, d) => sum + (d.issuedQty || 0), 0),
      };
      break;

    case 'INVENTORY':
      data = generateInventoryData();
      summary = {
        totalRecords: data.length,
        lowStock: data.filter((d) => d.status === 'low').length,
        expiringSoon: data.filter((d) => d.status === 'expiring').length,
        totalQty: data.reduce((sum, d) => sum + d.qtyRemaining, 0),
      };
      break;
  }

  const reportId = `RPT-${Date.now()}`;

  return {
    reportId,
    type: payload.type,
    data,
    summary,
    generatedAt: new Date().toLocaleString('en-GB', { 
      timeZone: 'Asia/Colombo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
  };
};

export const getReportPreview = async (reportId: string): Promise<ReportPreview> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Mock: return a patient visit report preview
  return {
    reportId,
    type: 'PATIENT_VISIT',
    data: generatePatientVisitData(),
    summary: {
      totalRecords: 4,
      completed: 3,
      checkedIn: 1,
    },
    generatedAt: '25/01/2026, 10:30',
  };
};

export const deleteReport = async (reportId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Deleted report:', reportId);
};

export const downloadReportPDF = async (reportId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log('Downloaded PDF for report:', reportId);
};

export const downloadReportCSV = async (reportId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Downloaded CSV for report:', reportId);
};
