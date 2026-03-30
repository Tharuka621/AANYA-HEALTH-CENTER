import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import { Invoice, InvoiceItem, InvoicePayment } from './Billing/types';
import BillingSummaryCards from './Billing/components/BillingSummaryCards';
import BillingTable from './Billing/components/BillingTable';
import InvoiceDetailsDialog from './Billing/components/InvoiceDetailsDialog';
import PayInvoiceDialog from './Billing/components/PayInvoiceDialog';

const BillingManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/billing/invoices');

      const mappedInvoices: Invoice[] = (response.data.invoices || []).map((invoice: any) => ({
        id: Number(invoice.id),
        patientName: invoice.patient_name || 'Unknown Patient',
        totalAmount: Number(invoice.total_amount || 0),
        status: invoice.status,
        createdAt: invoice.created_at,
      }));

      const mappedPayments: InvoicePayment[] = (response.data.payments || []).map((payment: any) => ({
        id: Number(payment.id),
        invoiceId: Number(payment.invoice_id),
        method: payment.method,
        amount: Number(payment.amount || 0),
        paidAt: payment.paid_at,
      }));

      setInvoices(mappedInvoices);
      setPayments(mappedPayments);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceItems = async (invoiceId: number) => {
    try {
      setDetailsLoading(true);
      const response = await axiosInstance.get(`/admin/billing/invoices/${invoiceId}/items`);
      const mappedItems: InvoiceItem[] = (response.data.items || []).map((item: any) => ({
        id: Number(item.id),
        invoiceId: Number(item.invoice_id),
        medicineName: item.medicine_name || 'Unknown Item',
        batchNo: item.batch_no || 'N/A',
        qty: Number(item.qty || 0),
        unitPrice: Number(item.unit_price || 0),
        lineTotal: Number(item.line_total || 0),
      }));
      setInvoiceItems(mappedItems);
    } catch (err: any) {
      setInvoiceItems([]);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to load invoice items',
        severity: 'error',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    await fetchInvoiceItems(invoice.id);
    setViewDialogOpen(true);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPayDialogOpen(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSnackbar({
      open: true,
      message: `Printing invoice ${String(invoice.id).padStart(4, '0')}...`,
      severity: 'info',
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handlePaymentSubmit = async (
    invoiceId: number,
    method: 'CASH' | 'CARD' | 'ONLINE',
    amount: number
  ) => {
    try {
      await axiosInstance.post(`/admin/billing/invoices/${invoiceId}/pay`, { method });
      await fetchBillingData();
      setPayDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Payment of Rs. ${amount.toFixed(2)} recorded successfully via ${method}.`,
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to record payment',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Billing
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Invoices and payments overview
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchBillingData}
              disabled={loading}
              sx={{ height: 'fit-content' }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              disabled
              sx={{ height: 'fit-content' }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <BillingSummaryCards invoices={invoices} payments={payments} />

        {/* Billing Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : (
          <BillingTable
            invoices={invoices}
            onViewInvoice={handleViewInvoice}
            onPayInvoice={handlePayInvoice}
            onPrintInvoice={handlePrintInvoice}
          />
        )}

        {/* Invoice Details Dialog */}
        <InvoiceDetailsDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          invoice={selectedInvoice}
          items={detailsLoading ? [] : invoiceItems}
        />

        {/* Pay Invoice Dialog */}
        <PayInvoiceDialog
          open={payDialogOpen}
          onClose={() => setPayDialogOpen(false)}
          invoice={selectedInvoice}
          onPay={handlePaymentSubmit}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default BillingManagement;