import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid, Card,
  CardContent, CircularProgress, Alert, InputAdornment, List, ListItem,
  ListItemText, Divider, Stack,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Assignment as AssignIcon,
  Science as LabIcon,
  Medication as MedIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import { useToast } from '../../components/common/Toast';

interface PatientRecord {
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  gender: string | null;
  date_of_birth: string | null;
  nic: string;
  last_visit: string;
  visit_count: number;
}

interface PatientHistory {
  visits: { id: number; slot_date: string; start_time: string; diagnosis: string | null; doctor_notes: string | null; doctor_name: string }[];
  prescriptions: { id: number; created_at: string; doctor_name: string; instructions: string | null; medicines_summary: string | null; status: string }[];
  labOrders: { id: number; created_at: string; doctor_name: string; tests: string | null; status: string }[];
}

const calcAge = (dob: string | null) => {
  if (!dob) return 'N/A';
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) + 'y';
};

const fmtTime = (t: string) => {
  if (!t) return '';
  try { return new Date(`2000-01-01T${t}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
  catch { return t; }
};

const PatientList: React.FC = () => {
  const { showError } = useToast();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [historyTab, setHistoryTab] = useState(0);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Use doctor queue to get all unique patients
      // We aggregate from all visits regardless of date
      const response = await axiosInstance.get('/doctor/queue');
      // The queue returns TODAY's patients; we need a separate "my patients" endpoint
      // The queue for all dates would need a new endpoint. For now, use what's available.
      // Since there's no dedicated "my patients" endpoint, we parse the queue endpoint with no slot filter
      const data: any[] = response.data;
      // Build unique patients map
      const patientMap = new Map<number, PatientRecord>();
      data.forEach((v: any) => {
        if (!patientMap.has(v.patient_id)) {
          patientMap.set(v.patient_id, {
            patient_id: v.patient_id,
            patient_name: v.patient_name,
            patient_phone: v.patient_phone,
            patient_email: v.patient_email,
            gender: v.gender,
            date_of_birth: v.date_of_birth,
            nic: v.nic,
            last_visit: v.check_in_time,
            visit_count: 1,
          });
        } else {
          const existing = patientMap.get(v.patient_id)!;
          existing.visit_count++;
        }
      });
      setPatients(Array.from(patientMap.values()));
    } catch {
      showError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(p =>
      p.patient_name.toLowerCase().includes(q) ||
      p.patient_phone?.includes(q) ||
      p.nic?.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const handleViewPatient = async (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setHistory(null);
    setHistoryTab(0);
    setOpenDialog(true);
    setLoadingHistory(true);
    try {
      const r = await axiosInstance.get(`/doctor/patients/${patient.patient_id}/history`);
      setHistory(r.data);
    } catch {
      // non-critical
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={800}>My Patients</Typography>
            <Typography variant="body2" color="text.secondary">
              Patients who have been seen today
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPatients} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {/* Search */}
        <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ py: 1.5 }}>
            <TextField fullWidth size="small" placeholder="Search by name, phone, or NIC..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> }} />
          </CardContent>
        </Card>

        {/* Table */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : filteredPatients.length === 0 ? (
            <Box py={10} textAlign="center">
              <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No patients found</Typography>
              <Typography variant="body2" color="text.disabled">
                {searchQuery ? 'Try adjusting your search' : 'No patients have checked in today'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>NIC</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Age / Gender</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Visits Today</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.patient_id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: 'primary.light', fontSize: '0.85rem', fontWeight: 700 }}>
                            {patient.patient_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{patient.patient_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{patient.patient_email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {patient.nic || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          <Chip label={calcAge(patient.date_of_birth)} size="small" variant="outlined" />
                          {patient.gender && <Chip label={patient.gender} size="small" color={patient.gender === 'MALE' ? 'primary' : 'secondary'} variant="outlined" />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                          <Typography variant="body2">{patient.patient_phone || '—'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={`${patient.visit_count} visit${patient.visit_count > 1 ? 's' : ''}`}
                          size="small" color={patient.visit_count > 1 ? 'warning' : 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" startIcon={<ViewIcon />}
                          onClick={() => handleViewPatient(patient)}>
                          History
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Patient History Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                {selectedPatient?.patient_name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>{selectedPatient?.patient_name}</Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  {selectedPatient?.gender && <Chip label={selectedPatient.gender} size="small" />}
                  <Chip label={`Age: ${calcAge(selectedPatient?.date_of_birth ?? null)}`} size="small" />
                  {selectedPatient?.nic && <Chip label={selectedPatient.nic} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }} />}
                </Stack>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {loadingHistory ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : !history ? (
              <Alert severity="info">No history found for this patient</Alert>
            ) : (
              <Grid container spacing={3}>
                {/* Past Visits */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} display="flex" alignItems="center" gap={1}>
                    <CalendarIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    Past Visits ({history.visits.length})
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {history.visits.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No past visits</Typography>
                  ) : (
                    <List dense disablePadding>
                      {history.visits.map(v => (
                        <ListItem key={v.id} disableGutters sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight={600}>{v.slot_date}</Typography>}
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

                {/* Prescriptions */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} display="flex" alignItems="center" gap={1}>
                    <MedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    Prescriptions ({history.prescriptions.length})
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {history.prescriptions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No prescriptions</Typography>
                  ) : (
                    <List dense disablePadding>
                      {history.prescriptions.map(p => (
                        <ListItem key={p.id} disableGutters sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight={600}>{new Date(p.created_at).toLocaleDateString()}</Typography>}
                            secondary={p.medicines_summary && <Typography variant="caption">{p.medicines_summary}</Typography>}
                          />
                          <Chip label={p.status} size="small" color={p.status === 'DISPENSED' ? 'success' : 'default'} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>

                {/* Lab Orders */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" fontWeight={700} mb={1} display="flex" alignItems="center" gap={1}>
                    <LabIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                    Lab Orders ({history.labOrders.length})
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  {history.labOrders.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No lab orders</Typography>
                  ) : (
                    <List dense disablePadding>
                      {history.labOrders.map(lo => (
                        <ListItem key={lo.id} disableGutters sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1 }}>
                          <ListItemText
                            primary={<Typography variant="body2" fontWeight={600}>{new Date(lo.created_at).toLocaleDateString()}</Typography>}
                            secondary={lo.tests && <Typography variant="caption">{lo.tests}</Typography>}
                          />
                          <Chip label={lo.status} size="small" color={lo.status === 'COMPLETED' ? 'success' : 'warning'} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PatientList;
