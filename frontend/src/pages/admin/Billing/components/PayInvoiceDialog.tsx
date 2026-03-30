import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Alert,
} from '@mui/material';
import { Invoice } from '../types';

interface PayInvoiceDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPay: (invoiceId: number, method: 'CASH' | 'CARD' | 'ONLINE', amount: number) => void;
}

const PayInvoiceDialog: React.FC<PayInvoiceDialogProps> = ({
  open,
  onClose,
  invoice,
  onPay,
}) => {
  const [method, setMethod] = useState<'CASH' | 'CARD' | 'ONLINE'>('CASH');
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (invoice && open) {
      setAmount(invoice.totalAmount.toString());
      setMethod('CASH');
      setError('');
    }
  }, [invoice, open]);

  const handleSubmit = () => {
    if (!invoice) return;

    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (paymentAmount > invoice.totalAmount) {
      setError('Payment amount cannot exceed invoice total');
      return;
    }

    onPay(invoice.id, method, paymentAmount);
    onClose();
  };

  if (!invoice) return null;

  const formatInvoiceId = (id: number) => {
    return `INV-${String(id).padStart(4, '0')}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight={700}>
          Pay Invoice
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Invoice Summary */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Invoice ID:
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {formatInvoiceId(invoice.id)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Patient:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {invoice.patientName}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Total Amount:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                Rs. {invoice.totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Payment Form */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={method}
              label="Payment Method"
              onChange={(e) => setMethod(e.target.value as 'CASH' | 'CARD' | 'ONLINE')}
            >
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="CARD">Card</MenuItem>
              <MenuItem value="ONLINE">Online Payment</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            margin="normal"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>Rs.</Typography>,
            }}
            inputProps={{
              step: '0.01',
              min: '0',
            }}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            This records the invoice as fully paid in the database.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="success">
          Complete Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayInvoiceDialog;
