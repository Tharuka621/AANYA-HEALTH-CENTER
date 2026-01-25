import React from 'react';
import {
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import {
  ReportType,
  ReportRow,
} from '../../../../types/reports';

interface ReportResultsTableProps {
  reportType: ReportType;
  data: ReportRow[];
  loading?: boolean;
  onView?: (row: ReportRow) => void;
  onDownloadPDF?: (row: ReportRow) => void;
  onDownloadCSV?: (row: ReportRow) => void;
}

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'completed':
    case 'ok':
      return 'success';
    case 'checked_in':
    case 'pending':
    case 'low':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'expiring':
      return 'error';
    default:
      return 'default';
  }
};

const ReportResultsTable: React.FC<ReportResultsTableProps> = ({
  reportType,
  data,
  loading = false,
  onView,
  onDownloadPDF,
  onDownloadCSV,
}) => {
  const renderActions = (params: GridRenderCellParams) => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {onView && (
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => onView(params.row)}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDownloadPDF && (
        <Tooltip title="Download PDF">
          <IconButton size="small" onClick={() => onDownloadPDF(params.row)}>
            <PdfIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {onDownloadCSV && (
        <Tooltip title="Download CSV">
          <IconButton size="small" onClick={() => onDownloadCSV(params.row)}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );

  // Patient Visit Columns
  const patientVisitColumns: GridColDef[] = [
    { field: 'visitId', headerName: 'Visit ID', width: 100 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'patientName', headerName: 'Patient Name', width: 160 },
    { field: 'doctorName', headerName: 'Doctor', width: 160 },
    { field: 'checkInTime', headerName: 'Check-in Time', width: 120 },
    { field: 'diagnosis', headerName: 'Diagnosis', flex: 1, minWidth: 200 },
    { field: 'vitalsSummary', headerName: 'Vitals Summary', flex: 1, minWidth: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.replace('_', ' ').toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: renderActions,
    },
  ];

  // Lab Test Columns
  const labTestColumns: GridColDef[] = [
    { field: 'labOrderId', headerName: 'Order ID', width: 100 },
    { field: 'orderedDate', headerName: 'Ordered Date', width: 120 },
    { field: 'patientName', headerName: 'Patient Name', width: 160 },
    { field: 'testName', headerName: 'Test Name', flex: 1, minWidth: 180 },
    { field: 'resultValue', headerName: 'Result Value', flex: 1, minWidth: 200 },
    { field: 'labTechName', headerName: 'Lab Tech', width: 140 },
    { field: 'completedDate', headerName: 'Completed', width: 120 },
    {
      field: 'resultStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: renderActions,
    },
  ];

  // Prescription Columns
  const prescriptionColumns: GridColDef[] = [
    { field: 'prescriptionId', headerName: 'Rx ID', width: 100 },
    { field: 'prescribedDate', headerName: 'Date', width: 110 },
    { field: 'patientName', headerName: 'Patient Name', width: 160 },
    { field: 'doctorName', headerName: 'Doctor', width: 160 },
    { field: 'medicineName', headerName: 'Medicine', flex: 1, minWidth: 180 },
    { field: 'qty', headerName: 'Qty', width: 80, type: 'number' },
    { field: 'dosage', headerName: 'Dosage', width: 180 },
    { field: 'durationDays', headerName: 'Days', width: 80, type: 'number' },
    { field: 'issuedQty', headerName: 'Issued', width: 90, type: 'number' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: renderActions,
    },
  ];

  // Inventory Columns
  const inventoryColumns: GridColDef[] = [
    { field: 'medicineId', headerName: 'Medicine ID', width: 120 },
    { field: 'medicineName', headerName: 'Medicine Name', flex: 1, minWidth: 200 },
    { field: 'batchNo', headerName: 'Batch No', width: 150 },
    { field: 'qtyRemaining', headerName: 'Qty Remaining', width: 130, type: 'number' },
    { field: 'reorderLevel', headerName: 'Reorder Level', width: 130, type: 'number' },
    { field: 'expiryDate', headerName: 'Expiry Date', width: 120 },
    { field: 'daysUntilExpiry', headerName: 'Days Left', width: 100, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: renderActions,
    },
  ];

  const getColumns = (): GridColDef[] => {
    switch (reportType) {
      case 'PATIENT_VISIT':
        return patientVisitColumns;
      case 'LAB_TEST':
        return labTestColumns;
      case 'PRESCRIPTION':
        return prescriptionColumns;
      case 'INVENTORY':
        return inventoryColumns;
      default:
        return [];
    }
  };

  const getRowId = (row: ReportRow): string => {
    if ('visitId' in row) return row.visitId;
    if ('labOrderId' in row) return row.labOrderId;
    if ('prescriptionId' in row) return row.prescriptionId;
    if ('medicineId' in row) return row.medicineId + row.batchNo;
    return Math.random().toString();
  };

  if (!data || data.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 8,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 0.6,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apply filters and generate a report to view results
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <DataGrid
        rows={data}
        columns={getColumns()}
        getRowId={getRowId}
        loading={loading}
        autoHeight
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'grey.50',
            fontWeight: 700,
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-row:hover': {
            bgcolor: 'action.hover',
          },
        }}
      />
    </Paper>
  );
};

export default ReportResultsTable;
