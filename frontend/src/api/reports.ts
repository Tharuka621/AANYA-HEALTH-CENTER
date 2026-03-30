import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';
import { axiosInstance } from '../services/api';
import {
  GenerateReportPayload,
  InventoryRow,
  LabTestRow,
  PatientVisitRow,
  PrescriptionRow,
  ReportFilters,
  ReportPreview,
  ReportSummary,
  ReportType,
  SavedReport,
} from '../types/reports';

const SAVED_REPORTS_KEY = 'aanya-admin-saved-reports';
const REPORT_PREVIEWS_KEY = 'aanya-admin-report-previews';

const safeParseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

const formatDate = (value?: string | null) => {
  const parsed = safeParseDate(value);
  return parsed ? format(parsed, 'dd/MM/yyyy') : '';
};

const formatTime = (value?: string | null) => {
  if (!value) return '';
  return value.slice(0, 5);
};

const parseFilterDate = (value?: string | null) => {
  if (!value) return null;
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) return null;
  const parsed = new Date(year, month - 1, day);
  return isValid(parsed) ? parsed : null;
};

const isWithinDateRange = (value: string | null | undefined, filters: ReportFilters) => {
  const targetDate = safeParseDate(value || null);
  if (!targetDate) return false;

  const from = parseFilterDate(filters.dateFrom);
  const to = parseFilterDate(filters.dateTo);

  if (from && targetDate < from) return false;
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setHours(23, 59, 59, 999);
    if (targetDate > endOfDay) return false;
  }

  return true;
};

const readSavedReports = (): SavedReport[] => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(SAVED_REPORTS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SavedReport[];
  } catch {
    return [];
  }
};

const writeSavedReports = (reports: SavedReport[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(reports));
};

const readReportPreviews = (): Record<string, ReportPreview> => {
  if (typeof window === 'undefined') return {};
  const raw = window.localStorage.getItem(REPORT_PREVIEWS_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, ReportPreview>;
  } catch {
    return {};
  }
};

const writeReportPreviews = (previews: Record<string, ReportPreview>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REPORT_PREVIEWS_KEY, JSON.stringify(previews));
};

const toVisitStatus = (status?: string | null) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') return 'completed' as const;
  if (normalized === 'cancelled') return 'cancelled' as const;
  return 'checked_in' as const;
};

const buildVitalsSummary = (row: any) => {
  const parts = [] as string[];
  if (row.systolic_bp || row.diastolic_bp) {
    parts.push(`BP: ${row.systolic_bp || '-'}${row.diastolic_bp ? `/${row.diastolic_bp}` : ''}`);
  }
  if (row.temperature) {
    parts.push(`Temp: ${row.temperature}`);
  }
  if (row.pulse) {
    parts.push(`Pulse: ${row.pulse}`);
  }
  if (row.weight) {
    parts.push(`Weight: ${row.weight}`);
  }
  if (row.sugar_level) {
    parts.push(`Sugar: ${row.sugar_level}`);
  }
  return parts.join(', ') || 'No vitals recorded';
};

const buildPatientVisitReport = async (filters: ReportFilters) => {
  const response = await axiosInstance.get('/admin/appointments');
  const mapped = (response.data.appointments || [])
    .filter((row: any) => isWithinDateRange(row.slot_date, filters))
    .map((row: any) => ({
      visitId: String(row.visit_id || row.id),
      patientName: row.patient_name || 'Unknown Patient',
      patientId: String(row.patient_id || ''),
      doctorName: row.doctor_name || 'Unknown Doctor',
      checkInTime: formatTime(row.check_in_time || row.start_time),
      diagnosis: row.diagnosis || row.reason || 'Not recorded',
      vitalsSummary: buildVitalsSummary(row),
      status: toVisitStatus(row.visit_status || row.status),
      date: formatDate(row.slot_date),
    }))
    .filter((row: PatientVisitRow) => {
      const patientMatch = !('patientId' in filters) || !filters.patientId || row.patientId === filters.patientId;
      const statusMatch = !('status' in filters) || !filters.status || row.status === filters.status;
      return patientMatch && statusMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      completed: mapped.filter((row: PatientVisitRow) => row.status === 'completed').length,
      checkedIn: mapped.filter((row: PatientVisitRow) => row.status === 'checked_in').length,
    } as ReportSummary,
  };
};

