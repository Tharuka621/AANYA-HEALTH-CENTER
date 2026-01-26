import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { Invoice, InvoicePayment } from './Billing/types';
import { mockInvoices, mockPayments, mockInvoiceItems } from './Billing/mockData';
import BillingSummaryCards from './Billing/components/BillingSummaryCards';
import BillingTable from './Billing/components/BillingTable';
import InvoiceDetailsDialog from './Billing/components/InvoiceDetailsDialog';
import PayInvoiceDialog from './Billing/components/PayInvoiceDialog';

const BillingManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<InvoicePayment[]>(mockPayments);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
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

  const handlePaymentSubmit = (
    invoiceId: number,
    method: 'CASH' | 'CARD' | 'ONLINE',
    amount: number
  ) => {
    const newPayment: InvoicePayment = {
      id: payments.length + 1,
      invoiceId,
      method,
      amount,
      paidAt: new Date().toISOString(),
    };
    setPayments([...payments, newPayment]);

    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'PAID' as const } : inv
      )
    );

    setSnackbar({
      open: true,
      message: `Payment of Rs. ${amount.toFixed(2)} received successfully via ${method}!`,
      severity: 'success',
    });
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
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            disabled
            sx={{ height: 'fit-content' }}
          >
            Export
          </Button>
        </Box>

        {/* Summary Cards */}
        <BillingSummaryCards invoices={invoices} payments={payments} />

        {/* Billing Table */}
        <BillingTable
          invoices={invoices}
          onViewInvoice={handleViewInvoice}
          onPayInvoice={handlePayInvoice}
          onPrintInvoice={handlePrintInvoice}
        />

        {/* Invoice Details Dialog */}
        <InvoiceDetailsDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          invoice={selectedInvoice}
          items={mockInvoiceItems}
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