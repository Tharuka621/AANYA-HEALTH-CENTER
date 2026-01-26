import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { Invoice, InvoiceItem } from '../types';

interface InvoiceDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  items: InvoiceItem[];
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  open,
  onClose,
  invoice,
  items,
}) => {
  if (!invoice) return null;

  const formatInvoiceId = (id: number) => {
    return `INV-${String(id).padStart(4, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

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

  const invoiceItems = items.filter(item => item.invoiceId === invoice.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Invoice Details
          </Typography>
          <Chip
            label={invoice.status}
            color={getStatusColor(invoice.status)}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Invoice Header */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Invoice ID
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {formatInvoiceId(invoice.id)}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary">
                  Created Date
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {formatDate(invoice.createdAt)}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Patient Name
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {invoice.patientName}
              </Typography>
            </Box>
          </Paper>

          {/* Invoice Items Table */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            Invoice Items
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>
                    <strong>Medicine/Service</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Batch No</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Qty</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Unit Price</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Total</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.medicineName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.batchNo}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.qty}</TableCell>
                    <TableCell align="right">Rs. {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <strong>Rs. {item.lineTotal.toFixed(2)}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total */}
          <Paper sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Total Amount
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                Rs. {invoice.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={() => window.print()} variant="contained">
          Print Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
