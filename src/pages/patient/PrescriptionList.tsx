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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Description as PrescriptionIcon,
} from '@mui/icons-material';

const PrescriptionList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  // Mock prescriptions data
  const prescriptions = [
    {
      id: '1',
      medicines: ['Metformin 500mg', 'Lisinopril 10mg'],
      issued_date: '2024-12-15',
      status: 'active',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Take with food, monitor blood sugar levels',
      expiry_date: '2025-01-15',
    },
    {
      id: '2',
      medicines: ['Aspirin 81mg', 'Vitamin D3'],
      issued_date: '2024-12-10',
      status: 'dispensed',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Take with food',
      expiry_date: '2025-01-10',
    },
    {
      id: '3',
      medicines: ['Atorvastatin 20mg'],
      issued_date: '2024-12-05',
      status: 'expired',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Cholesterol management',
      expiry_date: '2024-12-20',
    },
    {
      id: '4',
      medicines: ['Levothyroxine 50mcg'],
      issued_date: '2024-11-20',
      status: 'cancelled',
      doctor: 'Dr. Sarah Wilson',
      notes: 'Patient requested cancellation',
      expiry_date: '2024-12-20',
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

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setOpenDialog(true);
  };

  const handleDownloadPrescription = (prescriptionId: string) => {
    console.log('Download prescription:', prescriptionId);
    // In a real app, this would download the prescription
  };

  const handlePrintPrescription = (prescriptionId: string) => {
    console.log('Print prescription:', prescriptionId);
    // In a real app, this would open print dialog
  };

  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const expiredPrescriptions = prescriptions.filter(p => p.status === 'expired').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            My Prescriptions
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => console.log('Download all prescriptions')}
            >
              Download All
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => console.log('Print all prescriptions')}
            >
              Print All
            </Button>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Active Prescriptions: {activePrescriptions}
            </Typography>
          </Alert>
          <Alert severity="warning" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Expired Prescriptions: {expiredPrescriptions}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicines</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Issued Date</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
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
                  <TableCell>{prescription.doctor}</TableCell>
                  <TableCell>
                    {new Date(prescription.issued_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(prescription.expiry_date).toLocaleDateString()}
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
                        onClick={() => handleViewPrescription(prescription)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleDownloadPrescription(prescription.id)}
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handlePrintPrescription(prescription.id)}
                      >
                        <PrintIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Prescription Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Prescription Details
          </DialogTitle>
          <DialogContent>
            {selectedPrescription && (
              <Box sx={{ pt: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <PrescriptionIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Prescription #{selectedPrescription.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Issued by {selectedPrescription.doctor}
                    </Typography>
                  </Box>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Medications
                  </Typography>
                  <Box>
                    {selectedPrescription.medicines.map((medicine: string, index: number) => (
                      <Chip
                        key={index}
                        label={medicine}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Dates
                  </Typography>
                  <Typography variant="body2">
                    Issued: {new Date(selectedPrescription.issued_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Expires: {new Date(selectedPrescription.expiry_date).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={selectedPrescription.status}
                    color={getStatusColor(selectedPrescription.status)}
                    size="small"
                  />
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Instructions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPrescription.notes}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => handleDownloadPrescription(selectedPrescription?.id)}
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PrescriptionList;

