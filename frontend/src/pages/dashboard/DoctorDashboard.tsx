import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table,
  TableBody, TableCell, TableContainer, TableRow, TableHead, Paper, Alert,
  IconButton, MenuItem, FormGroup, FormControlLabel, Checkbox, Tabs, Tab,
  Avatar, Stack, Badge, CircularProgress, List, ListItem, ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CalendarToday as CalendarIcon, Person as PersonIcon, Science as LabIcon,
  AccessTime as TimeIcon, Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon,
  Schedule as ScheduleIcon, Phone as PhoneIcon, CheckCircle as DoneIcon,
  History as HistoryIcon, Medication as MedIcon, Assignment as AssignIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import AvailabilityManager from '../../components/Doctor/AvailabilityManager';
import { axiosInstance } from '../../services/api';
import { useToast } from '../../components/common/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DoctorSlot {
  id: number;
  start_time: string;
  end_time: string;
  max_appointments: number;
  booked_count: number;
  checked_in_count: number;
  done_count: number;
}

interface QueueVisit {
  visit_id: number;
  patient_id: number;
  appointment_id: number;
  visit_status: 'WAITING' | 'IN_CONSULTATION' | 'DONE';
  doctor_notes: string | null;
  diagnosis: string | null;
  check_in_time: string;
  appointment_no: string;
  appointment_reason: string;
  appointment_time: string;
  slot_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  nic: string;
  date_of_birth: string | null;
  gender: string | null;
  vital_id: number | null;
  temperature: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  pulse: number | null;
  weight: number | null;
  sugar_level: number | null;
  vital_notes: string | null;
}

interface PatientHistory {
  visits: { id: number; slot_date: string; start_time: string; diagnosis: string | null; doctor_notes: string | null; doctor_name: string }[];
  prescriptions: { id: number; created_at: string; doctor_name: string; instructions: string | null; medicines_summary: string | null; status: string }[];
  labOrders: { id: number; created_at: string; doctor_name: string; tests: string | null; status: string }[];
}

interface Medicine { id: number; name: string; unit: string; }
interface LabTest { id: number; name: string; price: number; type: string; description: string | null; }
interface MedicineRow { medicine_id: number; dosage: string; duration_days: number; qty: number; note: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (t: string) => {
  if (!t) return '';
  try { return new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
  catch { return t; }
};
const calcAge = (dob: string | null) => {
  if (!dob) return 'N/A';
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};
const statusColor = (s: string): 'warning' | 'info' | 'success' | 'default' =>
  ({ WAITING: 'warning', IN_CONSULTATION: 'info', DONE: 'success' } as any)[s] ?? 'default';

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

// ═════════════════════════════════════════════════════════════════════════════
export default function DoctorDashboard() {
  const { showSuccess, showError } = useToast();

  // Date & slot selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);

  // Queue for selected slot
  const [queue, setQueue] = useState<QueueVisit[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Reference data
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);

  // Consultation modal
  const [selectedVisit, setSelectedVisit] = useState<QueueVisit | null>(null);
  const [consultTab, setConsultTab] = useState(0);
  const [saving, setSaving] = useState(false);

  // History
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Forms
  const [doctorNotes, setDoctorNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medRows, setMedRows] = useState<MedicineRow[]>([{ medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }]);
  const [prescInstructions, setPrescInstructions] = useState('');
  const [selectedTests, setSelectedTests] = useState<number[]>([]);

  // ── Fetch slots ─────────────────────────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    setQueue([]);
    try {
      const r = await axiosInstance.get(`/doctor/today-slots?date=${selectedDate}`);
      setSlots(r.data);
    } catch { showError('Failed to load slots'); }
    finally { setLoadingSlots(false); }
  }, [selectedDate]);

  // ── Fetch queue for slot ──────────────────────────────────────────────
  const fetchQueue = useCallback(async (slotId: number) => {
    setLoadingQueue(true);
    try {
      const r = await axiosInstance.get(`/doctor/queue?slot_id=${slotId}`);
      setQueue(r.data);
    } catch { showError('Failed to load patient queue'); }
    finally { setLoadingQueue(false); }
  }, []);

