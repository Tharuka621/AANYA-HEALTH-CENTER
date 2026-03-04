import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Container, Typography, Card, CardContent, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Table,
  TableBody, TableCell, TableContainer, TableRow, TableHead, Paper, Alert,
  IconButton, MenuItem, FormGroup, FormControlLabel, Checkbox, Tabs, Tab,
  Avatar, Stack, Badge, CircularProgress, List, ListItem, ListItemText,
  LinearProgress, Tooltip, Fade, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import Grid from '@mui/material/Grid';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Science as LabIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  CheckCircle as DoneIcon,
  History as HistoryIcon,
  Medication as MedIcon,
  Assignment as AssignIcon,
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  LocalHospital as HospitalIcon,
  PlayArrow as StartIcon,
  TrendingUp as StatsIcon,
  Wc as GenderIcon,
  Cake as AgeIcon,
  Fingerprint as NicIcon,
  Email as EmailIcon,
  Bloodtype as BloodIcon,
  Thermostat as TempIcon,
  MonitorHeart as BPIcon,
  FitnessCenter as WeightIcon,
} from '@mui/icons-material';
import AvailabilityManager from '../../components/Doctor/AvailabilityManager';
import { axiosInstance } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../contexts/AuthContext';

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

interface DoctorStats {
  total_appointments: number;
  completed: number;
  in_queue: number;
  not_checked_in: number;
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
  slot_end_time: string;
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

const statusLabel = (s: string) =>
  ({ WAITING: 'Waiting', IN_CONSULTATION: 'In Consultation', DONE: 'Done' } as any)[s] ?? s;

function TabPanel({ children, value, index }: { children?: React.ReactNode; value: number; index: number }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon }: { label: string; value: number | string; color: string; icon: any }) {
  return (
    <Card elevation={2} sx={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      borderRadius: 3, height: '100%',
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color, mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon sx={{ color, fontSize: 28 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function DoctorDashboard() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  // Date & slot selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<DoctorSlot | null>(null);
  const [stats, setStats] = useState<DoctorStats | null>(null);

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
  const [medRows, setMedRows] = useState<MedicineRow[]>([{ medicine_id: 0, dosage: '', duration_days: 7, qty: 1, note: '' }]);
  const [prescInstructions, setPrescInstructions] = useState('');
  const [selectedTests, setSelectedTests] = useState<number[]>([]);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Today's full queue + availability dialog
  const [mainTab, setMainTab] = useState(0);
  const [availDialogOpen, setAvailDialogOpen] = useState(false);
  const [todayQueue, setTodayQueue] = useState<QueueVisit[]>([]);
  const [loadingTodayQueue, setLoadingTodayQueue] = useState(true);

  // ── Fetch slots ─────────────────────────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const r = await axiosInstance.get(`/doctor/today-slots?date=${selectedDate}`);
      setSlots(r.data);
    } catch { showError('Failed to load slots'); }
    finally { setLoadingSlots(false); }
  }, [selectedDate]);

  // ── Fetch stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const r = await axiosInstance.get('/doctor/stats');
      setStats(r.data);
    } catch { /* non-critical */ }
  }, []);

  // ── Fetch all today's checked-in patients ─────────────────────────────
  const fetchTodayQueue = useCallback(async () => {
    setLoadingTodayQueue(true);
    try {
      const r = await axiosInstance.get('/doctor/today-queue');
      setTodayQueue(r.data);
    } catch { /* non-critical */ }
    finally { setLoadingTodayQueue(false); }
  }, []);

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
    fetchStats();
    fetchTodayQueue();
    axiosInstance.get('/doctor/medicines').then(r => setMedicines(r.data)).catch(() => { });
    axiosInstance.get('/doctor/lab-tests').then(r => setLabTests(r.data)).catch(() => { });
  }, [fetchSlots, fetchStats, fetchTodayQueue]);

  // ── Auto-refresh logic ────────────────────────────────────────────────
  useEffect(() => {
    if (autoRefresh && selectedSlot) {
      refreshTimerRef.current = setInterval(() => {
        fetchQueue(selectedSlot.id);
        fetchSlots();
        fetchStats();
      }, 30000); // every 30s
    }
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefresh, selectedSlot, fetchQueue, fetchSlots, fetchStats]);

  const handleSelectSlot = (slot: DoctorSlot) => {
    setSelectedSlot(slot);
    fetchQueue(slot.id);
  };

  // ── Open consultation ─────────────────────────────────────────────────
  const handleOpenConsultation = async (visit: QueueVisit) => {
    // Auto-start consultation (WAITING → IN_CONSULTATION)
    if (visit.visit_status === 'WAITING') {
      try {
        await axiosInstance.post(`/doctor/visits/${visit.visit_id}/start`);
        visit = { ...visit, visit_status: 'IN_CONSULTATION' };
      } catch { /* ignore – non-critical */ }
    }

    setSelectedVisit(visit);
    setConsultTab(0);
    setDoctorNotes(visit.doctor_notes || '');
    setDiagnosis(visit.diagnosis || '');
    setMedRows([{ medicine_id: 0, dosage: '', duration_days: 7, qty: 1, note: '' }]);
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

    // Refresh queue & stats
    if (selectedSlot) fetchQueue(selectedSlot.id);
    fetchStats();
  };

  const handleClose = () => {
    setSelectedVisit(null);
    if (selectedSlot) fetchQueue(selectedSlot.id);
    fetchSlots();
    fetchStats();
    fetchTodayQueue();
  };

  const refreshAll = () => {
    if (selectedSlot) fetchQueue(selectedSlot.id);
    fetchSlots();
    fetchStats();
    fetchTodayQueue();
  };

  // ── Save notes ───────────────────────────────────────────────────────
  const handleSaveNotes = async () => {
    if (!selectedVisit) return;
    setSaving(true);
    try {
      await axiosInstance.post(`/doctor/visits/${selectedVisit.visit_id}/consultation`, { doctor_notes: doctorNotes, diagnosis });
      showSuccess('Notes & diagnosis saved');
      // Update local state
      setSelectedVisit(prev => prev ? { ...prev, doctor_notes: doctorNotes, diagnosis, visit_status: 'IN_CONSULTATION' } : prev);
    } catch (e: any) { showError(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  // ── Save prescription ────────────────────────────────────────────────
  const handleSavePrescription = async () => {
    if (!selectedVisit) return;
    const valid = medRows.filter(m => m.medicine_id && m.dosage && m.qty > 0);
    if (!valid.length) { showError('Add at least one complete medicine row'); return; }
    setSaving(true);
    try {
      await axiosInstance.post(`/doctor/visits/${selectedVisit.visit_id}/prescriptions`, { medicines: valid, instructions: prescInstructions });
      showSuccess('Prescription created');
      setMedRows([{ medicine_id: 0, dosage: '', duration_days: 7, qty: 1, note: '' }]);
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
      showSuccess('Visit completed successfully');
      handleClose();
    } catch (e: any) { showError(e.response?.data?.message || 'Failed to complete visit'); }
    finally { setSaving(false); }
  };

  const updateMed = (i: number, f: keyof MedicineRow, v: string | number) => {
    const rows = [...medRows]; rows[i] = { ...rows[i], [f]: v }; setMedRows(rows);
  };

  // ── Derived stats from queue ──────────────────────────────────────────
  const queueStats = {
    waiting: queue.filter(v => v.visit_status === 'WAITING').length,
    inConsult: queue.filter(v => v.visit_status === 'IN_CONSULTATION').length,
    done: queue.filter(v => v.visit_status === 'DONE').length,
  };

  // ═══════════════════════════════════════════════════════════════════════
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
        color: 'white', px: 4, py: 3,
        boxShadow: '0 4px 20px rgba(26,35,126,0.4)',
      }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 52, height: 52, fontSize: '1.5rem' }}>
                <HospitalIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} letterSpacing={-0.5}>
                  Doctor Dashboard
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {user?.full_name ? `Welcome, ${user.full_name}` : 'AANYA Health Center'} •{' '}
                  {new Date().toLocaleDateString('en-GB')}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1.5} alignItems="center">
              <Button
                variant="outlined" size="small"
                onClick={() => setAvailDialogOpen(true)}
                startIcon={<CalendarIcon />}
                sx={{ borderColor: 'white', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'white' }, fontSize: '0.75rem' }}
              >
                Manage Availability
              </Button>
              <Tooltip title={`Auto-refresh ${autoRefresh ? 'on (every 30s)' : 'off'}`}>
                <Button
                  variant={autoRefresh ? 'contained' : 'outlined'} size="small"
                  onClick={() => setAutoRefresh(p => !p)}
                  sx={{ borderColor: 'white', color: 'white', bgcolor: autoRefresh ? 'rgba(255,255,255,0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', borderColor: 'white' }, fontSize: '0.75rem' }}
                  startIcon={<RefreshIcon />}
                >
                  {autoRefresh ? 'Auto ON' : 'Auto OFF'}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Today's Stats ──────────────────────────────────────────────── */}
      {stats && (
        <Box sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', py: 2.5, px: 4 }}>
          <Container maxWidth="xl">
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <StatCard label="Today's Appointments" value={stats.total_appointments} color="#1a237e" icon={CalendarIcon} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="In Queue" value={stats.in_queue} color="#e65100" icon={ScheduleIcon} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="Completed" value={stats.completed} color="#2e7d32" icon={DoneIcon} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard label="Not Checked In" value={stats.not_checked_in} color="#6a1b9a" icon={PersonIcon} />
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ py: 3 }}>

        {/* ── View Tabs ──────────────────────────────────────────────────── */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0, bgcolor: 'white', borderRadius: '12px 12px 0 0', px: 2, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} sx={{ '& .MuiTab-root': { fontWeight: 700 } }}>
            <Tab icon={<PersonIcon />} iconPosition="start"
              label={todayQueue.length
                ? `Today's Queue (${todayQueue.filter(v => v.visit_status !== 'DONE').length} active / ${todayQueue.length} total)`
                : "Today's Queue"} />
            <Tab icon={<CalendarIcon />} iconPosition="start" label="By Slot" />
          </Tabs>
        </Box>

        {/* ── Tab 0 : Today's Queue ──────────────────────────────────────── */}
        {mainTab === 0 && (
          <Card elevation={0} sx={{ borderRadius: '0 0 12px 12px', border: '1px solid', borderColor: 'divider', borderTop: 'none' }}>
            <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>All Checked-In Patients</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date().toLocaleDateString('en-GB')}
                </Typography>
              </Box>
              <IconButton size="small" onClick={fetchTodayQueue} sx={{ color: 'primary.main' }}><RefreshIcon /></IconButton>
            </Box>
            {loadingTodayQueue ? (
              <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
            ) : todayQueue.length === 0 ? (
              <Box textAlign="center" py={12}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No patients checked in today</Typography>
                <Typography variant="body2" color="text.disabled" mb={3}>
                  Patients appear here after the receptionist checks them in
                </Typography>
                <Button startIcon={<RefreshIcon />} variant="outlined" onClick={fetchTodayQueue}>Refresh</Button>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      {['#', 'Patient', 'Slot Time', 'Check-In', 'Status', 'Vitals', 'Action'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayQueue.map((visit, i) => (
                      <TableRow key={visit.visit_id} hover
                        sx={{ opacity: visit.visit_status === 'DONE' ? 0.6 : 1, bgcolor: visit.visit_status === 'IN_CONSULTATION' ? 'info.50' : 'inherit' }}>
                        <TableCell><Typography variant="body2" color="text.secondary" fontWeight={600}>{i + 1}</Typography></TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700, bgcolor: visit.visit_status === 'DONE' ? 'success.light' : visit.visit_status === 'IN_CONSULTATION' ? 'info.main' : 'warning.main' }}>
                              {visit.patient_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{visit.patient_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{visit.patient_phone}</Typography>
                              {visit.gender && <Typography variant="caption" color="text.disabled" display="block">{visit.gender} • Age {calcAge(visit.date_of_birth)}</Typography>}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={fmtTime(visit.appointment_time)} size="small" variant="outlined" sx={{ fontSize: '0.72rem', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {visit.check_in_time ? new Date(visit.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={statusLabel(visit.visit_status)} size="small" color={statusColor(visit.visit_status)} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={visit.vital_id ? '✓ Recorded' : '⏳ Pending'} size="small" color={visit.vital_id ? 'success' : 'warning'} variant="outlined" sx={{ fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell>
                          {visit.visit_status === 'DONE' ? (
                            <Chip label="Completed" size="small" color="success" icon={<DoneIcon />} />
                          ) : (
                            <Button size="small" variant="contained" color={visit.visit_status === 'IN_CONSULTATION' ? 'info' : 'primary'}
                              onClick={() => handleOpenConsultation(visit)}
                              startIcon={visit.visit_status === 'WAITING' ? <StartIcon /> : <AssignIcon />}
                              sx={{ fontSize: '0.75rem', py: 0.5 }}>
                              {visit.visit_status === 'IN_CONSULTATION' ? 'Continue' : 'Start'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        )}

        {/* ── Tab 1 : By Slot ────────────────────────────────────────────── */}
        {mainTab === 1 && (
          <Grid container spacing={3} sx={{ mt: 0 }}>

            {/* LEFT: Date + Slots */}
            <Grid item xs={12} md={4} lg={3}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ bgcolor: '#f0f4ff', p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.dark" gutterBottom>📅 SELECT DATE</Typography>
                  <DatePicker
                    format="dd/MM/yyyy"
                    value={selectedDate ? parseISO(selectedDate) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        setSelectedDate(format(newValue, 'yyyy-MM-dd'));
                        setSelectedSlot(null);
                        setQueue([]);
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        sx: { '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2, '&:hover fieldset': { borderColor: 'primary.main' } } }
                      }
                    }}
                  />
                </Box>
                <Box sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>YOUR SLOTS</Typography>
                    <IconButton size="small" onClick={fetchSlots} sx={{ color: 'primary.main' }}><RefreshIcon fontSize="small" /></IconButton>
                  </Box>
                  {loadingSlots ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress size={32} /></Box>
                  ) : slots.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>No slots for this date</Typography>
                      <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setAvailDialogOpen(true)}>Add Slots</Button>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {slots.map(slot => {
                        const isSelected = selectedSlot?.id === slot.id;
                        const waiting = slot.checked_in_count - slot.done_count;
                        return (
                          <Box key={slot.id} onClick={() => handleSelectSlot(slot)} sx={{
                            p: 2, borderRadius: 2, cursor: 'pointer', border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'primary.50' : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50', transform: 'translateX(2px)' },
                          }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center" gap={1}>
                                <TimeIcon sx={{ fontSize: 16, color: isSelected ? 'primary.main' : 'text.secondary' }} />
                                <Typography variant="body2" fontWeight={700} color={isSelected ? 'primary.main' : 'text.primary'}>{fmtTime(slot.start_time)}</Typography>
                              </Box>
                              {slot.checked_in_count > 0 && <Chip label={`${slot.checked_in_count} in`} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />}
                            </Box>
                            <Typography variant="caption" color="text.secondary">until {fmtTime(slot.end_time)}</Typography>
                            <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                              <Chip label={`${slot.booked_count}/${slot.max_appointments} booked`} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
                              {slot.done_count > 0 && <Chip label={`${slot.done_count} done`} size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />}
                              {waiting > 0 && <Chip label={`${waiting} waiting`} size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />}
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* RIGHT: Patient Queue for selected slot */}
            <Grid item xs={12} md={8} lg={9}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 450 }}>
                {!selectedSlot ? (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={12}>
                    <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #e8eaf6, #c5cae9)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                      <ScheduleIcon sx={{ fontSize: 50, color: '#5c6bc0' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="text.secondary" gutterBottom>Select a time slot</Typography>
                    <Typography variant="body2" color="text.disabled">Choose a slot on the left to view your patient queue</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)', color: 'white', px: 3, py: 2.5, borderRadius: '12px 12px 0 0' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                            onClick={() => { setSelectedSlot(null); setQueue([]); }}><BackIcon /></IconButton>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>{fmtTime(selectedSlot.start_time)} – {fmtTime(selectedSlot.end_time)}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{queue.length} patient{queue.length !== 1 ? 's' : ''} in queue</Typography>
                          </Box>
                        </Box>
                        <Box display="flex" gap={1} alignItems="center">
                          <Stack direction="row" spacing={1}>
                            <Chip label={`${queueStats.waiting} waiting`} size="small" sx={{ bgcolor: 'rgba(255,183,77,0.3)', color: '#ffe082', fontWeight: 700 }} />
                            <Chip label={`${queueStats.inConsult} consulting`} size="small" sx={{ bgcolor: 'rgba(100,181,246,0.3)', color: '#bbdefb', fontWeight: 700 }} />
                            <Chip label={`${queueStats.done} done`} size="small" sx={{ bgcolor: 'rgba(129,199,132,0.3)', color: '#c8e6c9', fontWeight: 700 }} />
                          </Stack>
                          <IconButton size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }} onClick={() => fetchQueue(selectedSlot.id)}><RefreshIcon /></IconButton>
                        </Box>
                      </Box>
                    </Box>
                    {loadingQueue ? (
                      <Box><LinearProgress /><Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box></Box>
                    ) : queue.length === 0 ? (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={10}>
                        <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">No patients checked in yet</Typography>
                        <Typography variant="body2" color="text.disabled">Patients appear here after receptionist check-in</Typography>
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              {['#', 'Patient', 'NIC', 'Check-in', 'Status', 'Vitals', 'Action'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: 'text.secondary' }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {queue.map((visit, i) => (
                              <TableRow key={visit.visit_id} hover sx={{ opacity: visit.visit_status === 'DONE' ? 0.6 : 1, bgcolor: visit.visit_status === 'IN_CONSULTATION' ? 'info.50' : 'inherit' }}>
                                <TableCell>
                                  <Badge badgeContent={i + 1} color={visit.visit_status === 'DONE' ? 'default' : 'primary'}>
                                    <Avatar sx={{ width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700, bgcolor: visit.visit_status === 'DONE' ? 'success.light' : visit.visit_status === 'IN_CONSULTATION' ? 'info.main' : 'warning.main' }}>
                                      {visit.patient_name.charAt(0).toUpperCase()}
                                    </Avatar>
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>{visit.patient_name}</Typography>
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <PhoneIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                                    <Typography variant="caption" color="text.secondary">{visit.patient_phone}</Typography>
                                  </Box>
                                  {visit.gender && <Typography variant="caption" color="text.disabled">{visit.gender} • Age {calcAge(visit.date_of_birth)}</Typography>}
                                </TableCell>
                                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{visit.nic || '—'}</Typography></TableCell>
                                <TableCell><Typography variant="caption" color="text.secondary">{visit.check_in_time ? new Date(visit.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}</Typography></TableCell>
                                <TableCell><Chip label={statusLabel(visit.visit_status)} size="small" color={statusColor(visit.visit_status)} sx={{ fontWeight: 700 }} /></TableCell>
                                <TableCell><Chip label={visit.vital_id ? '✓ Recorded' : '⏳ Pending'} size="small" color={visit.vital_id ? 'success' : 'warning'} variant="outlined" sx={{ fontSize: '0.65rem' }} /></TableCell>
                                <TableCell>
                                  {visit.visit_status === 'DONE' ? (
                                    <Chip label="Completed" size="small" color="success" icon={<DoneIcon />} />
                                  ) : (
                                    <Button size="small" variant="contained" color={visit.visit_status === 'IN_CONSULTATION' ? 'info' : 'primary'}
                                      onClick={() => handleOpenConsultation(visit)}
                                      startIcon={visit.visit_status === 'WAITING' ? <StartIcon /> : <AssignIcon />}
                                      sx={{ fontSize: '0.75rem', py: 0.5 }}>
                                      {visit.visit_status === 'IN_CONSULTATION' ? 'Continue' : 'Start'}
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* ══ Availability Dialog ═══════════════════════════════════════════ */}
      <Dialog open={availDialogOpen} onClose={() => setAvailDialogOpen(false)} maxWidth="lg" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)', color: 'white', px: 3, py: 2.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <CalendarIcon sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={800}>Manage Availability</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Configure your time slots for patient appointments</Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setAvailDialogOpen(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <DialogContent sx={{ p: 4 }}>
          <AvailabilityManager />
        </DialogContent>
      </Dialog>


      {/* ══ Consultation Modal ════════════════════════════════════════════ */}
      <Dialog open={!!selectedVisit} onClose={handleClose} maxWidth="lg" fullWidth
        PaperProps={{ sx: { borderRadius: 3, minHeight: 600 } }}>

        {selectedVisit && (

          <>
            {/* Modal Header */}
            <Box sx={{
              background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
              color: 'white', px: 3, py: 2.5,
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56, fontSize: '1.5rem', fontWeight: 800 }}>
                    {selectedVisit.patient_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>{selectedVisit.patient_name}</Typography>
                    <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                      <Chip label={`#${selectedVisit.appointment_no}`} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }} />
                      <Chip label={`Age ${calcAge(selectedVisit.date_of_birth ?? null)}`} size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }} />
                      {selectedVisit.gender && (
                        <Chip label={selectedVisit.gender} size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }} />
                      )}
                      <Chip label={statusLabel(selectedVisit.visit_status)} size="small" color="warning"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                    </Stack>
                  </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Patient info strip */}
            <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={3} flexWrap="wrap">
                {selectedVisit.patient_phone && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">{selectedVisit.patient_phone}</Typography>
                  </Box>
                )}
                {selectedVisit.patient_email && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">{selectedVisit.patient_email}</Typography>
                  </Box>
                )}
                {selectedVisit.nic && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <NicIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">NIC: {selectedVisit.nic}</Typography>
                  </Box>
                )}
                {selectedVisit.appointment_reason && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AssignIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                    <Typography variant="caption" color="warning.main" fontWeight={600}>Reason: {selectedVisit.appointment_reason}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <DialogContent dividers sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
                <Tabs value={consultTab} onChange={(_, v) => setConsultTab(v)} sx={{ px: 2 }}>
                  <Tab icon={<AssignIcon />} iconPosition="start" label="Overview & Notes" />
                  <Tab icon={<MedIcon />} iconPosition="start" label="Prescription" />
                  <Tab icon={<LabIcon />} iconPosition="start" label="Lab Tests" />
                  <Tab icon={<HistoryIcon />} iconPosition="start" label={`History${history ? ` (${history.visits.length})` : ''}`} />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>

                {/* ── Overview ─────────────────────────────────────────── */}
                <TabPanel value={consultTab} index={0}>
                  <Grid container spacing={3}>
                    {/* Vitals */}
                    <Grid item xs={12} md={5}>
                      <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid', borderColor: 'divider', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TempIcon sx={{ color: 'error.main', fontSize: 20 }} /> Current Vitals
                        </Typography>
                        {selectedVisit.vital_id ? (
                          <Grid container spacing={1.5}>
                            {[
                              { label: 'Blood Pressure', value: selectedVisit.systolic_bp ? `${selectedVisit.systolic_bp}/${selectedVisit.diastolic_bp} mmHg` : '—', color: '#e53935' },
                              { label: 'Pulse', value: selectedVisit.pulse ? `${selectedVisit.pulse} bpm` : '—', color: '#e91e63' },
                              { label: 'Temperature', value: selectedVisit.temperature ? `${selectedVisit.temperature}°C` : '—', color: '#ff5722' },
                              { label: 'Weight', value: selectedVisit.weight ? `${selectedVisit.weight} kg` : '—', color: '#607d8b' },
                              { label: 'Blood Sugar', value: selectedVisit.sugar_level ? `${selectedVisit.sugar_level} mg/dL` : '—', color: '#9c27b0' },
                            ].map(({ label, value, color }) => (
                              <Grid item xs={6} key={label}>
                                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'white', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                                  <Typography variant="body1" fontWeight={700} sx={{ color }}>{value}</Typography>
                                </Box>
                              </Grid>
                            ))}
                            {selectedVisit.vital_notes && (
                              <Grid item xs={12}>
                                <Alert severity="info" sx={{ py: 0.5 }}>
                                  <Typography variant="caption">{selectedVisit.vital_notes}</Typography>
                                </Alert>
                              </Grid>
                            )}
                          </Grid>
                        ) : (
                          <Alert severity="warning" icon={<TempIcon />}>
                            Vitals not yet recorded by the receptionist
                          </Alert>
                        )}
                      </Box>
                    </Grid>

                    {/* Notes & Diagnosis */}
                    <Grid item xs={12} md={7}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                          📝 Doctor's Notes
                        </Typography>
                        <TextField fullWidth multiline rows={4}
                          placeholder="Clinical observations, symptoms, examination findings..."
                          value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)}
                          sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                          🔬 Diagnosis
                        </Typography>
                        <TextField fullWidth multiline rows={3}
                          placeholder="Enter diagnosis (e.g., ICD codes or free-text)..."
                          value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                          sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                        <Button variant="contained" onClick={handleSaveNotes} disabled={saving}
                          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AssignIcon />}
                          sx={{ borderRadius: 2, px: 3 }}>
                          Save Notes & Diagnosis
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* ── Prescription ──────────────────────────────────────── */}
                <TabPanel value={consultTab} index={1}>
                  <Typography variant="h6" fontWeight={700} mb={2}>💊 Write Prescription</Typography>
                  {medRows.map((med, i) => (
                    <Card key={i} sx={{ mb: 2, borderRadius: 2, bgcolor: '#fafbff', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Autocomplete
                              options={medicines}
                              getOptionLabel={(option) => `${option.name} (${option.unit})`}
                              value={medicines.find(m => m.id === med.medicine_id) || null}
                              onChange={(event, newValue) => {
                                updateMed(i, 'medicine_id', newValue ? newValue.id : 0);
                              }}
                              renderInput={(params) => (
                                <TextField {...params} label="Search Medicine" size="small" />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField fullWidth label="Dosage" size="small"
                              value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)}
                              placeholder="e.g., 1-0-1 after meals" />
                          </Grid>
                          <Grid item xs={5} sm={2}>
                            <TextField fullWidth type="number" label="Days" size="small"
                              value={med.duration_days} onChange={e => updateMed(i, 'duration_days', Number(e.target.value))}
                              inputProps={{ min: 1 }} />
                          </Grid>
                          <Grid item xs={5} sm={2}>
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
                              value={med.note} onChange={e => updateMed(i, 'note', e.target.value)}
                              placeholder="Special instructions for this medicine" />
                          </Grid>
                        </Grid>
                      </Box>
                    </Card>
                  ))}
                  <Button startIcon={<AddIcon />} size="small" onClick={() => setMedRows([...medRows, { medicine_id: 0, dosage: '', duration_days: 7, qty: 1, note: '' }])} sx={{ mb: 3 }}>
                    Add Another Medicine
                  </Button>

                  <TextField fullWidth multiline rows={2} label="Prescription Instructions"
                    value={prescInstructions} onChange={e => setPrescInstructions(e.target.value)}
                    placeholder="General instructions (e.g., come back after 2 weeks)..." sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />

                  <Button variant="contained" onClick={handleSavePrescription} disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <MedIcon />}
                    sx={{ borderRadius: 2, px: 4 }}>
                    {saving ? 'Saving...' : 'Issue Prescription'}
                  </Button>
                </TabPanel>

                {/* ── Lab Tests ─────────────────────────────────────────── */}
                <TabPanel value={consultTab} index={2}>
                  <Typography variant="h6" fontWeight={700} mb={2}>🔬 Request Lab Tests</Typography>
                  {labTests.length === 0 ? (
                    <Alert severity="info">No lab tests configured in the system</Alert>
                  ) : (
                    <>
                      {/* Group by type */}
                      {Array.from(new Set(labTests.map(t => t.type))).map(type => (
                        <Box key={type} mb={3}>
                          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {type}
                          </Typography>
                          <Grid container spacing={1.5}>
                            {labTests.filter(t => t.type === type).map(test => (
                              <Grid item xs={12} sm={6} md={4} key={test.id}>
                                <Box onClick={() => setSelectedTests(prev =>
                                  prev.includes(test.id) ? prev.filter(id => id !== test.id) : [...prev, test.id]
                                )} sx={{
                                  border: '2px solid',
                                  borderColor: selectedTests.includes(test.id) ? 'primary.main' : 'divider',
                                  borderRadius: 2, p: 1.5, cursor: 'pointer',
                                  bgcolor: selectedTests.includes(test.id) ? 'primary.50' : 'white',
                                  transition: 'all 0.15s',
                                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-1px)', boxShadow: 1 },
                                }}>
                                  <FormGroup>
                                    <FormControlLabel
                                      control={<Checkbox checked={selectedTests.includes(test.id)} size="small" />}
                                      label={
                                        <Box>
                                          <Typography variant="body2" fontWeight={600}>{test.name}</Typography>
                                          <Typography variant="caption" color="primary.main" fontWeight={700}>
                                            Rs. {Number(test.price).toLocaleString()}
                                          </Typography>
                                        </Box>
                                      }
                                    />
                                  </FormGroup>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))}

                      {selectedTests.length > 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          <strong>{selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} selected</strong>{' '}
                          — Total: Rs. {labTests.filter(t => selectedTests.includes(t.id)).reduce((sum, t) => sum + Number(t.price), 0).toLocaleString()}
                        </Alert>
                      )}

                      <Button variant="contained" color="secondary" onClick={handleSaveLabOrder}
                        disabled={saving || !selectedTests.length}
                        startIcon={<LabIcon />} sx={{ borderRadius: 2, px: 4 }}>
                        Submit Lab Order ({selectedTests.length} selected)
                      </Button>
                    </>
                  )}
                </TabPanel>

                {/* ── History ───────────────────────────────────────────── */}
                <TabPanel value={consultTab} index={3}>
                  {loadingHistory ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                  ) : !history || (history.visits.length === 0 && history.prescriptions.length === 0 && history.labOrders.length === 0) ? (
                    <Box textAlign="center" py={6}>
                      <HistoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">No previous records found</Typography>
                      <Typography variant="body2" color="text.disabled">This appears to be a first-time patient</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {/* Past Visits */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle1" fontWeight={700} mb={1} display="flex" alignItems="center" gap={1}>
                          <CalendarIcon sx={{ fontSize: 18 }} /> Past Visits ({history.visits.length})
                        </Typography>
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
                                      {v.diagnosis && <Typography variant="caption" display="block" color="info.main">Dx: {v.diagnosis}</Typography>}
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
                        <Typography variant="subtitle1" fontWeight={700} mb={1} display="flex" alignItems="center" gap={1}>
                          <MedIcon sx={{ fontSize: 18 }} /> Prescriptions ({history.prescriptions.length})
                        </Typography>
                        {history.prescriptions.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No previous prescriptions</Typography>
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
                        <Typography variant="subtitle1" fontWeight={700} mb={1} display="flex" alignItems="center" gap={1}>
                          <LabIcon sx={{ fontSize: 18 }} /> Lab Orders ({history.labOrders.length})
                        </Typography>
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
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
              <Button onClick={handleClose} disabled={saving} sx={{ borderRadius: 2 }}>
                Close
              </Button>
              <Box display="flex" gap={1.5}>
                {selectedVisit.visit_status !== 'DONE' && (
                  <Button variant="contained" color="success" startIcon={<DoneIcon />}
                    onClick={handleCompleteVisit} disabled={saving}
                    sx={{ borderRadius: 2, px: 3 }}>
                    {saving ? <><CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />Saving...</> : 'Complete Visit'}
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>

  );
}
