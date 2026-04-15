import React from 'react';
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ReportPreview,
  ReportType,
  PatientVisitRow,
  LabTestRow,
  PrescriptionRow,
  InventoryRow,
  PharmacyPredictionRow,
  PharmacyProfitabilityRow,
  PeakClinicHoursRow,
} from '../../../../types/reports';

const STAT_COLORS = ['#1976d2', '#2e7d32', '#ed6c02'];
const PIE_COLORS = ['#1976d2', '#2e7d32', '#ed6c02'];

const toPatientRows = (data: ReportPreview['data']): PatientVisitRow[] =>
  data.filter((row): row is PatientVisitRow => 'visitId' in row);

const toLabRows = (data: ReportPreview['data']): LabTestRow[] =>
  data.filter((row): row is LabTestRow => 'labOrderId' in row);

const toPrescriptionRows = (data: ReportPreview['data']): PrescriptionRow[] =>
  data.filter((row): row is PrescriptionRow => 'prescriptionId' in row);

const toInventoryRows = (data: ReportPreview['data']): InventoryRow[] =>
  data.filter((row): row is InventoryRow => 'medicineId' in row && 'batchNo' in row);

const toPharmacyPredictionRows = (data: ReportPreview['data']): PharmacyPredictionRow[] =>
  data.filter((row): row is PharmacyPredictionRow => 'medicineId' in row && !('batchNo' in row) && !('totalProfit' in row));

const toPharmacyProfitabilityRows = (data: ReportPreview['data']): PharmacyProfitabilityRow[] =>
  data.filter((row): row is PharmacyProfitabilityRow => 'totalProfit' in row);

const toPeakClinicHoursRows = (data: ReportPreview['data']): PeakClinicHoursRow[] =>
  data.filter((row): row is PeakClinicHoursRow => 'hourOfDay' in row);

const StatCard: React.FC<{ title: string; value: string | number; index: number }> = ({ title, value, index }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ color: STAT_COLORS[index % STAT_COLORS.length] }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

const ChartWrapper: React.FC<{ title: string; id: string; height?: number; children: React.ReactNode }> = ({ title, id, height = 300, children }) => (
  <Paper id={id} variant="outlined" sx={{ borderRadius: 3, p: 2.5, height: '100%', bgcolor: 'white' }}>
    <Typography variant="subtitle1" fontWeight={700} mb={3}>
      {title}
    </Typography>
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </Box>
  </Paper>
);

