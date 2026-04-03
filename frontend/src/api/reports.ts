import { axiosInstance } from '../services/api';
import {
  GenerateReportPayload,
  ReportPreview,
  ReportRow,
  SavedReport,
} from '../types/reports';

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

export const getSavedReports = async (): Promise<SavedReport[]> => {
  const response = await axiosInstance.get('/admin/reports/saved');
  return response.data.reports || [];
};

export const generateReport = async (payload: GenerateReportPayload): Promise<ReportPreview> => {
  const response = await axiosInstance.post('/admin/reports/generate', payload);
  return response.data.preview;
};

export const getReportPreview = async (reportId: string): Promise<ReportPreview> => {
  const response = await axiosInstance.get(`/admin/reports/${reportId}`);
  return response.data.preview;
};

export const deleteReport = async (reportId: string): Promise<void> => {
  await axiosInstance.delete(`/admin/reports/${reportId}`);
};

export const downloadReportPDF = async (reportId: string): Promise<void> => {
  const preview = await getReportPreview(reportId);
  const content = JSON.stringify(preview, null, 2);
  downloadBlob(content, `${reportId}.txt`, 'text/plain;charset=utf-8');
};

const toCsv = (data: ReportRow[]) => {
  if (!data.length) return '';

  const firstRow = data[0] as unknown as Record<string, unknown>;
  const headers = Object.keys(firstRow);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = (row as unknown as Record<string, unknown>)[header];
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};

export const downloadReportCSV = async (reportId: string): Promise<void> => {
  const preview = await getReportPreview(reportId);
  downloadBlob(toCsv(preview.data), `${reportId}.csv`, 'text/csv;charset=utf-8');
};
