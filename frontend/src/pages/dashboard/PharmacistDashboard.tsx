import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Description as PrescriptionIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Prescription {
  id: string;
  patient: string;
  doctor: string;
  medicines: Array<{ name: string; qty: number; price: number }>;
  issued_date: string;
  status: 'active' | 'dispensed';
}

const PharmacistDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data
  const [pendingPrescriptions, setPendingPrescriptions] = useState<Prescription[]>([
    {
      id: '1',
      patient: 'Kasun Bandara',
      doctor: 'Dr. Milinda Abeykoon',
      medicines: [
        { name: 'Metformin 500mg', qty: 30, price: 2.5 },
        { name: 'Lisinopril 10mg', qty: 30, price: 1.8 },
      ],
      issued_date: '2024-12-15',
      status: 'active',
    },
    {
      id: '2',
      patient: 'Nimal Perera',
      doctor: 'Dr. Milinda Abeykoon',
      medicines: [{ name: 'Aspirin 81mg', qty: 30, price: 0.5 }],
      issued_date: '2024-12-14',
      status: 'active',
    },
    {
      id: '3',
      patient: 'Amaya Fernando',
      doctor: 'Dr. Milinda Abeykoon',
      medicines: [
        { name: 'Atorvastatin 20mg', qty: 30, price: 3.0 },
        { name: 'Vitamin D3', qty: 30, price: 1.2 },
      ],
      issued_date: '2024-12-16',
      status: 'active',
    },
  ]);

  const [billOpen, setBillOpen] = useState(false);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const lowStockMedicines = [
    {
      id: '1',
      name: 'Lisinopril',
      current_stock: 25,
      reorder_level: 30,
      expiry_date: '2025-06-30',
    },
    {
      id: '2',
      name: 'Metformin',
      current_stock: 15,
      reorder_level: 50,
      expiry_date: '2025-12-31',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'warning';
      case 'dispensed':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDispense = (prescriptionId: string) => {
    const prescription = pendingPrescriptions.find((p) => p.id === prescriptionId);
    if (prescription) {
      setActivePrescription(prescription);
      setBillOpen(true);
    }
  };

  const handleCompleteBilling = () => {
    if (activePrescription) {
      setPendingPrescriptions((prev) =>
        prev.map((p) =>
          p.id === activePrescription.id ? { ...p, status: 'dispensed' } : p
        )
      );
      setBillOpen(false);
      setActivePrescription(null);
      setPaymentMethod('cash');
    }
  };

  const handleCloseBill = () => {
    setBillOpen(false);
    setActivePrescription(null);
    setPaymentMethod('cash');
  };

  const calculateTotal = (): number => {
    if (!activePrescription) return 0;
    return activePrescription.medicines.reduce(
      (sum, med) => sum + med.qty * med.price,
      0
    );
  };

  const handleReorder = (medicineId: string) => {
    console.log('Reorder medicine:', medicineId);
    // In a real app, this would trigger reorder process
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome, {user?.full_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage prescriptions and monitor inventory levels.
          </Typography>
        </Box>

        {/* Low Stock Alert */}
        {lowStockMedicines.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Low Stock Alert
            </Typography>
            <Typography variant="body2">
              {lowStockMedicines.length} medicine(s) are running low on stock. Please reorder soon.
            </Typography>
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    156
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Medicines
                  </Typography>
                </Box>
                <PharmacyIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {pendingPrescriptions.filter((p) => p.status === 'active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Prescriptions
                  </Typography>
                </Box>
                <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {lowStockMedicines.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {pendingPrescriptions.filter((p) => p.status === 'dispensed').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dispensed Today
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 3,
          }}
        >
          {/* Pending Prescriptions */}
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Pending Prescriptions
                  </Typography>
                  <PrescriptionIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {pendingPrescriptions.length > 0 ? (
                  <List>
                    {pendingPrescriptions.map((prescription, index) => (
                      <React.Fragment key={prescription.id}>
                        <ListItem>
                          <ListItemIcon>
                            <PrescriptionIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {prescription.patient}
                                </Typography>
                                <Chip
                                  label={prescription.status}
                                  size="small"
                                  color={getStatusColor(prescription.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {prescription.doctor}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {prescription.medicines.map((m) => m.name).join(', ')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Issued: {new Date(prescription.issued_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleDispense(prescription.id)}
                          >
                            Dispense
                          </Button>
                        </ListItem>
                        {index < pendingPrescriptions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No pending prescriptions at the moment.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Low Stock Medicines */}
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Low Stock Medicines
                  </Typography>
                  <InventoryIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {lowStockMedicines.length > 0 ? (
                  <List>
                    {lowStockMedicines.map((medicine, index) => (
                      <React.Fragment key={medicine.id}>
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {medicine.name}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Current Stock: {medicine.current_stock} units
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Reorder Level: {medicine.reorder_level} units
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Expiry: {new Date(medicine.expiry_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleReorder(medicine.id)}
                          >
                            Reorder
                          </Button>
                        </ListItem>
                        {index < lowStockMedicines.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="success">
                    All medicines are well stocked!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

      {/* Billing Dialog */}
      <Dialog open={billOpen} onClose={handleCloseBill} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Generate Bill</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {activePrescription && (
            <>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {activePrescription.patient}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Doctor
                </Typography>
                <Typography variant="body1">
                  {activePrescription.doctor}
                </Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Medicines
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activePrescription.medicines.map((med, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{med.name}</TableCell>
                          <TableCell align="center">{med.qty}</TableCell>
                          <TableCell align="right">
                            Rs. {med.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            Rs. {(med.qty * med.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="subtitle1" fontWeight={700}>
                            Grand Total:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary.main" fontWeight={700}>
                            Rs. {calculateTotal().toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box mt={3}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ mb: 1 }}>
                    Payment Method
                  </FormLabel>
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="cash"
                      control={<Radio />}
                      label="Cash"
                    />
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label="Card (Credit/Debit)"
                    />
                    <FormControlLabel
                      value="mobile"
                      control={<Radio />}
                      label="Mobile Payment"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBill} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCompleteBilling}
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Complete Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PharmacistDashboard;
