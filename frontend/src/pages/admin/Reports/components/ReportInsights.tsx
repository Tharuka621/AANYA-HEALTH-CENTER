import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  ReportPreview,
  ReportType,
  PatientVisitRow,
  LabTestRow,
  PrescriptionRow,
  InventoryRow,
} from '../../../../types/reports';

interface ReportInsightsProps {
  reportType: ReportType;
  reportPreview: ReportPreview | null;
}

interface SeriesPoint {
  label: string;
  value: number;
}

const cardPalette = ['#1565c0', '#2e7d32', '#ed6c02', '#6a1b9a'];

const normalizeSeries = (points: SeriesPoint[]) => {
  const max = Math.max(...points.map((p) => p.value), 1);
  return points.map((p) => ({ ...p, width: `${Math.round((p.value / max) * 100)}%` }));
};

const toPatientRows = (data: ReportPreview['data']): PatientVisitRow[] =>
  data.filter((row): row is PatientVisitRow => 'visitId' in row);

const toLabRows = (data: ReportPreview['data']): LabTestRow[] =>
  data.filter((row): row is LabTestRow => 'labOrderId' in row);

const toPrescriptionRows = (data: ReportPreview['data']): PrescriptionRow[] =>
  data.filter((row): row is PrescriptionRow => 'prescriptionId' in row);

const toInventoryRows = (data: ReportPreview['data']): InventoryRow[] =>
  data.filter((row): row is InventoryRow => 'medicineId' in row);

const StatCard: React.FC<{ title: string; value: string | number; index: number }> = ({ title, value, index }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ color: cardPalette[index % cardPalette.length] }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

const BarList: React.FC<{ title: string; series: SeriesPoint[]; color?: string }> = ({ title, series, color = '#1976d2' }) => {
  const normalized = useMemo(() => normalizeSeries(series), [series]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        {title}
      </Typography>
      <Box display="flex" flexDirection="column" gap={1.5}>
        {normalized.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        )}
        {normalized.map((item) => (
          <Box key={item.label}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {item.value}
              </Typography>
            </Box>
            <Box sx={{ height: 10, borderRadius: 2, bgcolor: 'grey.200', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', borderRadius: 2, bgcolor: color, width: item.width, transition: 'width 0.35s ease' }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

const ReportInsights: React.FC<ReportInsightsProps> = ({ reportType, reportPreview }) => {
  if (!reportPreview) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Generate a report to view insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Insights are built from the current report dataset.
        </Typography>
      </Box>
    );
  }

  const summary = reportPreview.summary || { totalRecords: reportPreview.data.length };

  if (reportType === 'PATIENT_VISIT') {
    const rows = toPatientRows(reportPreview.data);
    const byDoctor = Array.from(
      rows.reduce((map, row) => map.set(row.doctorName, (map.get(row.doctorName) || 0) + 1), new Map<string, number>())
    ).map(([label, value]) => ({ label, value }));

    const byStatus = Array.from(
      rows.reduce((map, row) => map.set(row.status, (map.get(row.status) || 0) + 1), new Map<string, number>())
    ).map(([label, value]) => ({ label: label.replace('_', ' '), value }));

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={2}>
          <StatCard title="Total Visits" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Completed" value={summary.completed || byStatus.find((s) => s.label === 'completed')?.value || 0} index={1} />
          <StatCard title="Checked In" value={summary.checkedIn || byStatus.find((s) => s.label === 'checked in')?.value || 0} index={2} />
          <StatCard title="Unique Doctors" value={new Set(rows.map((r) => r.doctorName)).size} index={3} />
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BarList title="Visits by Doctor" series={byDoctor} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={6}>
            <BarList title="Visit Status Mix" series={byStatus} color="#2e7d32" />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (reportType === 'LAB_TEST') {
    const rows = toLabRows(reportPreview.data);
    const byTest = Array.from(
      rows.reduce((map, row) => map.set(row.testName, (map.get(row.testName) || 0) + 1), new Map<string, number>())
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const byStatus = Array.from(
      rows.reduce((map, row) => map.set(row.resultStatus, (map.get(row.resultStatus) || 0) + 1), new Map<string, number>())
    ).map(([label, value]) => ({ label, value }));

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={2}>
          <StatCard title="Total Tests" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Completed" value={summary.completed || byStatus.find((s) => s.label === 'completed')?.value || 0} index={1} />
          <StatCard title="Pending" value={summary.pending || byStatus.find((s) => s.label === 'pending')?.value || 0} index={2} />
          <StatCard title="Unique Test Types" value={new Set(rows.map((r) => r.testName)).size} index={3} />
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BarList title="Most Ordered Tests" series={byTest} color="#6a1b9a" />
          </Grid>
          <Grid item xs={12} md={6}>
            <BarList title="Result Status Mix" series={byStatus} color="#ed6c02" />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (reportType === 'PRESCRIPTION') {
    const rows = toPrescriptionRows(reportPreview.data);
    const byMedicine = Array.from(
      rows.reduce((map, row) => map.set(row.medicineName, (map.get(row.medicineName) || 0) + row.qty), new Map<string, number>())
    )
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const byDoctor = Array.from(
      rows.reduce((map, row) => map.set(row.doctorName, (map.get(row.doctorName) || 0) + 1), new Map<string, number>())
    ).map(([label, value]) => ({ label, value }));

    const totalIssued = rows.reduce((sum, row) => sum + Number(row.issuedQty || 0), 0);

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={2}>
          <StatCard title="Prescription Rows" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Total Qty Prescribed" value={summary.totalPrescribedQty || rows.reduce((sum, row) => sum + row.qty, 0)} index={1} />
          <StatCard title="Total Qty Issued" value={summary.totalIssuedQty || totalIssued} index={2} />
          <StatCard title="Unique Medicines" value={new Set(rows.map((r) => r.medicineName)).size} index={3} />
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <BarList title="Top Medicines by Quantity" series={byMedicine} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} md={6}>
            <BarList title="Prescriptions by Doctor" series={byDoctor} color="#1565c0" />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const rows = toInventoryRows(reportPreview.data);
  const byStatus = Array.from(
    rows.reduce((map, row) => map.set(row.status, (map.get(row.status) || 0) + 1), new Map<string, number>())
  ).map(([label, value]) => ({ label, value }));

  const lowStockRows = rows
    .filter((row) => row.status === 'low' || row.status === 'expiring')
    .map((row) => ({
      label: `${row.medicineName} (${row.batchNo})`,
      value: row.qtyRemaining,
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 8);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} mb={2}>
        <StatCard title="Inventory Rows" value={summary.totalRecords || rows.length} index={0} />
        <StatCard title="Total Quantity" value={summary.totalQty || rows.reduce((sum, row) => sum + row.qtyRemaining, 0)} index={1} />
        <StatCard title="Low Stock" value={summary.lowStock || byStatus.find((s) => s.label === 'low')?.value || 0} index={2} />
        <StatCard title="Expiring Soon" value={summary.expiringSoon || byStatus.find((s) => s.label === 'expiring')?.value || 0} index={3} />
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <BarList title="Stock Health Mix" series={byStatus} color="#ed6c02" />
        </Grid>
        <Grid item xs={12} md={6}>
          <BarList title="Most Critical Stock Levels" series={lowStockRows} color="#c62828" />
        </Grid>
      </Grid>
      <Box mt={2.5}>
        <Chip label={`Generated at ${reportPreview.generatedAt}`} color="default" variant="outlined" />
      </Box>
    </Box>
  );
};

export default ReportInsights;
