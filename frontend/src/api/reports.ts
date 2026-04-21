import { axiosInstance } from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

const toPdfCellValue = (value: unknown): string => {
  const raw = String(value ?? '');
  const singleLine = raw.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= 40) return singleLine;
  return `${singleLine.slice(0, 37)}...`;
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

export const downloadReportPDF = async (reportId: string, chartImages: string[] = []): Promise<void> => {
  const preview = await getReportPreview(reportId);
  if (!preview || !preview.data) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(25, 118, 210); // Professional Blue
  doc.text('AANYA HEALTH CENTER', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Official Clinical & Operational Report', pageWidth / 2, 28, { align: 'center' });
  
  // Report Info
  doc.setDrawColor(200);
  doc.line(20, 35, pageWidth - 20, 35);
  
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(preview.type.replace('_', ' ') + ' REPORT', 20, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`ID: ${preview.reportId}`, 20, 52);
  doc.text(`Generated At: ${preview.generatedAt}`, 20, 57);
  
  // Summary Stats
  let currentY = 70;
  if (preview.summary) {
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Summary Overview', 20, currentY);
    
    currentY += 8;
    Object.entries(preview.summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${label}:`, 25, currentY);
      doc.setTextColor(0);
      doc.text(String(value), 80, currentY);
      currentY += 7;
    });
  }

  // Add Charts if provided
  if (chartImages.length > 0) {
    currentY += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Visual Insights', 20, currentY);
    currentY += 5;

    chartImages.forEach((imgData, index) => {
      // Check if we need a new page for the chart
      if (currentY + 60 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        currentY = 20;
      }
      
      const imgWidth = (pageWidth - 40) / (chartImages.length > 1 ? 2 : 1);
      const xPos = index % 2 === 0 ? 20 : pageWidth / 2 + 5;
      
      doc.addImage(imgData, 'PNG', xPos, currentY, imgWidth, 60);
      
      if (index % 2 !== 0 || chartImages.length === 1) {
        currentY += 70;
      }
    });
  }

  // Data Table
  const headers = Object.keys(preview.data[0] || {}).map(h => 
    h.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  );
  const rows = preview.data.map((row) => Object.values(row).map((value) => toPdfCellValue(value)));

  autoTable(doc, {
    startY: currentY + 10,
    head: [headers],
    body: rows,
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { fillColor: [25, 118, 210], fontSize: 8 },
    bodyStyles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 30 },
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: [0],
  });

  doc.save(`${preview.type.toLowerCase()}_report_${Date.now()}.pdf`);
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
