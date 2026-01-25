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
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { SavedReport, ReportType, ReportStatus } from '../../../../types/reports';

interface SavedReportsTableProps {
  reports: SavedReport[];
  loading?: boolean;
  onView?: (report: SavedReport) => void;
  onDownload?: (report: SavedReport) => void;
  onEdit?: (report: SavedReport) => void;
  onDelete?: (report: SavedReport) => void;
}

const getStatusColor = (
  status: ReportStatus
): 'success' | 'warning' | 'info' | 'default' => {
  switch (status) {
    case 'published':
      return 'success';
    case 'under_review':
      return 'warning';
    case 'draft':
      return 'info';
    default:
      return 'default';
  }
};

const getTypeColor = (type: ReportType): string => {
  switch (type) {
    case 'PATIENT_VISIT':
      return '#1976d2';
    case 'LAB_TEST':
      return '#9c27b0';
    case 'PRESCRIPTION':
      return '#2e7d32';
    case 'INVENTORY':
      return '#ed6c02';
    default:
      return '#757575';
  }
};

const formatReportType = (type: ReportType): string => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

const SavedReportsTable: React.FC<SavedReportsTableProps> = ({
  reports,
  loading = false,
  onView,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Report Title',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={formatReportType(params.value)}
          size="small"
          sx={{
            bgcolor: `${getTypeColor(params.value)}15`,
            color: getTypeColor(params.value),
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ').toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'createdBy',
      headerName: 'Created By',
      width: 160,
    },
    {
      field: 'createdDate',
      headerName: 'Created Date',
      width: 130,
    },
    {
      field: 'lastModified',
      headerName: 'Last Modified',
      width: 130,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onView && (
            <Tooltip title="View Report">
              <IconButton size="small" onClick={() => onView(params.row)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDownload && (
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => onDownload(params.row)}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit Metadata">
              <IconButton size="small" onClick={() => onEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  if (!reports || reports.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No saved reports available
        </Typography>
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
        rows={reports}
        columns={columns}
        loading={loading}
        autoHeight
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
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

export default SavedReportsTable;
