import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  FilterAlt as FilterIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import {
  ReportType,
  ReportFilters,
  GroupBy,
  OutputFormat,
  VisitStatus,
  LabResultStatus,
} from '../../../../types/reports';

interface ReportFiltersProps {
  reportType: ReportType | null;
  onApply: (filters: ReportFilters) => void;
  onReset: () => void;
}

const ReportFiltersComponent: React.FC<ReportFiltersProps> = ({
  reportType,
  onApply,
  onReset,
}) => {
  // Common filters applied to every report type.
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('daily');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('table');

  // Patient Visit specific
  const [doctorId, setDoctorId] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [visitStatus, setVisitStatus] = useState<VisitStatus | ''>('');

  // Lab Test specific
  const [testType, setTestType] = useState<string>('');
  const [labResultStatus, setLabResultStatus] = useState<LabResultStatus | ''>('');
  const [labTechId, setLabTechId] = useState<string>('');

  // Prescription specific
  const [prescDoctorId, setPrescDoctorId] = useState<string>('');
  const [medicineId, setMedicineId] = useState<string>('');
  const [issuedOnly, setIssuedOnly] = useState<boolean>(false);

  // Inventory specific
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);
  const [expiringWithinDays, setExpiringWithinDays] = useState<7 | 30 | 60 | ''>('');
  const [invMedicineId, setInvMedicineId] = useState<string>('');

  // Pharmacy Prediction specific
  const [predMedicineId, setPredMedicineId] = useState<string>('');
  const [predStatus, setPredStatus] = useState<'critical' | 'low' | 'adequate' | ''>('');
  const [reorderOnly, setReorderOnly] = useState<boolean>(false);

  // Pharmacy Profitability specific
  const [profMedicineId, setProfMedicineId] = useState<string>('');

  // Peak Clinic Hours specific
  const [peakDoctorId, setPeakDoctorId] = useState<string>('');

  // Backend expects DD/MM/YYYY date strings for report filters.
  const formatDate = (date: Date | null): string | null => {
    if (!date) return null;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Merges common filters with report-type-specific fields.
  const handleApply = () => {
    const baseFilters = {
      dateFrom: formatDate(dateFrom),
      dateTo: formatDate(dateTo),
      groupBy,
      outputFormat,
    };

    let filters: ReportFilters;

    switch (reportType) {
      case 'PATIENT_VISIT':
        filters = {
          ...baseFilters,
          ...(doctorId && { doctorId }),
          ...(patientId && { patientId }),
          ...(visitStatus && { status: visitStatus }),
        };
        break;

      case 'LAB_TEST':
        filters = {
          ...baseFilters,
          ...(testType && { testType }),
          ...(labResultStatus && { resultStatus: labResultStatus }),
          ...(labTechId && { labTechId }),
        };
        break;

      case 'PRESCRIPTION':
        filters = {
          ...baseFilters,
          ...(prescDoctorId && { doctorId: prescDoctorId }),
          ...(medicineId && { medicineId }),
          issuedOnly,
        };
        break;

      case 'INVENTORY':
        filters = {
          ...baseFilters,
          lowStockOnly,
          ...(expiringWithinDays && { expiringWithinDays }),
          ...(invMedicineId && { medicineId: invMedicineId }),
        };
        break;

      case 'PHARMACY_PREDICTION':
        filters = {
          ...baseFilters,
          ...(predMedicineId && { medicineId: predMedicineId }),
          ...(predStatus && { status: predStatus }),
          reorderOnly,
        };
        break;

      case 'PHARMACY_PROFITABILITY':
        filters = {
          ...baseFilters,
          ...(profMedicineId && { medicineId: profMedicineId }),
        };
        break;

      case 'PEAK_CLINIC_HOURS':
        filters = {
          ...baseFilters,
          ...(peakDoctorId && { doctorId: peakDoctorId }),
        };
        break;

      default:
        filters = baseFilters;
    }

    onApply(filters);
  };

  // Resets all local filter state so switching report types starts cleanly.
  const handleReset = () => {
    setDateFrom(null);
    setDateTo(null);
    setGroupBy('daily');
    setOutputFormat('table');
    setDoctorId('');
    setPatientId('');
    setVisitStatus('');
    setTestType('');
    setLabResultStatus('');
    setLabTechId('');
    setPrescDoctorId('');
    setMedicineId('');
    setIssuedOnly(false);
    setLowStockOnly(false);
    setExpiringWithinDays('');
    setInvMedicineId('');
    setPredMedicineId('');
    setPredStatus('');
    setReorderOnly(false);
    setProfMedicineId('');
    setPeakDoctorId('');
    onReset();
  };

  if (!reportType) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={600}>
          Report Filters
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2.5}>
          {/* Common Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="From Date"
              value={dateFrom}
              onChange={(newValue) => setDateFrom(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="To Date"
              value={dateTo}
              onChange={(newValue) => setDateTo(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: 'small',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                label="Group By"
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Output Format</InputLabel>
              <Select
                value={outputFormat}
                label="Output Format"
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              >
                <MenuItem value="table">Table</MenuItem>
                <MenuItem value="summary">Summary</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Patient Visit Filters */}
          {reportType === 'PATIENT_VISIT' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={doctorId}
                    label="Doctor"
                    onChange={(e) => setDoctorId(e.target.value)}
                  >
                    <MenuItem value="">All Doctors</MenuItem>
                    <MenuItem value="DOC001">Dr. Nimal Fernando</MenuItem>
                    <MenuItem value="DOC002">Dr. Sunil Jayawardena</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g., P001"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={visitStatus}
                    label="Status"
                    onChange={(e) => setVisitStatus(e.target.value as VisitStatus)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="checked_in">Checked In</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Lab Test Filters */}
          {reportType === 'LAB_TEST' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Test Type</InputLabel>
                  <Select
                    value={testType}
                    label="Test Type"
                    onChange={(e) => setTestType(e.target.value)}
                  >
                    <MenuItem value="">All Tests</MenuItem>
                    <MenuItem value="CBC">Complete Blood Count</MenuItem>
                    <MenuItem value="Lipid">Lipid Profile</MenuItem>
                    <MenuItem value="FBS">Fasting Blood Sugar</MenuItem>
                    <MenuItem value="LFT">Liver Function Test</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Result Status</InputLabel>
                  <Select
                    value={labResultStatus}
                    label="Result Status"
                    onChange={(e) => setLabResultStatus(e.target.value as LabResultStatus)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Lab Technician</InputLabel>
                  <Select
                    value={labTechId}
                    label="Lab Technician"
                    onChange={(e) => setLabTechId(e.target.value)}
                  >
                    <MenuItem value="">All Technicians</MenuItem>
                    <MenuItem value="LT001">Saman Kumara</MenuItem>
                    <MenuItem value="LT002">Nisha Dias</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Prescription Filters */}
          {reportType === 'PRESCRIPTION' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={prescDoctorId}
                    label="Doctor"
                    onChange={(e) => setPrescDoctorId(e.target.value)}
                  >
                    <MenuItem value="">All Doctors</MenuItem>
                    <MenuItem value="DOC001">Dr. Nimal Fernando</MenuItem>
                    <MenuItem value="DOC002">Dr. Sunil Jayawardena</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Medicine</InputLabel>
                  <Select
                    value={medicineId}
                    label="Medicine"
                    onChange={(e) => setMedicineId(e.target.value)}
                  >
                    <MenuItem value="">All Medicines</MenuItem>
                    <MenuItem value="M001">Paracetamol 500mg</MenuItem>
                    <MenuItem value="M002">Amlodipine 5mg</MenuItem>
                    <MenuItem value="M003">Metformin 500mg</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={issuedOnly}
                      onChange={(e) => setIssuedOnly(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show Issued Only"
                />
              </Grid>
            </>
          )}

          {/* Inventory Filters */}
          {reportType === 'INVENTORY' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Medicine</InputLabel>
                  <Select
                    value={invMedicineId}
                    label="Medicine"
                    onChange={(e) => setInvMedicineId(e.target.value)}
                  >
                    <MenuItem value="">All Medicines</MenuItem>
                    <MenuItem value="M001">Paracetamol 500mg</MenuItem>
                    <MenuItem value="M002">Amlodipine 5mg</MenuItem>
                    <MenuItem value="M003">Metformin 500mg</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Expiring Within</InputLabel>
                  <Select
                    value={expiringWithinDays}
                    label="Expiring Within"
                    onChange={(e) => setExpiringWithinDays(e.target.value as 7 | 30 | 60)}
                  >
                    <MenuItem value="">No Filter</MenuItem>
                    <MenuItem value={7}>7 Days</MenuItem>
                    <MenuItem value={30}>30 Days</MenuItem>
                    <MenuItem value={60}>60 Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={lowStockOnly}
                      onChange={(e) => setLowStockOnly(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Low Stock Only"
                />
              </Grid>
            </>
          )}

          {/* Pharmacy Prediction Filters */}
          {reportType === 'PHARMACY_PREDICTION' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Medicine Name</InputLabel>
                  <Select
                    value={predMedicineId}
                    label="Medicine Name"
                    onChange={(e) => setPredMedicineId(e.target.value)}
                  >
                    <MenuItem value="">All Medicines</MenuItem>
                    <MenuItem value="Paracetamol">Paracetamol</MenuItem>
                    <MenuItem value="Amlodipine">Amlodipine</MenuItem>
                    <MenuItem value="Metformin">Metformin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Prediction Status</InputLabel>
                  <Select
                    value={predStatus}
                    label="Prediction Status"
                    onChange={(e) => setPredStatus(e.target.value as any)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="adequate">Adequate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reorderOnly}
                      onChange={(e) => setReorderOnly(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Reorder Only"
                />
              </Grid>
            </>
          )}

          {/* Pharmacy Profitability Filters */}
          {reportType === 'PHARMACY_PROFITABILITY' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Medicine Name</InputLabel>
                  <Select
                    value={profMedicineId}
                    label="Medicine Name"
                    onChange={(e) => setProfMedicineId(e.target.value)}
                  >
                    <MenuItem value="">All Medicines</MenuItem>
                    <MenuItem value="Paracetamol">Paracetamol</MenuItem>
                    <MenuItem value="Amlodipine">Amlodipine</MenuItem>
                    <MenuItem value="Metformin">Metformin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Peak Clinic Hours Filters */}
          {reportType === 'PEAK_CLINIC_HOURS' && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={peakDoctorId}
                    label="Doctor"
                    onChange={(e) => setPeakDoctorId(e.target.value)}
                  >
                    <MenuItem value="">All Doctors</MenuItem>
                    <MenuItem value="DOC001">Dr. Nimal Fernando</MenuItem>
                    <MenuItem value="DOC002">Dr. Sunil Jayawardena</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={handleReset}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={handleApply}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Paper>
  );
};

export default ReportFiltersComponent;
