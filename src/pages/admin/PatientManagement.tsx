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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
    // PersonIcon import removed as it was unused

const PatientManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    nic: '',
    allergies: '',
  });

  // Mock patients data
  const patients = [
    {
      id: '1',
      name: 'Kasun Bandara',
      email: 'kasun.bandara@aanya.com',
      phone: '+94 71 123 4567',
      nic: '199012301234',
      age: 35,
      gender: 'Male',
      allergies: 'Penicillin',
      status: 'active',
      lastVisit: '2024-12-15',
    },
    {
      id: '2',
      name: 'Nimal Perera',
      email: 'nimal.perera@aanya.com',
      phone: '+94 77 555 8899',
      nic: '198506152345',
      age: 28,
      gender: 'Female',
      allergies: 'None',
      status: 'active',
      lastVisit: '2024-12-10',
    },
    {
      id: '3',
      name: 'Ishara Silva',
      email: 'ishara.silva@aanya.com',
      phone: '+94 76 234 5678',
      nic: '199310052678',
      age: 42,
      gender: 'Male',
      allergies: 'Shellfish',
      status: 'active',
      lastVisit: '2024-12-08',
    },
    {
      id: '4',
      name: 'Amaya Fernando',
      email: 'amaya.fernando@aanya.com',
      phone: '+94 72 987 6543',
      nic: '199708152156',
      age: 31,
      gender: 'Female',
      allergies: 'Latex',
      status: 'inactive',
      lastVisit: '2024-11-20',
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'error';
  };

  const getGenderColor = (gender: string) => {
    return gender === 'Male' ? 'primary' : 'secondary';
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      nic: '',
      allergies: '',
    });
    setOpenDialog(true);
  };

  const handleEditPatient = (patient: any) => {
    setEditingPatient(patient);
    setFormData({
      full_name: patient.name,
      email: patient.email,
      phone: patient.phone,
      nic: patient.nic,
      allergies: patient.allergies,
    });
    setOpenDialog(true);
  };

  const handleDeletePatient = (patientId: string) => {
    console.log('Delete patient:', patientId);
    // In a real app, this would call the API
  };

  const handleViewPatient = (patientId: string) => {
    console.log('View patient:', patientId);
    // In a real app, this would navigate to patient details
  };

  const handleSavePatient = () => {
    console.log('Save patient:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Patient Management
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
                <TableCell>NIC</TableCell>
                <TableCell>Allergies</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {patient.name.split(' ').map(n => n[0]).join('')}
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
                  <TableCell>{patient.nic}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {patient.allergies}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status}
                      color={getStatusColor(patient.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(patient.lastVisit).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewPatient(patient.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditPatient(patient)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePatient(patient.id)}
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

        {/* Add/Edit Patient Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingPatient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="NIC"
                value={formData.nic}
                onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Allergies"
                multiline
                rows={2}
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSavePatient} variant="contained">
              {editingPatient ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PatientManagement;

