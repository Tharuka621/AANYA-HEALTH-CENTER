import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { Invoice } from '../types';

interface BillingTableProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onPayInvoice: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

const BillingTable: React.FC<BillingTableProps> = ({
  invoices,
  onViewInvoice,
  onPayInvoice,
  onPrintInvoice,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'UNPAID':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatInvoiceId = (id: number) => {
    return `INV-${String(id).padStart(4, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Invoice ID</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Patient Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Total Amount</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Created Date</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} hover>
              <TableCell>
                <Box fontWeight={600} color="primary.main">
                  {formatInvoiceId(invoice.id)}
                </Box>
              </TableCell>
              <TableCell>{invoice.patientName}</TableCell>
              <TableCell>
                <Box fontWeight={600}>Rs. {invoice.totalAmount.toFixed(2)}</Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={invoice.status}
                  color={getStatusColor(invoice.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell>{formatDate(invoice.createdAt)}</TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onViewInvoice(invoice)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {invoice.status === 'UNPAID' && (
                    <Tooltip title="Pay Invoice">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => onPayInvoice(invoice)}
                      >
                        <PaymentIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Print Invoice">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onPrintInvoice(invoice)}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BillingTable;
