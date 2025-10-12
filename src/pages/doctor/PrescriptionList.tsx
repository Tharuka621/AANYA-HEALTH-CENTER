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
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as PrescriptionIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const PrescriptionList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    medicines: '',
    status: 'active',
    notes: '',
  });

  // Mock prescriptions data
  const prescriptions = [
    {
      id: '1',
      patient: 'John Doe',
      medicines: ['Metformin 500mg', 'Lisinopril 10mg'],
      issued_date: '2024-12-15',
      status: 'dispensed',
      notes: 'Monitor blood sugar levels',
    },
    {
      id: '2',
      patient: 'Alice Smith',
      medicines: ['Aspirin 81mg', 'Vitamin D3'],
      issued_date: '2024-12-16',
      status: 'active',
      notes: 'Take with food',
    },
    {
      id: '3',
      patient: 'Bob Johnson',
      medicines: ['Atorvastatin 20mg'],
      issued_date: '2024-12-17',
      status: 'active',
      notes: 'Cholesterol management',
    },
    {
      id: '4',
      patient: 'Emma Wilson',
      medicines: ['Levothyroxine 50mcg'],
      issued_date: '2024-12-18',
      status: 'cancelled',
      notes: 'Patient requested cancellation',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'primary';
      case 'dispensed': return 'success';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const handleAddPrescription = () => {
    setEditingPrescription(null);
    setFormData({
      patient_name: '',
      medicines: '',
      status: 'active',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditPrescription = (prescription: any) => {
    setEditingPrescription(prescription);
    setFormData({
      patient_name: prescription.patient,
      medicines: prescription.medicines.join(', '),
      status: prescription.status,
      notes: prescription.notes,
    });
    setOpenDialog(true);
  };

  const handleDeletePrescription = (prescriptionId: string) => {
    console.log('Delete prescription:', prescriptionId);
    // In a real app, this would call the API
  };

  const handleViewPrescription = (prescriptionId: string) => {
    console.log('View prescription:', prescriptionId);
    // In a real app, this would open prescription details
  };

  const handlePrintPrescription = (prescriptionId: string) => {
    console.log('Print prescription:', prescriptionId);
    // In a real app, this would open print dialog
  };

  const handleSavePrescription = () => {
    console.log('Save prescription:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            My Prescriptions
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPrescription}
          >
            Create Prescription
          </Button>
        </Box>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Active Prescriptions: {activePrescriptions}
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Dispensed Prescriptions: {dispensedPrescriptions}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Medicines</TableCell>
                <TableCell>Issued Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {prescription.patient.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {prescription.patient}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {prescription.medicines.map((medicine: string, index: number) => (
                        <Chip
                          key={index}
                          label={medicine}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(prescription.issued_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prescription.status}
                      color={getStatusColor(prescription.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {prescription.notes}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewPrescription(prescription.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handlePrintPrescription(prescription.id)}
                      >
                        <PrintIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditPrescription(prescription)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePrescription(prescription.id)}
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

        {/* Add/Edit Prescription Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingPrescription ? 'Edit Prescription' : 'Create New Prescription'}
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
              <TextField
                fullWidth
                label="Medicines (comma-separated)"
                multiline
                rows={3}
                value={formData.medicines}
                onChange={(e) => setFormData({ ...formData, medicines: e.target.value })}
                margin="normal"
                placeholder="Metformin 500mg, Lisinopril 10mg"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="dispensed">Dispensed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
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
            <Button onClick={handleSavePrescription} variant="contained">
              {editingPrescription ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PrescriptionList;

