
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import Grid from "@mui/material/Grid";

import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Description as PrescriptionIcon,
  Science as LabIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  Close as CloseIcon,
  MonitorHeart as VitalIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import AvailabilityManager from '../../components/Doctor/AvailabilityManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Patient {
  id: string;
  name: string;
  time: string;
  reason: string;
  status: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  allergies: string[];
  currentMedications: string[];
}

interface VitalSign {
  date: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  oxygenSaturation: string;
}

interface MedicalHistory {
  date: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface LabTestRequest {
  testName: string;
  priority: string;
  notes: string;
}

const DoctorDashboard: React.FC = () => {
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const [openPrescriptionModal, setOpenPrescriptionModal] = useState(false);
  const [openLabTestModal, setOpenLabTestModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [labTestRequest, setLabTestRequest] = useState<LabTestRequest>({
    testName: '',
    priority: 'normal',
    notes: '',
  });

  // Mock data with extended patient information
  const todayPatients: Patient[] = [
    {
      id: '1',
      name: 'Nimal Perera',
      time: '10:00 AM',
      reason: 'Regular checkup',
      status: 'scheduled',
      age: 35,
      gender: 'Male',
      phone: '+94771234567',
      email: 'nimal.perera@email.com',
      allergies: ['Penicillin'],
      currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
    },
    {
      id: '2',
      name: 'Kamani Silva',
      time: '11:30 AM',
      reason: 'Blood pressure follow-up',
      status: 'checked_in',
      age: 28,
      gender: 'Female',
      phone: '+94771234568',
      email: 'kamani.silva@email.com',
      allergies: [],
      currentMedications: ['Aspirin 81mg'],
    },
    {
      id: '3',
      name: 'Sunil Fernando',
      time: '2:00 PM',
      reason: 'Diabetes consultation',
      status: 'scheduled',
      age: 42,
      gender: 'Male',
      phone: '+94771234569',
      email: 'sunil.fernando@email.com',
      allergies: ['Shellfish'],
      currentMedications: ['Atorvastatin 20mg', 'Metformin 850mg'],
    },
  ];

  // Mock vital signs data
  const getPatientVitals = (patientId: string): VitalSign[] => {
    return [
      {
        date: '2024-12-20',
        bloodPressure: '120/80',
        heartRate: '72',
        temperature: '98.6°F',
        weight: '70 kg',
        oxygenSaturation: '98%',
      },
      {
        date: '2024-12-15',
        bloodPressure: '118/78',
        heartRate: '70',
        temperature: '98.4°F',
        weight: '70 kg',
        oxygenSaturation: '97%',
      },
      {
        date: '2024-12-10',
        bloodPressure: '122/82',
        heartRate: '75',
        temperature: '98.5°F',
        weight: '71 kg',
        oxygenSaturation: '98%',
      },
    ];
  };

  // Mock medical history data
  const getPatientHistory = (patientId: string): MedicalHistory[] => {
    return [
      {
        date: '2024-12-15',
        diagnosis: 'Hypertension - Stage 1',
        treatment: 'Prescribed Lisinopril 10mg daily, advised low-sodium diet',
        doctor: 'Dr. Milinda Abeykoon',
      },
      {
        date: '2024-11-20',
        diagnosis: 'Type 2 Diabetes',
        treatment: 'Prescribed Metformin 500mg twice daily, dietary counseling',
        doctor: 'Dr. Milinda Abeykoon',
      },
      {
        date: '2024-10-10',
        diagnosis: 'Annual Physical Examination',
        treatment: 'All vitals normal, recommended regular exercise',
        doctor: 'Dr. Milinda Abeykoon',
      },
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleViewPatient = (patientId: string) => {
    const patient = todayPatients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setOpenPatientModal(true);
      setTabValue(0);
    }
  };

  const handleCreatePrescription = (patientId: string) => {
    const patient = todayPatients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setOpenPrescriptionModal(true);
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setPrescriptionNotes('');
    }
  };

  const handleClosePatientModal = () => {
    setOpenPatientModal(false);
    setSelectedPatient(null);
  };

  const handleClosePrescriptionModal = () => {
    setOpenPrescriptionModal(false);
    setSelectedPatient(null);
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setPrescriptionNotes('');
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleSavePrescription = () => {
    console.log('Saving prescription for:', selectedPatient?.name);
    console.log('Medicines:', medicines);
    console.log('Notes:', prescriptionNotes);
    // In a real app, this would call the API
    alert('Prescription created successfully!');
    handleClosePrescriptionModal();
  };

  const handleRequestLabTest = (patientId: string) => {
    const patient = todayPatients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setOpenLabTestModal(true);
      setLabTestRequest({ testName: '', priority: 'normal', notes: '' });
    }
  };

  const handleCloseLabTestModal = () => {
    setOpenLabTestModal(false);
    setSelectedPatient(null);
    setLabTestRequest({ testName: '', priority: 'normal', notes: '' });
  };

  const handleSaveLabTest = () => {
    console.log('Requesting lab test for:', selectedPatient?.name);
    console.log('Test:', labTestRequest);
    // In a real app, this would call the API
    alert('Lab test request created successfully!');
    handleCloseLabTestModal();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome, Dr. Milinda Abeykoon!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your patients are waiting. Here's today's schedule and quick actions.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Today's Patients */}
          <Grid item  xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Today's Patients
                  </Typography>
                  <CalendarIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {todayPatients.map((patient, index) => (
                    <React.Fragment key={patient.id}>
                      <ListItem>
                        <ListItemIcon>
                          <TimeIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {patient.name}
                              </Typography>
                              <Chip
                                label={patient.status.replace('_', ' ')}
                                size="small"
                                color={getStatusColor(patient.status)}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {patient.time} - {patient.reason}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleCreatePrescription(patient.id)}
                          >
                            Prescribe
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<LabIcon />}
                            onClick={() => handleRequestLabTest(patient.id)}
                          >
                            Lab Test
                          </Button>
                        </Box>
                      </ListItem>
                      {index < todayPatients.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<PersonIcon />}
                    fullWidth
                    onClick={() => console.log('View all patients - Feature coming soon')}
                  >
                    View All Patients
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrescriptionIcon />}
                    fullWidth
                    onClick={() => console.log('Create prescription - Feature coming soon')}
                  >
                    Create Prescription
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LabIcon />}
                    fullWidth
                    onClick={() => console.log('Request lab test - Feature coming soon')}
                  >
                    Request Lab Test
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HospitalIcon />}
                    fullWidth
                    onClick={() => console.log('View medical history - Feature coming soon')}
                  >
                    Medical History
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Today's Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Patients Seen:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      8
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Prescriptions:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      12
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Lab Requests:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      5
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Availability Manager Section */}
        <Box sx={{ mt: 3 }}>
          <AvailabilityManager />
        </Box>
      </Box>