const buildLabTestReport = async (filters: ReportFilters) => {
  const response = await axiosInstance.get('/admin/lab-tests');
  const mapped = (response.data.labTests || [])
    .filter((row: any) => isWithinDateRange(row.requested_date, filters))
    .map((row: any) => ({
      labOrderId: String(row.lab_order_id),
      patientName: row.patient_name || 'Unknown Patient',
      patientId: String(row.patient_id || ''),
      testName: row.test_name || 'Unknown Test',
      orderedDate: formatDate(row.requested_date),
      resultValue: row.result_text || 'Pending',
      resultStatus: String(row.item_status || 'pending').toLowerCase() as LabTestRow['resultStatus'],
      labTechName: row.lab_tech_name || undefined,
      completedDate: formatDate(row.completed_at) || undefined,
    }))
    .filter((row: LabTestRow) => {
      const statusMatch = !('resultStatus' in filters) || !filters.resultStatus || row.resultStatus === filters.resultStatus;
      const typeMatch = !('testType' in filters) || !filters.testType || row.testName.toLowerCase().includes(String(filters.testType).toLowerCase());
      return statusMatch && typeMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      completed: mapped.filter((row: LabTestRow) => row.resultStatus === 'completed').length,
      pending: mapped.filter((row: LabTestRow) => row.resultStatus === 'pending').length,
    } as ReportSummary,
  };
};

const buildPrescriptionReport = async (filters: ReportFilters) => {
  const response = await axiosInstance.get('/admin/prescriptions');
  const mapped = (response.data.prescriptions || [])
    .filter((row: any) => isWithinDateRange(row.created_at, filters))
    .flatMap((row: any) => {
      const items = Array.isArray(row.items) ? row.items.filter(Boolean) : [];
      if (items.length === 0) {
        return [{
          prescriptionId: `RX-${row.id}`,
          patientName: row.patient_name || 'Unknown Patient',
          patientId: String(row.patient_id || ''),
          doctorName: row.doctor_name || 'Unknown Doctor',
          medicineName: 'No items',
          qty: 0,
          dosage: '-',
          durationDays: 0,
          issuedQty: 0,
          prescribedDate: formatDate(row.created_at),
        }];
      }

      return items.map((item: any) => ({
        prescriptionId: `RX-${row.id}`,
        patientName: row.patient_name || 'Unknown Patient',
        patientId: String(row.patient_id || ''),
        doctorName: row.doctor_name || 'Unknown Doctor',
        medicineName: item.medicine_name || 'Unknown Medicine',
        qty: Number(item.qty || 0),
        dosage: item.dosage || '-',
        durationDays: Number(item.duration_days || 0),
        issuedQty: String(row.status || '').toUpperCase() === 'ACTIVE' ? Number(item.qty || 0) : 0,
        prescribedDate: formatDate(row.created_at),
      }));
    })
    .filter((row: PrescriptionRow) => {
      const medicineMatch = !('medicineId' in filters) || !filters.medicineId || row.medicineName.toLowerCase().includes(String(filters.medicineId).toLowerCase());
      const issuedMatch = !('issuedOnly' in filters) || !filters.issuedOnly || Number(row.issuedQty || 0) > 0;
      return medicineMatch && issuedMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      totalPrescribedQty: mapped.reduce((sum: number, row: PrescriptionRow) => sum + row.qty, 0),
      totalIssuedQty: mapped.reduce((sum: number, row: PrescriptionRow) => sum + Number(row.issuedQty || 0), 0),
    } as ReportSummary,
  };
};

