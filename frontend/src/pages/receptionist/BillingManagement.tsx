import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Bill {
  id: string;
  patient_name: string;
  patient_phone: string;
  bill_date: string;
  total_amount: number;
  paid_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  payment_method?: 'cash' | 'card' | 'insurance';
  items: BillItem[];
}

const BillingManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createBillOpen, setCreateBillOpen] = useState(false);
  const [viewBillOpen, setViewBillOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Mock data - replace with API call
  const [bills, setBills] = useState<Bill[]>([
    {
      id: 'INV-001',
      patient_name: 'Kasun Bandara',
      patient_phone: '+94 71 123 4567',
      bill_date: '2026-01-23',
      total_amount: 5500,
      paid_amount: 5500,
      payment_status: 'paid',
      payment_method: 'card',
      items: [
        { id: '1', description: 'Consultation Fee', quantity: 1, unit_price: 2000, total: 2000 },
        { id: '2', description: 'Blood Test - CBC', quantity: 1, unit_price: 1500, total: 1500 },
        { id: '3', description: 'Medicine - Paracetamol', quantity: 2, unit_price: 1000, total: 2000 },
      ],
    },
    {
      id: 'INV-002',
      patient_name: 'Nimal Perera',
      patient_phone: '+94 77 555 8899',
      bill_date: '2026-01-23',
      total_amount: 8000,
      paid_amount: 5000,
      payment_status: 'partial',
      payment_method: 'cash',
      items: [
        { id: '1', description: 'Consultation Fee', quantity: 1, unit_price: 2000, total: 2000 },
        { id: '2', description: 'X-Ray', quantity: 1, unit_price: 3000, total: 3000 },
        { id: '3', description: 'Medicine', quantity: 3, unit_price: 1000, total: 3000 },
      ],
    },
    {
      id: 'INV-003',
      patient_name: 'Ishara Silva',
      patient_phone: '+94 76 234 5678',
      bill_date: '2026-01-22',
      total_amount: 3500,
      paid_amount: 0,
      payment_status: 'pending',
      items: [
        { id: '1', description: 'Consultation Fee', quantity: 1, unit_price: 2000, total: 2000 },
        { id: '2', description: 'Medicine', quantity: 1, unit_price: 1500, total: 1500 },
      ],
    },
  ]);

  // Create bill form state
  const [billForm, setBillForm] = useState({
    patient_name: '',
    patient_phone: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'cash' as 'cash' | 'card' | 'insurance',
  });

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      bill.patient_phone.includes(search) ||
      bill.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || bill.payment_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (
    status: string
  ): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleAddItem = () => {
    setBillForm({
      ...billForm,
      items: [...billForm.items, { description: '', quantity: 1, unit_price: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setBillForm({
      ...billForm,
      items: billForm.items.filter((_, i) => i !== index),
    });
  };

  const handleCreateBill = () => {
    // TODO: API call to create bill
    console.log('Create bill:', billForm);
    setCreateBillOpen(false);
    // Reset form
    setBillForm({
      patient_name: '',
      patient_phone: '',
      items: [{ description: '', quantity: 1, unit_price: 0 }],
    });
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewBillOpen(true);
  };

  const handleOpenPayment = (bill: Bill) => {
    setSelectedBill(bill);
    const remainingAmount = bill.total_amount - bill.paid_amount;
    setPaymentForm({
      amount: remainingAmount.toString(),
      payment_method: 'cash',
    });
    setPaymentOpen(true);
  };

  const handleProcessPayment = () => {
    if (selectedBill) {
      const paymentAmount = parseFloat(paymentForm.amount);
      const newPaidAmount = selectedBill.paid_amount + paymentAmount;
      const newStatus =
        newPaidAmount >= selectedBill.total_amount
          ? 'paid'
          : newPaidAmount > 0
          ? 'partial'
          : 'pending';

      setBills((prev) =>
        prev.map((bill) =>
          bill.id === selectedBill.id
            ? {
                ...bill,
                paid_amount: newPaidAmount,
                payment_status: newStatus as 'paid' | 'pending' | 'partial',
                payment_method: paymentForm.payment_method,
              }
            : bill
        )
      );
    }
    setPaymentOpen(false);
    setSelectedBill(null);
  };

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.paid_amount, 0);
  const pendingAmount = bills.reduce(
    (sum, bill) => sum + (bill.total_amount - bill.paid_amount),
    0
  );
  const paidBillsCount = bills.filter((bill) => bill.payment_status === 'paid').length;
  const pendingBillsCount = bills.filter((bill) => bill.payment_status === 'pending').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Billing Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage patient bills and payments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateBillOpen(true)}
            size="large"
          >
            Create New Bill
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  Rs. {totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  Rs. {pendingAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {paidBillsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paid Bills
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {pendingBillsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Bills
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bill List */}
        <Card>
          <CardContent>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                fullWidth
                placeholder="Search by patient name, phone, or invoice number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell align="right">Paid Amount</TableCell>
                    <TableCell align="right">Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {bill.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{bill.patient_name}</TableCell>
                      <TableCell>{bill.patient_phone}</TableCell>
                      <TableCell>{bill.bill_date}</TableCell>
                      <TableCell align="right">
                        Rs. {bill.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">Rs. {bill.paid_amount.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        Rs. {(bill.total_amount - bill.paid_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bill.payment_status}
                          size="small"
                          color={getStatusColor(bill.payment_status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewBill(bill)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          {bill.payment_status !== 'paid' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<PaymentIcon />}
                              onClick={() => handleOpenPayment(bill)}
                            >
                              Pay
                            </Button>
                          )}
                          <IconButton size="small" color="secondary">
                            <PrintIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Create Bill Dialog */}
        <Dialog
          open={createBillOpen}
          onClose={() => setCreateBillOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Bill</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    value={billForm.patient_name}
                    onChange={(e) => setBillForm({ ...billForm, patient_name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Patient Phone"
                    value={billForm.patient_phone}
                    onChange={(e) => setBillForm({ ...billForm, patient_phone: e.target.value })}
                    required
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Bill Items
              </Typography>
              {billForm.items.map((item, index) => (
                <Grid container spacing={2} key={index} mb={2}>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...billForm.items];
                        newItems[index].description = e.target.value;
                        setBillForm({ ...billForm, items: newItems });
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      fullWidth
                      label="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...billForm.items];
                        newItems[index].quantity = parseInt(e.target.value) || 1;
                        setBillForm({ ...billForm, items: newItems });
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="Unit Price"
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => {
                        const newItems = [...billForm.items];
                        newItems[index].unit_price = parseFloat(e.target.value) || 0;
                        setBillForm({ ...billForm, items: newItems });
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                      disabled={billForm.items.length === 1}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button variant="outlined" onClick={handleAddItem} fullWidth>
                Add Item
              </Button>

              <Box mt={3}>
                <Typography variant="h6" align="right">
                  Total: Rs.{' '}
                  {billForm.items
                    .reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
                    .toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateBillOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateBill}>
              Create Bill
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Bill Dialog */}
        <Dialog open={viewBillOpen} onClose={() => setViewBillOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Bill Details - {selectedBill?.id}</DialogTitle>
          <DialogContent>
            {selectedBill && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Patient Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedBill.patient_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{selectedBill.patient_phone}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">{selectedBill.bill_date}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1">
                      {selectedBill.payment_method || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Bill Items
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBill.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">Rs. {item.unit_price}</TableCell>
                        <TableCell align="right">Rs. {item.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Total Amount:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right" fontWeight={600}>
                      Rs. {selectedBill.total_amount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Paid Amount:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" align="right" color="success.main" fontWeight={600}>
                      Rs. {selectedBill.paid_amount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight={600}>
                      Balance:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right" color="error.main" fontWeight={700}>
                      Rs. {(selectedBill.total_amount - selectedBill.paid_amount).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewBillOpen(false)}>Close</Button>
            <Button variant="outlined" startIcon={<PrintIcon />}>
              Print
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogContent>
            {selectedBill && (
              <Box sx={{ pt: 2 }}>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary">
                    Patient
                  </Typography>
                  <Typography variant="h6">{selectedBill.patient_name}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Invoice: {selectedBill.id}
                  </Typography>
                </Box>

                <Grid container spacing={2} mb={3}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h6">
                      Rs. {selectedBill.total_amount.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Balance Due
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      Rs. {(selectedBill.total_amount - selectedBill.paid_amount).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Payment Amount"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={paymentForm.payment_method}
                        label="Payment Method"
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            payment_method: e.target.value as 'cash' | 'card' | 'insurance',
                          })
                        }
                      >
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="card">Card</MenuItem>
                        <MenuItem value="insurance">Insurance</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleProcessPayment}>
              Process Payment
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default BillingManagement;