      {/* Patient Details Modal */}
      <Dialog 
        open={openPatientModal} 
        onClose={handleClosePatientModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Patient Details: {selectedPatient?.name}
            </Typography>
            <IconButton onClick={handleClosePatientModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <>
              {/* Patient Basic Info */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Age</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedPatient.age} years</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Gender</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedPatient.gender}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedPatient.phone}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedPatient.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Allergies</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                      {selectedPatient.allergies.length > 0 ? (
                        selectedPatient.allergies.map((allergy, idx) => (
                          <Chip key={idx} label={allergy} size="small" color="error" />
                        ))
                      ) : (
                        <Typography variant="body2">None</Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Current Medications</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                      {selectedPatient.currentMedications.map((med, idx) => (
                        <Chip key={idx} label={med} size="small" color="primary" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Tabs for Vitals and History */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                  <Tab icon={<VitalIcon />} label="Vital Signs" />
                  <Tab icon={<HistoryIcon />} label="Medical History" />
                </Tabs>
              </Box>

              {/* Vital Signs Tab */}
              <TabPanel value={tabValue} index={0}>
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Blood Pressure</strong></TableCell>
                        <TableCell><strong>Heart Rate</strong></TableCell>
                        <TableCell><strong>Temperature</strong></TableCell>
                        <TableCell><strong>Weight</strong></TableCell>
                        <TableCell><strong>O2 Sat</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPatientVitals(selectedPatient.id).map((vital, index) => (
                        <TableRow key={index}>
                          <TableCell>{vital.date}</TableCell>
                          <TableCell>{vital.bloodPressure}</TableCell>
                          <TableCell>{vital.heartRate} bpm</TableCell>
                          <TableCell>{vital.temperature}</TableCell>
                          <TableCell>{vital.weight}</TableCell>
                          <TableCell>{vital.oxygenSaturation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Medical History Tab */}
              <TabPanel value={tabValue} index={1}>
                {getPatientHistory(selectedPatient.id).map((history, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {history.diagnosis}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {history.date}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {history.treatment}
                      </Typography>
                      <Chip label={history.doctor} size="small" />
                    </CardContent>
                  </Card>
                ))}
              </TabPanel>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePatientModal}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleClosePatientModal();
              if (selectedPatient) {
                handleCreatePrescription(selectedPatient.id);
              }
            }}
          >
            Create Prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Prescription Modal */}
      <Dialog 
        open={openPrescriptionModal} 
        onClose={handleClosePrescriptionModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Create Prescription for {selectedPatient?.name}
            </Typography>
            <IconButton onClick={handleClosePrescriptionModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Patient:</strong> {selectedPatient.name} | 
                  <strong> Age:</strong> {selectedPatient.age} | 
                  <strong> Allergies:</strong> {selectedPatient.allergies.join(', ') || 'None'}
                </Typography>
              </Alert>

              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Medications
              </Typography>

              {medicines.map((medicine, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Medicine Name"
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        placeholder="e.g., Paracetamol"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Dosage"
                        value={medicine.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Frequency"
                        value={medicine.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        placeholder="e.g., Twice daily"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Duration"
                        value={medicine.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      {medicines.length > 1 && (
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveMedicine(index)}
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              ))}

              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddMedicine}
                sx={{ mb: 3 }}
              >
                Add Another Medicine
              </Button>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Prescription Notes"
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                placeholder="Additional instructions, precautions, or notes..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrescriptionModal}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSavePrescription}
            disabled={medicines.some(m => !m.name || !m.dosage)}
          >
            Save Prescription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lab Test Request Dialog */}
      <Dialog open={openLabTestModal} onClose={handleCloseLabTestModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <LabIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Request Lab Test</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Patient:</strong> {selectedPatient.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Age:</strong> {selectedPatient.age} | <strong>Gender:</strong> {selectedPatient.gender}
                </Typography>
                {selectedPatient.allergies.length > 0 && (
                  <Typography variant="body2">
                    <strong>Allergies:</strong> {selectedPatient.allergies.join(', ')}
                  </Typography>
                )}
              </Alert>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Test Name</InputLabel>
                <Select
                  value={labTestRequest.testName}
                  label="Test Name"
                  onChange={(e) => setLabTestRequest({ ...labTestRequest, testName: e.target.value })}
                >
                  <MenuItem value="Complete Blood Count">Complete Blood Count (CBC)</MenuItem>
                  <MenuItem value="Lipid Profile">Lipid Profile</MenuItem>
                  <MenuItem value="Blood Sugar Test">Blood Sugar Test (Fasting/Random)</MenuItem>
                  <MenuItem value="Thyroid Function Test">Thyroid Function Test (TFT)</MenuItem>
                  <MenuItem value="Liver Function Test">Liver Function Test (LFT)</MenuItem>
                  <MenuItem value="Kidney Function Test">Kidney Function Test (KFT)</MenuItem>
                  <MenuItem value="Urine Analysis">Urine Analysis</MenuItem>
                  <MenuItem value="HbA1c Test">HbA1c Test</MenuItem>
                  <MenuItem value="Vitamin D Test">Vitamin D Test</MenuItem>
                  <MenuItem value="X-Ray">X-Ray</MenuItem>
                  <MenuItem value="ECG">ECG (Electrocardiogram)</MenuItem>
                  <MenuItem value="Ultrasound">Ultrasound</MenuItem>
                  <MenuItem value="CT Scan">CT Scan</MenuItem>
                  <MenuItem value="MRI Scan">MRI Scan</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={labTestRequest.priority}
                  label="Priority"
                  onChange={(e) => setLabTestRequest({ ...labTestRequest, priority: e.target.value })}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="stat">STAT (Immediate)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Clinical Notes / Reason for Test"
                value={labTestRequest.notes}
                onChange={(e) => setLabTestRequest({ ...labTestRequest, notes: e.target.value })}
                placeholder="Enter clinical reason, symptoms, or any additional information..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLabTestModal}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveLabTest}
            disabled={!labTestRequest.testName}
            startIcon={<LabIcon />}
          >
            Request Test
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorDashboard;