const buildInventoryReport = async (filters: ReportFilters) => {
  const response = await axiosInstance.get('/admin/pharmacy/inventory');
  const today = new Date();

  const mapped = (response.data.inventory || [])
    .map((row: any) => {
      const expiryDate = safeParseDate(row.expiry_date);
      const daysUntilExpiry = expiryDate ? differenceInCalendarDays(expiryDate, today) : undefined;
      const quantity = Number(row.stock_quantity || 0);
      const reorderLevel = Number(row.reorder_level || 0);
      let status: InventoryRow['status'] = 'ok';

      if (typeof daysUntilExpiry === 'number' && daysUntilExpiry <= 30) {
        status = 'expiring';
      } else if (quantity <= reorderLevel) {
        status = 'low';
      }

      return {
        medicineId: String(row.medicine_id || row.id),
        medicineName: row.name || 'Unknown Medicine',
        batchNo: row.batch_no || 'N/A',
        qtyRemaining: quantity,
        expiryDate: formatDate(row.expiry_date),
        reorderLevel,
        status,
        daysUntilExpiry,
      };
    })
    .filter((row: InventoryRow) => {
      const lowStockMatch = !('lowStockOnly' in filters) || !filters.lowStockOnly || row.status === 'low';
      const medicineMatch = !('medicineId' in filters) || !filters.medicineId || row.medicineName.toLowerCase().includes(String(filters.medicineId).toLowerCase());
      const expiryMatch = !('expiringWithinDays' in filters) || !filters.expiringWithinDays || (typeof row.daysUntilExpiry === 'number' && row.daysUntilExpiry <= filters.expiringWithinDays);
      return lowStockMatch && medicineMatch && expiryMatch;
    });

  return {
    data: mapped,
    summary: {
      totalRecords: mapped.length,
      lowStock: mapped.filter((row: InventoryRow) => row.status === 'low').length,
      expiringSoon: mapped.filter((row: InventoryRow) => row.status === 'expiring').length,
      totalQty: mapped.reduce((sum: number, row: InventoryRow) => sum + row.qtyRemaining, 0),
    } as ReportSummary,
  };
};

const saveGeneratedReport = (report: SavedReport, preview: ReportPreview) => {
  const reports = readSavedReports().filter((item) => item.id !== report.id);
  writeSavedReports([report, ...reports]);

  const previews = readReportPreviews();
  previews[report.id] = preview;
  writeReportPreviews(previews);
};

const downloadBlob = (content: string, fileName: string, type: string) => {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

export const getSavedReports = async (): Promise<SavedReport[]> => readSavedReports();

export const generateReport = async (payload: GenerateReportPayload): Promise<ReportPreview> => {
  let result: { data: any[]; summary: ReportSummary } = { data: [], summary: { totalRecords: 0 } };

  switch (payload.type) {
    case 'PATIENT_VISIT':
      result = await buildPatientVisitReport(payload.filters);
      break;
    case 'LAB_TEST':
      result = await buildLabTestReport(payload.filters);
      break;
    case 'PRESCRIPTION':
      result = await buildPrescriptionReport(payload.filters);
      break;
    case 'INVENTORY':
      result = await buildInventoryReport(payload.filters);
      break;
  }

  const reportId = `RPT-${Date.now()}`;
  const generatedAt = format(new Date(), 'dd/MM/yyyy, HH:mm');
  const preview: ReportPreview = {
    reportId,
    type: payload.type,
    data: result.data,
    summary: result.summary,
    generatedAt,
  };

  saveGeneratedReport(
    {
      id: reportId,
      title: payload.title,
      type: payload.type,
      status: 'published',
      createdBy: 'Admin',
      createdDate: format(new Date(), 'dd/MM/yyyy'),
      lastModified: format(new Date(), 'dd/MM/yyyy'),
    },
    preview
  );

  return preview;
};

export const getReportPreview = async (reportId: string): Promise<ReportPreview> => {
  const preview = readReportPreviews()[reportId];
  if (!preview) {
    throw new Error('Report preview not found');
  }
  return preview;
};

export const deleteReport = async (reportId: string): Promise<void> => {
  writeSavedReports(readSavedReports().filter((report) => report.id !== reportId));
  const previews = readReportPreviews();
  delete previews[reportId];
  writeReportPreviews(previews);
};

export const downloadReportPDF = async (reportId: string): Promise<void> => {
  const preview = await getReportPreview(reportId);
  const content = JSON.stringify(preview, null, 2);
  downloadBlob(content, `${reportId}.txt`, 'text/plain;charset=utf-8');
};

export const downloadReportCSV = async (reportId: string): Promise<void> => {
  const preview = await getReportPreview(reportId);
  if (!preview.data.length) {
    downloadBlob('', `${reportId}.csv`, 'text/csv;charset=utf-8');
    return;
  }

  const headers = Object.keys(preview.data[0] as Record<string, unknown>);
  const rows = preview.data.map((row) =>
    headers
      .map((header) => {
        const value = (row as Record<string, unknown>)[header];
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  downloadBlob([headers.join(','), ...rows].join('\n'), `${reportId}.csv`, 'text/csv;charset=utf-8');
};
