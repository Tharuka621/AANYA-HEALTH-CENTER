import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
  sortable?: boolean;
}

export interface Action {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (row: any) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
  pagination?: {
    page: number;
    rowsPerPage: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  actions = [],
  pagination,
  loading = false,
  emptyMessage = 'No data available',
  stickyHeader = false,
  maxHeight = 400,
}) => {
  const handleActionClick = (action: Action, row: any) => {
    action.onClick(row);
  };

  const renderCellContent = (column: Column, row: any) => {
    const value = row[column.id];
    
    if (column.format) {
      return column.format(value);
    }
    
    // Handle common data types
    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      );
    }
    
    if (typeof value === 'string' && value.includes('status')) {
      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case 'active':
          case 'completed':
          case 'paid':
            return 'success';
          case 'pending':
          case 'scheduled':
            return 'warning';
          case 'cancelled':
          case 'expired':
          case 'overdue':
            return 'error';
          default:
            return 'default';
        }
      };
      
      return (
        <Chip
          label={value}
          color={getStatusColor(value)}
          size="small"
        />
      );
    }
    
    return value;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{ fontWeight: 600 }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow hover key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {renderCellContent(column, row)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="center">
                      <Box display="flex" gap={0.5} justifyContent="center">
                        {actions.map((action, actionIndex) => (
                          <Tooltip key={actionIndex} title={action.tooltip}>
                            <IconButton
                              size="small"
                              color={action.color || 'primary'}
                              onClick={() => handleActionClick(action, row)}
                            >
                              {action.icon}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.totalRows}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
          onRowsPerPageChange={(event) => 
            pagination.onRowsPerPageChange(parseInt(event.target.value, 10))
          }
        />
      )}
    </Paper>
  );
};

export default DataTable;

