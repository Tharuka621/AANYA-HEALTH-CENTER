import React, { useState, useMemo } from 'react';
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
  Grid,
  Snackbar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Description as PrescriptionIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Medication as MedicationIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  MoneyOff as UnpaidIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Prescription, 
  InventoryBatch, 
  BatchDeductionPlan,
  DBInvoice,
  DBInvoiceItem,
  DBInvoicePayment,
} from '../../types/pharmacy';
import {
  planBatchDeductionsFEFO,
  applyBatchDeductions,
  getLowStockMedicines,
  calculateInvoiceTotals,
} from '../../utils/stock';

const PharmacistDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  // Medicine thresholds for low stock calculation
  const medicineThresholds = useMemo(() => {
    const map = new Map<string, number>();
    map.set('MED001', 50);  // Metformin
    map.set('MED002', 30);  // Lisinopril
    map.set('MED003', 100); // Aspirin
    map.set('MED004', 40);  // Atorvastatin
    map.set('MED005', 30);  // Vitamin D3
    map.set('MED006', 50);  // Amoxicillin
    return map;
  }, []);

  // Inventory batches state (DB-aligned with inventory_batches table)
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([
    // Metformin 500mg batches
    { id: 'B001', medicine_id: 'MED001', medicine_name: 'Metformin', dosage: '500mg', batch_no: 'MET-2024-A', expiry_date: '2025-06-30', qty_available: 80, sell_price: 2.5 },
    { id: 'B002', medicine_id: 'MED001', medicine_name: 'Metformin', dosage: '500mg', batch_no: 'MET-2024-B', expiry_date: '2025-12-31', qty_available: 70, sell_price: 2.5 },
    
    // Lisinopril 10mg batches
    { id: 'B003', medicine_id: 'MED002', medicine_name: 'Lisinopril', dosage: '10mg', batch_no: 'LIS-2024-A', expiry_date: '2025-03-15', qty_available: 15, sell_price: 1.8 },
    { id: 'B004', medicine_id: 'MED002', medicine_name: 'Lisinopril', dosage: '10mg', batch_no: 'LIS-2024-B', expiry_date: '2025-08-20', qty_available: 10, sell_price: 1.8 },
    
    // Aspirin 81mg batches
    { id: 'B005', medicine_id: 'MED003', medicine_name: 'Aspirin', dosage: '81mg', batch_no: 'ASP-2024-A', expiry_date: '2026-01-30', qty_available: 120, sell_price: 0.5 },
    { id: 'B006', medicine_id: 'MED003', medicine_name: 'Aspirin', dosage: '81mg', batch_no: 'ASP-2024-B', expiry_date: '2026-03-15', qty_available: 80, sell_price: 0.5 },
    
    // Atorvastatin 20mg batches
    { id: 'B007', medicine_id: 'MED004', medicine_name: 'Atorvastatin', dosage: '20mg', batch_no: 'ATO-2024-A', expiry_date: '2025-09-20', qty_available: 50, sell_price: 3.0 },
    { id: 'B008', medicine_id: 'MED004', medicine_name: 'Atorvastatin', dosage: '20mg', batch_no: 'ATO-2024-B', expiry_date: '2025-11-10', qty_available: 30, sell_price: 3.0 },
    
    // Vitamin D3 1000IU batches
    { id: 'B009', medicine_id: 'MED005', medicine_name: 'Vitamin D3', dosage: '1000IU', batch_no: 'VIT-2024-A', expiry_date: '2026-01-10', qty_available: 10, sell_price: 1.2 },
    { id: 'B010', medicine_id: 'MED005', medicine_name: 'Vitamin D3', dosage: '1000IU', batch_no: 'VIT-2024-B', expiry_date: null, qty_available: 5, sell_price: 1.2 },
    
    // Amoxicillin 500mg batches
    { id: 'B011', medicine_id: 'MED006', medicine_name: 'Amoxicillin', dosage: '500mg', batch_no: 'AMX-2024-A', expiry_date: '2025-08-25', qty_available: 70, sell_price: 2.0 },
    { id: 'B012', medicine_id: 'MED006', medicine_name: 'Amoxicillin', dosage: '500mg', batch_no: 'AMX-2024-B', expiry_date: '2025-10-15', qty_available: 50, sell_price: 2.0 },
  ]);

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: '1',
      prescriptionId: 'PRX-2026-001',
      patient: 'Kasun Bandara',
      doctor: 'Dr. Milinda Abeykoon',
      medicines: [
        { name: 'Metformin', dosage: '500mg', quantity: 30 },
        { name: 'Lisinopril', dosage: '10mg', quantity: 30 },
      ],
      issued_date: '2026-01-26',
      status: 'ACTIVE',
    },
    {
      id: '2',
      prescriptionId: 'PRX-2026-002',
      patient: 'Nimal Perera',
      doctor: 'Dr. Milinda Abeykoon',
      medicines: [
        { name: 'Aspirin', dosage: '81mg', quantity: 30 },
      ],
      issued_date: '2026-01-25',
      status: 'ACTIVE',
    },
    {
      id: '3',
      prescriptionId: 'PRX-2026-003',
      patient: 'Amaya Fernando',
      doctor: 'Dr. Milinda Abeykoon',
      medicines: [
        { name: 'Atorvastatin', dosage: '20mg', quantity: 30 },
        { name: 'Vitamin D3', dosage: '1000IU', quantity: 30 },
      ],
      issued_date: '2026-01-26',
      status: 'ACTIVE',
    },
    {
      id: '4',
      prescriptionId: 'PRX-2026-004',
      patient: 'Saman Kumara',
      doctor: 'Dr. Milinda Abeykoon',
      medicines: [
        { name: 'Amoxicillin', dosage: '500mg', quantity: 21 },
      ],
      issued_date: '2026-01-24',
      status: 'DISPENSED',
    },
  ]);

  const [dispenseDialogOpen, setDispenseDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [deductionPlans, setDeductionPlans] = useState<BatchDeductionPlan[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Billing state
  const [invoices, setInvoices] = useState<DBInvoice[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<DBInvoiceItem[]>([]);
  const [, setInvoicePayments] = useState<DBInvoicePayment[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<DBInvoice | null>(null);
  
  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ONLINE'>('CASH');
  const [paymentRef, setPaymentRef] = useState('');

  // Inventory view state
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // Calculate low stock medicines dynamically using batches
  const lowStockMedicines = useMemo(() => {
    return getLowStockMedicines(inventoryBatches, medicineThresholds);
  }, [inventoryBatches, medicineThresholds]);

  // Calculate pending prescriptions
  const pendingPrescriptions = useMemo(() => {
    return prescriptions.filter(p => p.status === 'ACTIVE');
  }, [prescriptions]);

  // Calculate dispensed today count
  const dispensedToday = useMemo(() => {
    return prescriptions.filter(p => p.status === 'DISPENSED').length;
  }, [prescriptions]);

  // Calculate unpaid invoices count
  const unpaidInvoicesCount = useMemo(() => {
    return invoices.filter(inv => inv.status === 'UNPAID').length;
  }, [invoices]);

  // Calculate total medicines count
  const totalMedicines = useMemo(() => {
    const uniqueMedicines = new Set<string>();
    inventoryBatches.forEach(batch => {
      uniqueMedicines.add(`${batch.medicine_id}-${batch.dosage}`);
    });
    return uniqueMedicines.size;
  }, [inventoryBatches]);

  // Aggregate medicines with total quantities from all batches
  const aggregatedMedicines = useMemo(() => {
    const medicineMap = new Map<string, {
      medicine_id: string;
      medicine_name: string;
      dosage: string;
      total_quantity: number;
      batch_count: number;
    }>();

    inventoryBatches.forEach(batch => {
      const key = `${batch.medicine_id}-${batch.dosage}`;
      if (medicineMap.has(key)) {
        const existing = medicineMap.get(key)!;
        existing.total_quantity += batch.qty_available;
        existing.batch_count += 1;
      } else {
        medicineMap.set(key, {
          medicine_id: batch.medicine_id,
          medicine_name: batch.medicine_name,
          dosage: batch.dosage,
          total_quantity: batch.qty_available,
          batch_count: 1,
        });
      }
    });

    return Array.from(medicineMap.values());
  }, [inventoryBatches]);

  // Filtered medicines based on search query
  const filteredMedicines = useMemo(() => {
    if (!inventorySearchQuery.trim()) return aggregatedMedicines;
    
    const query = inventorySearchQuery.toLowerCase();
    return aggregatedMedicines.filter(med => 
      med.medicine_name.toLowerCase().includes(query) ||
      med.dosage.toLowerCase().includes(query) ||
      med.medicine_id.toLowerCase().includes(query)
    );
  }, [aggregatedMedicines, inventorySearchQuery]);

  const handleDispense = (prescriptionId: string) => {
    const prescription = prescriptions.find((p) => p.id === prescriptionId);
    if (prescription && prescription.status === 'ACTIVE') {
      setSelectedPrescription(prescription);
      
      // Plan batch deductions using FEFO logic
      const plans: BatchDeductionPlan[] = [];
      
      prescription.medicines.forEach(med => {
        const medicineId = inventoryBatches.find(
          b => b.medicine_name === med.name && b.dosage === med.dosage
        )?.medicine_id;
        
        if (medicineId) {
          const plan = planBatchDeductionsFEFO(
            inventoryBatches,
            medicineId,
            med.dosage,
            med.quantity
          );
          plans.push(plan);
        }
      });
      
      setDeductionPlans(plans);
      setDispenseDialogOpen(true);
      setShowInvoice(false);
    }
  };

  const handleConfirmDispense = () => {
    if (!selectedPrescription) return;

    // Check for any errors in deduction plans
    const errors = deductionPlans.filter(plan => plan.error);
    if (errors.length > 0) {
      const errorMsg = errors[0].error || 'Insufficient stock';
      setErrorMessage(errorMsg);
      setSnackbarOpen(true);
      return;
    }

    // Apply batch deductions
    const updatedBatches = applyBatchDeductions(inventoryBatches, deductionPlans);
    setInventoryBatches(updatedBatches);

    // Update prescription status to DISPENSED
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === selectedPrescription.id ? { ...p, status: 'DISPENSED' } : p
      )
    );

    // Generate invoice ID
    const invoiceId = `INV-${String(invoices.length + 1).padStart(6, '0')}`;
    const now = new Date().toISOString();

    // Create invoice items from batch deductions
    const newInvoiceItems: DBInvoiceItem[] = [];
    deductionPlans.forEach(plan => {
      plan.batches.forEach(batch => {
        newInvoiceItems.push({
          id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          invoice_id: invoiceId,
          batch_id: batch.batch_id,
          medicine_name: plan.medicine_name,
          dosage: plan.dosage,
          batch_no: batch.batch_no,
          qty: batch.qty_to_deduct,
          unit_price: batch.unit_price,
          line_total: batch.qty_to_deduct * batch.unit_price,
        });
      });
    });

    // Calculate total amount
    const totalAmount = calculateInvoiceTotals(newInvoiceItems);

    // Create invoice with initial status UNPAID (payment recorded separately)
    const newInvoice: DBInvoice = {
      id: invoiceId,
      patient_id: selectedPrescription.id, // Using prescription id as patient reference
      visit_id: selectedPrescription.prescriptionId,
      total_amount: totalAmount,
      status: 'UNPAID',
      created_at: now,
    };

    // Save to state (no payment record yet)
    setInvoices(prev => [...prev, newInvoice]);
    setInvoiceItems(prev => [...prev, ...newInvoiceItems]);
    setCurrentInvoice(newInvoice);
    setShowInvoice(true);
  };

  // Handle recording payment for an unpaid invoice
  const handleRecordPayment = () => {
    if (!currentInvoice || currentInvoice.status === 'PAID') return;

    const now = new Date().toISOString();

    // Create payment record
    const payment: DBInvoicePayment = {
      id: `PAY-${Date.now()}`,
      invoice_id: currentInvoice.id,
      method: paymentMethod,
      amount: currentInvoice.total_amount,
      payment_ref: paymentRef || undefined,
      paid_at: now,
    };

    // Update invoice status to PAID
    const updatedInvoice = { ...currentInvoice, status: 'PAID' as const };

    // Update state
    setInvoicePayments(prev => [...prev, payment]);
    setInvoices(prev => prev.map(inv => inv.id === currentInvoice.id ? updatedInvoice : inv));
    setCurrentInvoice(updatedInvoice);

    // Reset payment form
    setPaymentRef('');
  };

  const handleCloseDispenseDialog = () => {
    setDispenseDialogOpen(false);
    setSelectedPrescription(null);
    setDeductionPlans([]);
    setShowInvoice(false);
    setCurrentInvoice(null);
    setPaymentMethod('CASH');
    setPaymentRef('');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setErrorMessage('');
  };

  const handleViewInventory = () => {
    setInventoryDialogOpen(true);
    setInventorySearchQuery('');
  };

  const handleCloseInventoryDialog = () => {
    setInventoryDialogOpen(false);
    setInventorySearchQuery('');
  };

  const handlePrintReceipt = () => {
    if (currentInvoice) {
      console.log('=== RECEIPT ===');
      console.log('Invoice ID:', currentInvoice.id);
      console.log('Patient:', selectedPrescription?.patient);
      console.log('Date:', new Date(currentInvoice.created_at).toLocaleString());
      console.log('Status:', currentInvoice.status);
      console.log('Total Amount: Rs.', currentInvoice.total_amount.toFixed(2));
      console.log('Items:', invoiceItems.filter(item => item.invoice_id === currentInvoice.id));
      console.log('===============');
      
      // In production, would call window.print() with a formatted receipt
      alert('Receipt printed to console. Check browser console (F12).');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <PharmacyIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            AANYA Health - Pharmacy Dashboard
          </Typography>
          
          {/* User Profile Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.full_name}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                Pharmacist
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.dark', fontWeight: 700 }}>
              {user?.full_name?.charAt(0)}
            </Avatar>
            <IconButton 
              color="inherit" 
              onClick={logout}
              title="Logout"
              sx={{ 
                ml: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
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
              md: 'repeat(5, 1fr)',
            },
            gap: 3,
            mb: 3,
          }}
        >
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
            onClick={handleViewInventory}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {totalMedicines}
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
                    {pendingPrescriptions.length}
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
                    {dispensedToday}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dispensed Today
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {unpaidInvoicesCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unpaid Invoices
                  </Typography>
                </Box>
                <UnpaidIcon color="error" sx={{ fontSize: 40 }} />
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
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {prescription.patient}
                                </Typography>
                                <Chip
                                  label={prescription.prescriptionId}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  sx={{ fontFamily: 'monospace' }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Doctor: {prescription.doctor}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Medicines: {prescription.medicines.length} item(s)
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
                            sx={{ 
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
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
                      <React.Fragment key={`${medicine.id}-${medicine.dosage}`}>
                        <ListItem>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {medicine.name} {medicine.dosage}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Current Stock: {medicine.total_available} units
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Threshold: {medicine.threshold} units
                                </Typography>
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => console.log('Reorder:', medicine.id)}
                            sx={{ textTransform: 'none' }}
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

      {/* Dispense Medicines Dialog */}
      <Dialog 
        open={dispenseDialogOpen} 
        onClose={handleCloseDispenseDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MedicationIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700}>
              {showInvoice ? 'Dispense Summary' : 'Dispense Medicines'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPrescription && !showInvoice && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Patient Name
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedPrescription.patient}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Prescription ID
                    </Typography>
                    <Chip
                      label={selectedPrescription.prescriptionId}
                      color="primary"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Doctor
                    </Typography>
                    <Typography variant="body1">
                      {selectedPrescription.doctor}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Issued Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedPrescription.issued_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Prescribed Medicines & Batch Allocation (FEFO)
                </Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell>
                        <Typography fontWeight={700}>Medicine</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={700}>Required</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={700}>Available</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>Batches to Use (FEFO)</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deductionPlans.map((plan, idx) => {
                      const hasError = !!plan.error;
                      const batchesPreview = plan.batches.length > 0
                        ? plan.batches.map(b => `${b.batch_no} (${b.qty_to_deduct})`).join(', ')
                        : 'N/A';
                      
                      return (
                        <TableRow key={idx} sx={{ bgcolor: hasError ? 'error.light' : 'inherit' }}>
                          <TableCell>
                            <Typography fontWeight={600}>
                              {plan.medicine_name} {plan.dosage}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={selectedPrescription.medicines[idx]?.quantity || 0}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={plan.total_deducted + plan.remaining_needed}
                              size="small"
                              color={hasError ? 'error' : 'success'}
                              icon={hasError ? <WarningIcon /> : <CheckCircleIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            {hasError ? (
                              <Alert severity="error" sx={{ py: 0 }}>
                                {plan.error}
                              </Alert>
                            ) : (
                              <Tooltip title={batchesPreview}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '250px',
                                  }}
                                >
                                  {batchesPreview}
                                </Typography>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Medicines will be dispensed using FEFO (First Expiry, First Out) logic.
                  Stock will be deducted from batches with earliest expiry dates first.
                </Typography>
              </Alert>
            </Box>
          )}

          {/* Invoice/Receipt Summary */}
          {showInvoice && currentInvoice && (
            <Box sx={{ pt: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  ✓ Prescription Dispensed Successfully
                </Typography>
                <Typography variant="body2">
                  Invoice {currentInvoice.id} created for {selectedPrescription?.patient}
                </Typography>
              </Alert>

              <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Invoice ID
                      </Typography>
                      <Chip 
                        label={currentInvoice.id} 
                        color="primary" 
                        sx={{ fontFamily: 'monospace', fontWeight: 700, mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip 
                        label={currentInvoice.status}
                        color={currentInvoice.status === 'PAID' ? 'success' : 'warning'}
                        sx={{ fontWeight: 700, mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Patient
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedPrescription?.patient}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date & Time
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(currentInvoice.created_at).toLocaleString()}
                      </Typography>
                    </Grid>
                    {currentInvoice.status === 'PAID' && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Method
                          </Typography>
                          <Chip 
                            label={paymentMethod}
                            size="small"
                            icon={<PaymentIcon />}
                            sx={{ mt: 0.5 }}
                          />
                        </Grid>
                        {paymentRef && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Payment Reference
                            </Typography>
                            <Typography variant="body2" fontFamily="monospace">
                              {paymentRef}
                            </Typography>
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              <Divider sx={{ my: 2 }} />

              {/* Payment Form - Only show if invoice is unpaid */}
              {currentInvoice.status === 'UNPAID' && (
                <>
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.lighter', borderRadius: 2, border: '1px solid', borderColor: 'warning.main' }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaymentIcon color="warning" />
                      Record Payment
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Payment Method</InputLabel>
                          <Select
                            value={paymentMethod}
                            label="Payment Method"
                            onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'CARD' | 'ONLINE')}
                          >
                            <MenuItem value="CASH">Cash</MenuItem>
                            <MenuItem value="CARD">Card (Credit/Debit)</MenuItem>
                            <MenuItem value="ONLINE">Online Payment</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Payment Reference (Optional)"
                          value={paymentRef}
                          onChange={(e) => setPaymentRef(e.target.value)}
                          placeholder="e.g., Transaction ID, Cheque No."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={handleRecordPayment}
                          fullWidth
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Record Payment (Rs. {currentInvoice.total_amount.toFixed(2)})
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Dispensed Items
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell><Typography fontWeight={700}>Medicine</Typography></TableCell>
                      <TableCell><Typography fontWeight={700}>Batch</Typography></TableCell>
                      <TableCell align="center"><Typography fontWeight={700}>Qty</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight={700}>Unit Price</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight={700}>Total</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceItems
                      .filter(item => item.invoice_id === currentInvoice.id)
                      .map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {item.medicine_name} {item.dosage}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={item.batch_no} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell align="center">{item.qty}</TableCell>
                          <TableCell align="right">Rs. {item.unit_price.toFixed(2)}</TableCell>
                          <TableCell align="right">Rs. {item.line_total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        <Typography variant="subtitle1" fontWeight={700}>
                          Grand Total:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          Rs. {currentInvoice.total_amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintReceipt}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Print Receipt
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {!showInvoice ? (
            <>
              <Button 
                onClick={handleCloseDispenseDialog} 
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDispense}
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled={deductionPlans.some(p => p.error)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Confirm Dispense
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCloseDispenseDialog}
              variant="contained"
              startIcon={<ReceiptIcon />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Inventory Dialog */}
      <Dialog 
        open={inventoryDialogOpen} 
        onClose={handleCloseInventoryDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PharmacyIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Pharmacy Inventory
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by medicine name, ID, or dosage..."
              value={inventorySearchQuery}
              onChange={(e) => setInventorySearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing {filteredMedicines.length} of {aggregatedMedicines.length} medicines
            </Typography>
          </Box>

          {/* Medicines Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell>
                    <Typography fontWeight={700} color="white">Medicine ID</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="white">Medicine Name</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="white">Dosage</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={700} color="white">Total Quantity</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={700} color="white">Batches</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((medicine) => {
                    const isLowStock = (medicineThresholds.get(medicine.medicine_id) || 0) > medicine.total_quantity;
                    return (
                      <TableRow 
                        key={`${medicine.medicine_id}-${medicine.dosage}`}
                        sx={{
                          bgcolor: isLowStock ? 'warning.lighter' : 'inherit',
                          '&:hover': { bgcolor: isLowStock ? 'warning.light' : 'grey.50' },
                        }}
                      >
                        <TableCell>
                          <Chip 
                            label={medicine.medicine_id} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontFamily: 'monospace' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {medicine.medicine_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={medicine.dosage} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            <Typography variant="h6" fontWeight={700} color={isLowStock ? 'warning.main' : 'success.main'}>
                              {medicine.total_quantity}
                            </Typography>
                            {isLowStock && (
                              <Tooltip title="Low Stock">
                                <WarningIcon color="warning" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${medicine.batch_count} batch${medicine.batch_count > 1 ? 'es' : ''}`}
                            size="small"
                            color="info"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box py={3}>
                        <Typography variant="body2" color="text.secondary">
                          No medicines found matching "{inventorySearchQuery}"
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseInventoryDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          <Typography variant="body2" fontWeight={600}>
            {errorMessage}
          </Typography>
        </Alert>
      </Snackbar>
      </Box>
    </Container>
    </Box>
  );
};

export default PharmacistDashboard;
