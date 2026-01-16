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
  Alert,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const PatientList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Mock patients data
  const patients = [
    {
      id: '1',
      name: 'Nimal Perera',
      email: 'nimal.perera@email.com',
      phone: '+94771234567',
      age: 35,
      gender: 'Male',
      lastVisit: '2024-12-15',
      status: 'active',
      allergies: 'Penicillin',
      conditions: ['Diabetes', 'Hypertension'],
    },
    {
      id: '2',
      name: 'Kamani Silva',
      email: 'kamani.silva@email.com',
      phone: '+94771234568',
      age: 28,
      gender: 'Female',
      lastVisit: '2024-12-10',
      status: 'active',
      allergies: 'None',
      conditions: ['Asthma'],
    },
    {
      id: '3',
      name: 'Sunil Fernando',
      email: 'sunil.fernando@email.com',
      phone: '+94771234569',
      age: 42,
      gender: 'Male',
      lastVisit: '2024-12-08',
      status: 'active',
      allergies: 'Shellfish',
      conditions: ['High Cholesterol'],
    },
    {
      id: '4',
      name: 'Sanduni Wickramasinghe',
      email: 'sanduni.wickramasinghe@email.com',
      phone: '+94771234570',
      age: 31,
      gender: 'Female',
      lastVisit: '2024-11-20',
      status: 'inactive',
      allergies: 'Latex',
      conditions: ['Thyroid Disorder'],
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getGenderColor = (gender: string) => {
    return gender === 'Male' ? 'primary' : 'secondary';
  };

  const handleViewPatient = (patient: any) => {
    setSelectedPatient(patient);
    setOpenDialog(true);
  };

  const handleAddPatient = () => {
    console.log('Add new patient');
    // In a real app, this would navigate to add patient form
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            My Patients
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPatient}
          >
            Add Patient
          </Button>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Age/Gender</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Conditions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {patient.name.split(' ').map((n: string) => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {patient.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{patient.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{patient.age} years</Typography>
                      <Chip
                        label={patient.gender}
                        color={getGenderColor(patient.gender)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status}
                      color={getStatusColor(patient.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      {patient.conditions.map((condition: string, index: number) => (
                        <Chip
                          key={index}
                          label={condition}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewPatient(patient)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => console.log('Edit patient:', patient.id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Patient Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Patient Details
          </DialogTitle>
          <DialogContent>
            {selectedPatient && (
              <Box sx={{ pt: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {selectedPatient.name.split(' ').map((n: string) => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedPatient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPatient.age} years, {selectedPatient.gender}
                    </Typography>
                  </Box>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body2">Email: {selectedPatient.email}</Typography>
                  <Typography variant="body2">Phone: {selectedPatient.phone}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Medical Information
                  </Typography>
                  <Typography variant="body2">Allergies: {selectedPatient.allergies}</Typography>
                  <Typography variant="body2">Last Visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}</Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Current Conditions
                  </Typography>
                  <Box>
                    {selectedPatient.conditions.map((condition: string, index: number) => (
                      <Chip
                        key={index}
                        label={condition}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            <Button variant="contained" onClick={() => console.log('Create prescription for:', selectedPatient?.id)}>
              Create Prescription
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PatientList;

