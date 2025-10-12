import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
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
} from '@mui/material';
import {
  LocalPharmacy as PharmacyIcon,
  Description as PrescriptionIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const PharmacistDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data
  const pendingPrescriptions = [
    {
      id: '1',
      patient: 'John Doe',
      doctor: 'Dr. Sarah Wilson',
      medicines: ['Metformin 500mg', 'Lisinopril 10mg'],
      issued_date: '2024-12-15',
      status: 'active',
    },
    {
      id: '2',
      patient: 'Alice Smith',
      doctor: 'Dr. Sarah Wilson',
      medicines: ['Aspirin 81mg'],
      issued_date: '2024-12-14',
      status: 'active',
    },
  ];

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
    console.log('Dispense prescription:', prescriptionId);
    // In a real app, this would call the API to dispense
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

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      45
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dispensed Today
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Prescriptions */}
          <Grid item xs={12} md={6}>
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
                                  Dr. {prescription.doctor}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {prescription.medicines.join(', ')}
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
          </Grid>

          {/* Low Stock Medicines */}
          <Grid item xs={12} md={6}>
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
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PharmacistDashboard;