interface ReportInsightsProps {
  reportType: ReportType;
  reportPreview: ReportPreview | null;
}

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

  // Render logic for each report type...
  if (reportType === 'PATIENT_VISIT') {
    const rows = toPatientRows(reportPreview.data);
    const byDoctor = Array.from(
      rows.reduce((map, row) => map.set(row.doctorName, (map.get(row.doctorName) || 0) + 1), new Map<string, number>())
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const byStatus = Array.from(
      rows.reduce((map, row) => map.set(row.status, (map.get(row.status) || 0) + 1), new Map<string, number>())
    ).map(([name, value]) => ({ name: name.replace('_', ' ').toUpperCase(), value }));

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={3}>
          <StatCard title="Total Visits" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Completed" value={summary.completed || 0} index={1} />
          <StatCard title="Checked In" value={summary.checkedIn || 0} index={2} />
          <StatCard title="Unique Doctors" value={new Set(rows.map((r) => r.doctorName)).size} index={3} />
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <ChartWrapper title="Visits by Doctor (Ranking)" id="chart-visits-doctor">
              <BarChart data={byDoctor} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} />
                <Bar dataKey="value" fill="#1976d2" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ChartWrapper>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChartWrapper title="Visit Status Distribution" id="chart-visit-status">
              <PieChart>
                <Pie
                  data={byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {byStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ChartWrapper>
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
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const byStatus = Array.from(
      rows.reduce((map, row) => map.set(row.resultStatus, (map.get(row.resultStatus) || 0) + 1), new Map<string, number>())
    ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={3}>
          <StatCard title="Total Tests" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Completed" value={summary.completed || 0} index={1} />
          <StatCard title="Pending" value={summary.pending || 0} index={2} />
          <StatCard title="Unique Test Types" value={new Set(rows.map((r) => r.testName)).size} index={3} />
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <ChartWrapper title="Most Ordered Tests" id="chart-ordered-tests">
              <BarChart data={byTest} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ed6c02" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ChartWrapper>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChartWrapper title="Test Result Mix" id="chart-test-results">
              <PieChart>
                <Pie
                  data={byStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {byStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartWrapper>
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
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const byDoctor = Array.from(
      rows.reduce((map, row) => map.set(row.doctorName, (map.get(row.doctorName) || 0) + 1), new Map<string, number>())
    ).map(([name, value]) => ({ name, value }));

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={3}>
          <StatCard title="Total RX Rows" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Total Qty" value={summary.totalPrescribedQty || 0} index={4} />
          <StatCard title="Total Issued" value={summary.totalIssuedQty || 0} index={1} />
          <StatCard title="Unique Medicines" value={new Set(rows.map((r) => r.medicineName)).size} index={3} />
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Top Medicines (by Quantity)" id="chart-top-medicines">
              <BarChart data={byMedicine}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartWrapper>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartWrapper title="Prescriptions by Doctor" id="chart-prescription-doctor">
              <PieChart>
                <Pie data={byDoctor} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                  {byDoctor.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartWrapper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (reportType === 'PHARMACY_PREDICTION') {
    const rows = toPharmacyPredictionRows(reportPreview.data);
    const topByDemand = rows
      .map((r) => ({ name: r.medicineName, value: r.predictedNeed }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const statusCounts = Array.from(
      rows.reduce((map, row) => map.set(row.status, (map.get(row.status) || 0) + 1), new Map<string, number>())
    ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={3}>
          <StatCard title="Total Analysed" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Critical" value={summary.criticalItems || 0} index={3} />
          <StatCard title="Low Stock" value={summary.lowStockItems || 0} index={2} />
          <StatCard title="Total Rec. Order" value={summary.totalRecommendedOrder || 0} index={6} />
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <ChartWrapper title="Top Predicted Demand" id="chart-predicted-demand">
              <BarChart data={topByDemand}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartWrapper>
          </Grid>
          <Grid item xs={12} md={5}>
            <ChartWrapper title="Inventory Status Mix" id="chart-inventory-status">
              <PieChart>
                <Pie data={statusCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusCounts.map((entry, index) => {
                    const colors: Record<string, string> = { 'CRITICAL': '#c62828', 'LOW': '#ed6c02', 'ADEQUATE': '#2e7d32' };
                    return <Cell key={`cell-${index}`} fill={colors[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ChartWrapper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (reportType === 'PHARMACY_PROFITABILITY') {
    const rows = toPharmacyProfitabilityRows(reportPreview.data);
    const topProfitable = [...rows]
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 10);

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={3}>
          <StatCard title="Total Medicines" value={summary.totalRecords || rows.length} index={0} />
          <StatCard title="Total Revenue" value={`Rs. ${summary.totalRevenue || 0}`} index={1} />
          <StatCard title="Total Profit" value={`Rs. ${summary.totalProfit || 0}`} index={2} />
          <StatCard title="Avg Margin" value={`${summary.averageMargin || 0}%`} index={3} />
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartWrapper title="Top 10 Most Profitable Medicines" id="chart-profitability">
              <BarChart data={topProfitable} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="medicineName" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(val) => `Rs. ${val}`} />
                <Legend />
                <Bar dataKey="totalRevenue" name="Revenue" fill="#1976d2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalCost" name="Cost" fill="#f44336" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalProfit" name="Profit" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartWrapper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (reportType === 'PEAK_CLINIC_HOURS') {
    const rows = toPeakClinicHoursRows(reportPreview.data);
    const dayKeys: (keyof PeakClinicHoursRow)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const scatterData = rows.flatMap((r) => 
      dayKeys.map((key, i) => ({
        hour: r.formattedHour,
        day: dayNames[i],
        dayIndex: i,
        visits: (r[key] as number) || 0
      }))
    ).filter(d => d.visits > 0);
    
    // Calculate max visits for the dynamic Z-Axis range sizing (min size = 60, max size = 600)
    const maxVisits = Math.max(1, ...scatterData.map(d => d.visits));

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} mb={3}>
          <StatCard title="Total Visits" value={summary.totalRecords || 0} index={0} />
          <StatCard title="Peak Hour" value={String(summary.peakHour || 'N/A')} index={1} />
          <StatCard title="Peak Visits" value={summary.peakVisits || 0} index={2} />
          <StatCard title="Avg Hourly Visits" value={summary.avgHourlyVisits || 0} index={3} />
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartWrapper title="Visit Heatmap (Day vs Hour)" id="chart-peak-hours" height={350}>
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="category" dataKey="hour" name="Time" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="day" name="Day" interval={0} tick={{ fontSize: 12 }} />
                <ZAxis type="number" dataKey="visits" range={[20, Math.max(200, maxVisits * 10)]} name="Visits" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#ed6c02" />
              </ScatterChart>
            </ChartWrapper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // INVENTORY REPORT
  const invRows = toInventoryRows(reportPreview.data);
  const byStatus = Array.from(
    invRows.reduce((map, row) => map.set(row.status, (map.get(row.status) || 0) + 1), new Map<string, number>())
  ).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  const criticalStock = invRows
    .filter((row) => row.status === 'low' || row.status === 'expiring')
    .map((row) => ({
      name: row.medicineName,
      value: row.qtyRemaining,
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 10);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} mb={3}>
        <StatCard title="Total Batches" value={summary.totalRecords || invRows.length} index={0} />
        <StatCard title="Total Qty" value={summary.totalQty || 0} index={6} />
        <StatCard title="Low Stock" value={summary.lowStock || 0} index={2} />
        <StatCard title="Expiring Soon" value={summary.expiringSoon || 0} index={3} />
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <ChartWrapper title="Stock Health Distribution" id="chart-stock-health">
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                {byStatus.map((entry, index) => {
                  const colors: Record<string, string> = { 'CRITICAL': '#c62828', 'LOW': '#ed6c02', 'EXPIRING': '#f44336', 'OK': '#2e7d32' };
                  return <Cell key={`cell-${index}`} fill={colors[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartWrapper>
        </Grid>
        <Grid item xs={12} md={7}>
          <ChartWrapper title="Critical Stock Levels (Remaining Qty)" id="chart-low-stock">
            <BarChart data={criticalStock} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#c62828" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartWrapper>
        </Grid>
      </Grid>
      <Box mt={4} display="flex" justifyContent="center">
        <Chip 
          label={`Report Dataset Baseline: ${reportPreview.generatedAt}`} 
          color="primary" 
          variant="outlined" 
          size="small"
          sx={{ borderRadius: '8px', fontWeight: 500 }}
        />
      </Box>
    </Box>
  );
};

export default ReportInsights;
