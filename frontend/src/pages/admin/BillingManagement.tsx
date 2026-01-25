import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

const BillingManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    service_type: '',
    amount: '',
    status: 'pending',
    notes: '',
  });

  // Mock billing data
  const bills = [
    {
      id: '1',
      patient: 'Kasun Bandara',
      service_type: 'Consultation',
      amount: 2500.00,
      status: 'paid',
      date: '2024-12-15',
      notes: 'Regular checkup',
    },
    {
      id: '2',
      patient: 'Nimal Perera',
      service_type: 'Lab Test',
      amount: 1500.00,
      status: 'pending',
      date: '2024-12-16',
      notes: 'Blood test',
    },
    {
      id: '3',
      patient: 'Ishara Silva',
      service_type: 'Prescription',
      amount: 800.00,
      status: 'paid',
      date: '2024-12-17',
      notes: 'Medication',
    },
    {
      id: '4',
      patient: 'Amaya Fernando',
      service_type: 'Consultation',
      amount: 2500.00,
      status: 'overdue',
      date: '2024-12-10',
      notes: 'Follow-up visit',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setFormData({
      patient_name: '',
      service_type: '',
      amount: '',
      status: 'pending',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditBill = (bill: any) => {
    setEditingBill(bill);
    setFormData({
      patient_name: bill.patient,
      service_type: bill.service_type,
      amount: bill.amount.toString(),
      status: bill.status,
      notes: bill.notes,
    });
    setOpenDialog(true);
  };

  const handleDeleteBill = (billId: string) => {
    console.log('Delete bill:', billId);
    // In a real app, this would call the API
  };

  const handlePrintBill = (billId: string) => {
    console.log('Print bill:', billId);
    // In a real app, this would open print dialog
  };

  const handleMarkPaid = (billId: string) => {
    console.log('Mark as paid:', billId);
    // In a real app, this would call the API
  };

  const handleSaveBill = () => {
    console.log('Save bill:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0);
  const overdueAmount = bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.amount, 0);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Billing Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBill}
          >
            Create Bill
          </Button>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <PaymentIcon color="success" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Rs. {totalRevenue.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ReceiptIcon color="warning" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Rs. {pendingAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Amount
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ReceiptIcon color="error" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Rs. {overdueAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue Amount
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ReceiptIcon color="info" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {bills.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bills
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Service Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {bill.patient.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {bill.patient}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{bill.service_type}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      Rs. {bill.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bill.status}
                      color={getStatusColor(bill.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(bill.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {bill.notes}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handlePrintBill(bill.id)}
                      >
                        <PrintIcon />
                      </IconButton>
                      {bill.status === 'pending' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleMarkPaid(bill.id)}
                        >
                          <PaymentIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditBill(bill)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteBill(bill.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Bill Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingBill ? 'Edit Bill' : 'Create New Bill'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Patient Name"
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={formData.service_type}
                  label="Service Type"
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                >
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="Lab Test">Lab Test</MenuItem>
                  <MenuItem value="Prescription">Prescription</MenuItem>
                  <MenuItem value="Procedure">Procedure</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveBill} variant="contained">
              {editingBill ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default BillingManagement;

