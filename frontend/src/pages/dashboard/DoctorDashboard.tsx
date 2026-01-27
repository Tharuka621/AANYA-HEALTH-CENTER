
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
  TableRow,
  Paper,
  Alert,
  IconButton,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Badge,
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
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material';
import AvailabilityManager from '../../components/Doctor/AvailabilityManager';
import { VisitWithDetails } from '../../types/doctor';
import { getVisitsWithDetails, getPatientWithUser, mockLabTests } from '../../mock/doctorMock';
import { visitStatusLabels, visitStatusColors, formatTime, formatBloodPressure, calculateAge } from '../../utils/doctorUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface MedicineForm {
  medicine_id: number;
  dosage: string;
  duration_days: number;
  qty: number;
  note: string;
}

interface LabTestForm {
  test_ids: number[];
  notes: string;
}

const DoctorDashboard: React.FC = () => {
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [consultationTab, setConsultationTab] = useState(0);
  const [selectedVisit, setSelectedVisit] = useState<VisitWithDetails | null>(null);
  const [medicines, setMedicines] = useState<MedicineForm[]>([{ medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [labTestForm, setLabTestForm] = useState<LabTestForm>({
    test_ids: [],
    notes: '',
  });

  // Get today's visits (source of truth for "Today's Patients")
  const todayVisits = getVisitsWithDetails();

  const handleOpenConsultation = (visitId: string) => {
    const visit = todayVisits.find(v => v.id === visitId);
    if (visit) {
      setSelectedVisit(visit);
      setOpenConsultationModal(true);
      setConsultationTab(0); // Start with Overview tab
    }
  };

  const handleCloseConsultation = () => {
    setOpenConsultationModal(false);
    setSelectedVisit(null);
    setConsultationTab(0);
    setMedicines([{ medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }]);
    setPrescriptionNotes('');
    setLabTestForm({ test_ids: [], notes: '' });
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    const newMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(newMedicines);
  };

  const handleMedicineChange = (index: number, field: keyof MedicineForm, value: string | number) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value as never;
    setMedicines(newMedicines);
  };

  const handleSavePrescription = () => {
    console.log('Saving prescription for visit:', selectedVisit?.id);
    console.log('Medicines:', medicines);
    console.log('Instructions:', prescriptionNotes);
    alert('Prescription created successfully!');
    setMedicines([{ medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }]);
    setPrescriptionNotes('');
  };

  const handleSaveLabTest = () => {
    console.log('Requesting lab tests for visit:', selectedVisit?.id);
    console.log('Test IDs:', labTestForm.test_ids);
    console.log('Notes:', labTestForm.notes);
    alert('Lab test request created successfully!');
    setLabTestForm({ test_ids: [], notes: '' });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Today's Patients Queue */}
          <Grid item xs={12} lg={8}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <ScheduleIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        Patient Queue
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {todayVisits.length} patients waiting
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={`${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                    color="primary"
                    icon={<CalendarIcon />}
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <List sx={{ p: 0 }}>
                  {todayVisits.map((visit, index) => (
                    <React.Fragment key={visit.id}>
                      <ListItem
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          transition: 'all 0.3s',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            transform: 'translateX(4px)',
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Badge 
                            badgeContent={index + 1} 
                            color="primary"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                minWidth: 24,
                                height: 24
                              }
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                width: 50, 
                                height: 50,
                                bgcolor: 'secondary.main',
                                fontSize: '1.2rem',
                                fontWeight: 600
                              }}
                            >
                              {visit.patient_name.charAt(0)}
                            </Avatar>
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          sx={{ ml: 2 }}
                          primary={
                            <Box>
                              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                                {visit.patient_name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Chip
                                  label={visitStatusLabels[visit.status]}
                                  size="small"
                                  color={visitStatusColors[visit.status]}
                                />
                                <Chip
                                  label={`Appt #${visit.appointment_id}`}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  icon={<TimeIcon />}
                                  label={formatTime(visit.appointment_time)}
                                  size="small"
                                  variant="outlined"
                                />
                              </Stack>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <PhoneIcon sx={{ fontSize: 14 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {visit.patient_phone}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  • {visit.appointment_reason}
                                </Typography>
                              </Stack>
                            </Box>
                          }
                        />
                        <Box>
                          <Button
                            size="medium"
                            variant="contained"
                            onClick={() => handleOpenConsultation(visit.id)}
                            sx={{ 
                              minWidth: 160,
                              fontWeight: 600,
                              boxShadow: 2,
                              '&:hover': {
                                boxShadow: 4
                              }
                            }}
                          >
                            Start Consultation
                          </Button>
                        </Box>
                      </ListItem>
                      {index < todayVisits.length - 1 && <Divider variant="middle" />}
                    </React.Fragment>
                  ))}
                  
                  {todayVisits.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No patients in queue
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You're all caught up for today!
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                    Quick Actions
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1.5}>
                    <Button
                      variant="contained"
                      startIcon={<PersonIcon />}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        justifyContent: 'flex-start'
                      }}
                    >
                      View All Patients
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        justifyContent: 'flex-start'
                      }}
                    >
                      Appointments
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<LabIcon />}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        justifyContent: 'flex-start'
                      }}
                    >
                      Lab Tests
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<HospitalIcon />}
                      fullWidth
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        justifyContent: 'flex-start'
                      }}
                    >
                      Medical History
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      fullWidth
                      onClick={() => {
                        document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        justifyContent: 'flex-start'
                      }}
                    >
                      Manage Availability
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Today's Schedule Overview */}
              <Card elevation={3} sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Today's Schedule
                  </Typography>
                  <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
                  
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total Appointments</Typography>
                      <Typography variant="body1" fontWeight={700}>15</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Completed</Typography>
                      <Typography variant="body1" fontWeight={700}>8</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">In Queue</Typography>
                      <Typography variant="body1" fontWeight={700}>{todayVisits.length}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Remaining</Typography>
                      <Typography variant="body1" fontWeight={700}>5</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card elevation={3}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    This Week
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="text.secondary">Patients</Typography>
                        <Typography variant="body2" fontWeight={600}>47</Typography>
                      </Box>
                      <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box sx={{ width: '78%', height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
                      </Box>
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="text.secondary">Prescriptions</Typography>
                        <Typography variant="body2" fontWeight={600}>52</Typography>
                      </Box>
                      <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box sx={{ width: '86%', height: '100%', bgcolor: 'success.main', borderRadius: 1 }} />
                      </Box>
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="text.secondary">Lab Orders</Typography>
                        <Typography variant="body2" fontWeight={600}>23</Typography>
                      </Box>
                      <Box sx={{ height: 6, bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box sx={{ width: '61%', height: '100%', bgcolor: 'warning.main', borderRadius: 1 }} />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Availability Manager Section */}
        <Box sx={{ mt: 4 }} id="availability-section">
          <Card elevation={2}>
            <CardContent sx={{ p: 0 }}>
              {/* Header */}
              <Box 
                sx={{ 
                  px: 4, 
                  py: 3, 
                  background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        <CalendarIcon sx={{ fontSize: 28 }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 0.5 }}>
                          Manage Availability
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Configure your time slots for patient appointments
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Content */}
              <Box sx={{ p: 4 }}>
                <AvailabilityManager />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Consultation Modal with Tabs */}
      <Dialog 
        open={openConsultationModal} 
        onClose={handleCloseConsultation}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={600}>
              Consultation: {selectedVisit?.patient_name}
            </Typography>
            <IconButton onClick={handleCloseConsultation}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedVisit && (() => {
            const patient = getPatientWithUser(selectedVisit.patient_id);
            const vitals = selectedVisit.vitals;
            
            return (
              <Box>
                {/* Patient Summary Header */}
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Age:</strong> {patient ? calculateAge(patient.date_of_birth) : 'N/A'} | 
                        <strong> Gender:</strong> {patient?.gender || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedVisit.patient_phone} | 
                        <strong> NIC:</strong> {patient?.nic || 'N/A'}
                      </Typography>
                    </Grid>
                    {patient?.allergies && (
                      <Grid item xs={12}>
                        <Box display="flex" gap={1} alignItems="center">
                          <Typography variant="body2"><strong>Allergies:</strong></Typography>
                          {patient.allergies.split(',').map((allergy, idx) => (
                            <Chip key={idx} label={allergy.trim()} size="small" color="error" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Alert>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={consultationTab} onChange={(_, newValue) => setConsultationTab(newValue)}>
                    <Tab label="Overview" />
                    <Tab label="Prescription" />
                    <Tab label="Lab Tests" />
                    <Tab label="History" />
                  </Tabs>
                </Box>

                {/* Overview Tab */}
                <TabPanel value={consultationTab} index={0}>
                  <Grid container spacing={3}>
                    {/* Vitals */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Current Vitals
                      </Typography>
                      {vitals ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell><strong>Blood Pressure</strong></TableCell>
                                <TableCell>{formatBloodPressure(vitals.systolic_bp, vitals.diastolic_bp)} mmHg</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Pulse</strong></TableCell>
                                <TableCell>{vitals.pulse || 'N/A'} bpm</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Temperature</strong></TableCell>
                                <TableCell>{vitals.temperature || 'N/A'}°C</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Weight</strong></TableCell>
                                <TableCell>{vitals.weight || 'N/A'} kg</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Blood Sugar</strong></TableCell>
                                <TableCell>{vitals.sugar_level || 'N/A'} mg/dL</TableCell>
                              </TableRow>
                              {vitals.notes && (
                                <TableRow>
                                  <TableCell><strong>Notes</strong></TableCell>
                                  <TableCell>{vitals.notes}</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Alert severity="info">No vitals recorded for this visit yet</Alert>
                      )}
                    </Grid>

                    {/* Doctor Notes & Diagnosis */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Doctor's Notes
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter clinical observations, symptoms, examination findings..."
                        defaultValue={selectedVisit.doctor_notes || ''}
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Diagnosis
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter diagnosis..."
                        defaultValue={selectedVisit.diagnosis || ''}
                      />
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Prescription Tab */}
                <TabPanel value={consultationTab} index={1}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Medications
                  </Typography>

                  {medicines.map((medicine, index) => (
                    <Card key={index} sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            select
                            label="Medicine"
                            value={medicine.medicine_id}
                            onChange={(e) => handleMedicineChange(index, 'medicine_id', Number(e.target.value))}
                            required
                          >
                            <MenuItem value={1}>Paracetamol 500mg</MenuItem>
                            <MenuItem value={2}>Amoxicillin 250mg</MenuItem>
                            <MenuItem value={3}>Cetirizine 10mg</MenuItem>
                            <MenuItem value={4}>Metformin 500mg</MenuItem>
                            <MenuItem value={5}>Omeprazole 20mg</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Dosage"
                            value={medicine.dosage}
                            onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                            placeholder="e.g., Twice daily after meals"
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Duration (days)"
                            value={medicine.duration_days}
                            onChange={(e) => handleMedicineChange(index, 'duration_days', Number(e.target.value))}
                            placeholder="7"
                            required
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Quantity"
                            value={medicine.qty}
                            onChange={(e) => handleMedicineChange(index, 'qty', Number(e.target.value))}
                            placeholder="14"
                            required
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
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
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Additional Notes (Optional)"
                            value={medicine.note || ''}
                            onChange={(e) => handleMedicineChange(index, 'note', e.target.value)}
                            placeholder="Special instructions for this medication"
                            size="small"
                          />
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
                    rows={3}
                    label="Prescription Instructions"
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    placeholder="General prescription instructions, precautions, or notes..."
                  />

                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={handleSavePrescription}
                      disabled={medicines.some(m => !m.medicine_id || !m.dosage || !m.duration_days || !m.qty)}
                    >
                      Save Prescription
                    </Button>
                  </Box>
                </TabPanel>

                {/* Lab Tests Tab */}
                <TabPanel value={consultationTab} index={2}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Request Lab Tests
                  </Typography>

                  <FormGroup sx={{ mb: 3 }}>
                    {mockLabTests.map((test) => (
                      <FormControlLabel
                        key={test.id}
                        control={
                          <Checkbox
                            checked={labTestForm.test_ids.includes(test.id)}
                            onChange={(e) => {
                              const newTestIds = e.target.checked
                                ? [...labTestForm.test_ids, test.id]
                                : labTestForm.test_ids.filter(id => id !== test.id);
                              setLabTestForm({ ...labTestForm, test_ids: newTestIds });
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{test.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {test.type} - Rs. {test.price}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Clinical Notes / Reason for Tests"
                    value={labTestForm.notes}
                    onChange={(e) => setLabTestForm({ ...labTestForm, notes: e.target.value })}
                    placeholder="Enter clinical reason, symptoms, or any additional information..."
                  />

                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={handleSaveLabTest}
                      disabled={labTestForm.test_ids.length === 0}
                      startIcon={<LabIcon />}
                    >
                      Request Tests ({labTestForm.test_ids.length})
                    </Button>
                  </Box>
                </TabPanel>

                {/* History Tab */}
                <TabPanel value={consultationTab} index={3}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Patient Medical History
                  </Typography>
                  <Alert severity="info">
                    Previous consultations, prescriptions, and lab results will be displayed here.
                  </Alert>
                  {/* Future: Show previous visits, prescriptions, lab results */}
                </TabPanel>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConsultation}>Close Consultation</Button>
          <Button variant="contained" onClick={() => {
            console.log('Complete visit:', selectedVisit?.id);
            alert('Visit completed successfully!');
            handleCloseConsultation();
          }}>
            Complete Visit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorDashboard;