  // ── Ref data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetchSlots();
    axiosInstance.get('/doctor/medicines').then(r => setMedicines(r.data)).catch(() => { });
    axiosInstance.get('/doctor/lab-tests').then(r => setLabTests(r.data)).catch(() => { });
  }, [fetchSlots]);

  const handleSelectSlot = (slot: DoctorSlot) => {
    setSelectedSlot(slot);
    fetchQueue(slot.id);
  };

  // ── Open consultation ─────────────────────────────────────────────────
  const handleOpenConsultation = async (visit: QueueVisit) => {
    setSelectedVisit(visit);
    setConsultTab(0);
    setDoctorNotes(visit.doctor_notes || '');
    setDiagnosis(visit.diagnosis || '');
    setMedRows([{ medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }]);
    setPrescInstructions('');
    setSelectedTests([]);
    setHistory(null);
    // Fetch patient history
    setLoadingHistory(true);
    try {
      const r = await axiosInstance.get(`/doctor/patients/${visit.patient_id}/history`);
      setHistory(r.data);
    } catch { /* non-critical */ }
    finally { setLoadingHistory(false); }
  };

  const handleClose = () => setSelectedVisit(null);

  const refreshAll = () => {
    if (selectedSlot) fetchQueue(selectedSlot.id);
    fetchSlots();
  };

  // ── Save notes ───────────────────────────────────────────────────────
  const handleSaveNotes = async () => {
    if (!selectedVisit) return;
    setSaving(true);
    try {
      await axiosInstance.post(`/doctor/visits/${selectedVisit.visit_id}/consultation`, { doctor_notes: doctorNotes, diagnosis });
      showSuccess('Notes saved');
      refreshAll();
    } catch (e: any) { showError(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  // ── Save prescription ────────────────────────────────────────────────
  const handleSavePrescription = async () => {
    if (!selectedVisit) return;
    const valid = medRows.filter(m => m.medicine_id && m.dosage && m.qty > 0);
    if (!valid.length) { showError('Add at least one complete medicine'); return; }
    setSaving(true);
    try {
      await axiosInstance.post(`/doctor/visits/${selectedVisit.visit_id}/prescriptions`, { medicines: valid, instructions: prescInstructions });
      showSuccess('Prescription created');
      setMedRows([{ medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }]);
      setPrescInstructions('');
    } catch (e: any) { showError(e.response?.data?.message || 'Failed to save prescription'); }
    finally { setSaving(false); }
  };

  // ── Save lab order ───────────────────────────────────────────────────
  const handleSaveLabOrder = async () => {
    if (!selectedVisit) return;
    if (!selectedTests.length) { showError('Select at least one test'); return; }
    setSaving(true);
    try {
      await axiosInstance.post(`/doctor/visits/${selectedVisit.visit_id}/lab-orders`, { test_ids: selectedTests });
      showSuccess('Lab order submitted');
      setSelectedTests([]);
    } catch (e: any) { showError(e.response?.data?.message || 'Failed to submit lab order'); }
    finally { setSaving(false); }
  };

  // ── Complete visit ───────────────────────────────────────────────────
  const handleCompleteVisit = async () => {
    if (!selectedVisit) return;
    setSaving(true);
    try {
      await axiosInstance.put(`/doctor/visits/${selectedVisit.visit_id}/complete`);
      showSuccess('Visit completed');
      handleClose();
      refreshAll();
    } catch (e: any) { showError(e.response?.data?.message || 'Failed to complete visit'); }
    finally { setSaving(false); }
  };

  const updateMed = (i: number, f: keyof MedicineRow, v: string | number) => {
    const rows = [...medRows]; rows[i] = { ...rows[i], [f]: v }; setMedRows(rows);
  };

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Grid container spacing={3}>

          {/* ── LEFT: Date + Slots ─────────────────────────────────────── */}
          <Grid item xs={12} md={4} lg={3}>
            <Card elevation={3}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Select Date</Typography>
                <TextField
                  type="date" fullWidth size="small"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1} fontWeight={600}>
                  YOUR SLOTS
                </Typography>

                {loadingSlots ? (
                  <Box display="flex" justifyContent="center" py={4}><CircularProgress size={32} /></Box>
                ) : slots.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">No slots for this date</Typography>
                    <Button size="small" sx={{ mt: 1 }}
                      onClick={() => document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      Add Slots
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {slots.map(slot => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const hasPatients = slot.checked_in_count > 0;
                      return (
                        <Box key={slot.id}
                          onClick={() => handleSelectSlot(slot)}
                          sx={{
                            p: 1.5, borderRadius: 2, cursor: 'pointer',
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.50' : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
                          }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={700}>
                              {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                            </Typography>
                            {hasPatients && (
                              <Chip label={slot.checked_in_count} size="small" color="primary" />
                            )}
                          </Box>
                          <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                            <Chip label={`${slot.booked_count}/${slot.max_appointments} booked`} size="small" variant="outlined" />
                            {slot.done_count > 0 && <Chip label={`${slot.done_count} done`} size="small" color="success" variant="outlined" />}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ── RIGHT: Patient Queue ───────────────────────────────────── */}
          <Grid item xs={12} md={8} lg={9}>
            <Card elevation={3} sx={{ minHeight: 400 }}>
              <CardContent sx={{ p: 3 }}>
                {!selectedSlot ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                    <ScheduleIcon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Select a time slot</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Choose a slot on the left to view checked-in patients
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <IconButton size="small" onClick={() => { setSelectedSlot(null); setQueue([]); }}>
                          <BackIcon />
                        </IconButton>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {fmtTime(selectedSlot.start_time)} – {fmtTime(selectedSlot.end_time)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {queue.length} patient(s) checked in
                          </Typography>
                        </Box>
                      </Box>
                      <Button size="small" variant="outlined" onClick={() => fetchQueue(selectedSlot.id)}>
                        Refresh
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {loadingQueue ? (
                      <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                    ) : queue.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">No patients checked in yet</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Patients will appear here after receptionist check-in
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 700 }}>No.</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>NIC</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Vitals</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {queue.map((visit, i) => (
                              <TableRow key={visit.visit_id} hover>
                                <TableCell>
                                  <Badge badgeContent={i + 1} color="primary">
                                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: '0.9rem' }}>
                                      {visit.patient_name.charAt(0)}
                                    </Avatar>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>{visit.patient_name}</Typography>
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <PhoneIcon sx={{ fontSize: 12 }} />
                                    <Typography variant="caption" color="text.secondary">{visit.patient_phone}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{visit.nic || '—'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={visit.visit_status.replace('_', ' ')} size="small"
                                    color={statusColor(visit.visit_status)} />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={visit.vital_id ? 'Recorded' : 'Pending'}
                                    size="small"
                                    color={visit.vital_id ? 'success' : 'warning'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button size="small" variant="contained"
                                    onClick={() => handleOpenConsultation(visit)}>
                                    {visit.visit_status === 'IN_CONSULTATION' ? 'Continue' : 'Consult'}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── Availability Manager ───────────────────────────────────── */}
        <Box sx={{ mt: 4 }} id="availability-section">
          <Card elevation={2}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 4, py: 3, background: 'linear-gradient(to right, #f8f9fa, #e9ecef)', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <CalendarIcon sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>Manage Availability</Typography>
                    <Typography variant="body2" color="text.secondary">Configure your time slots for patient appointments</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ p: 4 }}><AvailabilityManager /></Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ══ Consultation Modal ════════════════════════════════════════════ */}
      <Dialog open={!!selectedVisit} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle component="div">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={700} component="div">{selectedVisit?.patient_name}</Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip label={`#${selectedVisit?.appointment_no}`} size="small" variant="outlined" />
                <Chip label={`Age: ${calcAge(selectedVisit?.date_of_birth ?? null)}`} size="small" variant="outlined" />
                {selectedVisit?.gender && <Chip label={selectedVisit.gender} size="small" variant="outlined" />}
                <Chip label={selectedVisit?.visit_status?.replace('_', ' ')} size="small" color={statusColor(selectedVisit?.visit_status ?? '')} />
              </Stack>
            </Box>
            <IconButton onClick={handleClose}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {selectedVisit && (
            <Box>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={consultTab} onChange={(_, v) => setConsultTab(v)}>
                  <Tab icon={<AssignIcon />} iconPosition="start" label="Overview" />
                  <Tab icon={<MedIcon />} iconPosition="start" label="Prescription" />
                  <Tab icon={<LabIcon />} iconPosition="start" label="Lab Tests" />
                  <Tab icon={<HistoryIcon />} iconPosition="start" label="History" />
                </Tabs>
              </Box>

              {/* ── Overview ─────────────────────────────────────────── */}
              <TabPanel value={consultTab} index={0}>
                <Grid container spacing={3}>
                  {/* Vitals */}
                  <Grid item xs={12} md={5}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Current Vitals</Typography>
                    {selectedVisit.vital_id ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableBody>
                            {[
                              ['Blood Pressure', selectedVisit.systolic_bp ? `${selectedVisit.systolic_bp}/${selectedVisit.diastolic_bp} mmHg` : '—'],
                              ['Pulse', selectedVisit.pulse ? `${selectedVisit.pulse} bpm` : '—'],
                              ['Temperature', selectedVisit.temperature ? `${selectedVisit.temperature}°C` : '—'],
                              ['Weight', selectedVisit.weight ? `${selectedVisit.weight} kg` : '—'],
                              ['Blood Sugar', selectedVisit.sugar_level ? `${selectedVisit.sugar_level} mg/dL` : '—'],
                            ].map(([label, value]) => (
                              <TableRow key={label}>
                                <TableCell sx={{ fontWeight: 600, width: 140 }}>{label}</TableCell>
                                <TableCell>{value}</TableCell>
                              </TableRow>
                            ))}
                            {selectedVisit.vital_notes && (
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                                <TableCell>{selectedVisit.vital_notes}</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info" sx={{ mb: 1 }}>Vitals not yet recorded by receptionist</Alert>
                    )}

                    {selectedVisit.appointment_reason && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2"><strong>Reason:</strong> {selectedVisit.appointment_reason}</Typography>
                      </Alert>
                    )}
                  </Grid>

                  {/* Notes & Diagnosis */}
                  <Grid item xs={12} md={7}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Doctor's Notes</Typography>
                    <TextField fullWidth multiline rows={4}
                      placeholder="Clinical observations, symptoms, examination findings..."
                      value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)} sx={{ mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>Diagnosis</Typography>
                    <TextField fullWidth multiline rows={3}
                      placeholder="Enter diagnosis..."
                      value={diagnosis} onChange={e => setDiagnosis(e.target.value)} sx={{ mb: 2 }} />
                    <Button variant="outlined" onClick={handleSaveNotes} disabled={saving}>
                      Save Notes & Diagnosis
                    </Button>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* ── Prescription ──────────────────────────────────────── */}
              <TabPanel value={consultTab} index={1}>
                <Typography variant="h6" fontWeight={600} mb={2}>Medications</Typography>
                {medRows.map((med, i) => (
                  <Card key={i} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth select label="Medicine" size="small"
                          value={med.medicine_id}
                          onChange={e => updateMed(i, 'medicine_id', Number(e.target.value))}>
                          <MenuItem value={0} disabled>Select medicine...</MenuItem>
                          {medicines.map(m => <MenuItem key={m.id} value={m.id}>{m.name} ({m.unit})</MenuItem>)}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Dosage" size="small"
                          value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)}
                          placeholder="e.g., Twice daily after meals" />
                      </Grid>
                      <Grid item xs={5} sm={1.5}>
                        <TextField fullWidth type="number" label="Days" size="small"
                          value={med.duration_days} onChange={e => updateMed(i, 'duration_days', Number(e.target.value))}
                          inputProps={{ min: 1 }} />
                      </Grid>
                      <Grid item xs={5} sm={1.5}>
                        <TextField fullWidth type="number" label="Qty" size="small"
                          value={med.qty} onChange={e => updateMed(i, 'qty', Number(e.target.value))}
                          inputProps={{ min: 1 }} />
                      </Grid>
                      <Grid item xs={2} sm={1}>
                        {medRows.length > 1 && (
                          <IconButton color="error" size="small"
                            onClick={() => setMedRows(medRows.filter((_, j) => j !== i))}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Note (optional)" size="small"
                          value={med.note} onChange={e => updateMed(i, 'note', e.target.value)} />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
                <Button startIcon={<AddIcon />} size="small"
                  onClick={() => setMedRows([...medRows, { medicine_id: 0, dosage: '', duration_days: 0, qty: 0, note: '' }])}
                  sx={{ mb: 2 }}>
                  Add Medicine
                </Button>
                <TextField fullWidth multiline rows={2} label="Prescription Instructions"
                  value={prescInstructions} onChange={e => setPrescInstructions(e.target.value)}
                  placeholder="General instructions..." sx={{ mb: 2 }} />
                <Button variant="contained" onClick={handleSavePrescription} disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <MedIcon />}>
                  Save Prescription
                </Button>
              </TabPanel>

              {/* ── Lab Tests ─────────────────────────────────────────── */}
              <TabPanel value={consultTab} index={2}>
                <Typography variant="h6" fontWeight={600} mb={2}>Request Lab Tests</Typography>
                {labTests.length === 0 ? <Alert severity="info">No lab tests configured</Alert> : (
                  <>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      {labTests.map(test => (
                        <Grid item xs={12} sm={6} key={test.id}>
                          <Box sx={{
                            border: '1px solid', borderColor: selectedTests.includes(test.id) ? 'primary.main' : 'divider',
                            borderRadius: 2, p: 1, cursor: 'pointer', bgcolor: selectedTests.includes(test.id) ? 'primary.50' : 'transparent',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: 'primary.main' },
                          }}
                            onClick={() => setSelectedTests(prev =>
                              prev.includes(test.id) ? prev.filter(id => id !== test.id) : [...prev, test.id]
                            )}>
                            <FormGroup>
                              <FormControlLabel
                                control={<Checkbox checked={selectedTests.includes(test.id)} size="small" />}
                                label={
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>{test.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {test.type} — Rs. {Number(test.price).toLocaleString()}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </FormGroup>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Button variant="contained" color="secondary" onClick={handleSaveLabOrder}
                      disabled={saving || !selectedTests.length}
                      startIcon={<LabIcon />}>
                      Submit Lab Order ({selectedTests.length} selected)
                    </Button>
                  </>
                )}
              </TabPanel>

              {/* ── History ───────────────────────────────────────────── */}
              <TabPanel value={consultTab} index={3}>
                {loadingHistory ? (
                  <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                ) : !history ? (
                  <Alert severity="info">No history available</Alert>
                ) : (
                  <Grid container spacing={3}>
                    {/* Past Visits */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" fontWeight={600} mb={1}> Past Visits</Typography>
                      {history.visits.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No past visits</Typography>
                      ) : (
                        <List dense disablePadding>
                          {history.visits.map(v => (
                            <ListItem key={v.id} disableGutters sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                              <ListItemText
                                primary={<Typography variant="body2" fontWeight={600}>{v.slot_date} {v.start_time && `@ ${fmtTime(v.start_time)}`}</Typography>}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">{v.doctor_name}</Typography>
                                    {v.diagnosis && <Typography variant="caption" display="block">Dx: {v.diagnosis}</Typography>}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Grid>

                    {/* Past Prescriptions */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" fontWeight={600} mb={1}>Past Prescriptions</Typography>
                      {history.prescriptions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No prescriptions</Typography>
                      ) : (
                        <List dense disablePadding>
                          {history.prescriptions.map(p => (
                            <ListItem key={p.id} disableGutters sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                              <ListItemText
                                primary={<Typography variant="body2" fontWeight={600}>{new Date(p.created_at).toLocaleDateString()}</Typography>}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">{p.doctor_name}</Typography>
                                    {p.medicines_summary && <Typography variant="caption" display="block">{p.medicines_summary}</Typography>}
                                  </Box>
                                }
                              />
                              <Chip label={p.status} size="small" color={p.status === 'DISPENSED' ? 'success' : 'default'} />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Grid>

                    {/* Past Lab Orders */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="h6" fontWeight={600} mb={1}>Past Lab Orders</Typography>
                      {history.labOrders.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No lab orders</Typography>
                      ) : (
                        <List dense disablePadding>
                          {history.labOrders.map(lo => (
                            <ListItem key={lo.id} disableGutters sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                              <ListItemText
                                primary={<Typography variant="body2" fontWeight={600}>{new Date(lo.created_at).toLocaleDateString()}</Typography>}
                                secondary={
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">{lo.doctor_name}</Typography>
                                    {lo.tests && <Typography variant="caption" display="block">{lo.tests}</Typography>}
                                  </Box>
                                }
                              />
                              <Chip label={lo.status} size="small" color={lo.status === 'COMPLETED' ? 'success' : 'warning'} />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Grid>
                  </Grid>
                )}
              </TabPanel>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} disabled={saving}>Close</Button>
          <Button variant="contained" color="success" startIcon={<DoneIcon />}
            onClick={handleCompleteVisit} disabled={saving}>
            {saving ? 'Saving...' : 'Complete Visit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
