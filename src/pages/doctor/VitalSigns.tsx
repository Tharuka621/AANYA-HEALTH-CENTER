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
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonitorHeart as HeartIcon,
} from '@mui/icons-material';

const VitalSigns: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVital, setEditingVital] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    date: '',
    time: '',
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    height: '',
    notes: '',
  });

  // Mock vital signs data
  const vitalSigns = [
    {
      id: '1',
      patient: 'John Doe',
      date: '2024-12-20',
      time: '10:00 AM',
      blood_pressure: '120/80',
      heart_rate: '72',
      temperature: '98.6',
      weight: '180',
      height: '5\'10"',
      notes: 'Normal readings',
    },
    {
      id: '2',
      patient: 'Alice Smith',
      date: '2024-12-20',
      time: '11:30 AM',
      blood_pressure: '130/85',
      heart_rate: '78',
      temperature: '98.4',
      weight: '145',
      height: '5\'6"',
      notes: 'Slightly elevated BP',
    },
    {
      id: '3',
      patient: 'Bob Johnson',
      date: '2024-12-19',
      time: '2:00 PM',
      blood_pressure: '140/90',
      heart_rate: '85',
      temperature: '99.1',
      weight: '200',
      height: '6\'0"',
      notes: 'High BP, monitor closely',
    },
    {
      id: '4',
      patient: 'Emma Wilson',
      date: '2024-12-19',
      time: '3:30 PM',
      blood_pressure: '110/70',
      heart_rate: '65',
      temperature: '98.2',
      weight: '130',
      height: '5\'4"',
      notes: 'Excellent readings',
    },
  ];

  const getBloodPressureStatus = (bp: string) => {
    const [systolic, diastolic] = bp.split('/').map(Number);
    if (systolic < 120 && diastolic < 80) return { status: 'Normal', color: 'success' };
    if (systolic < 130 && diastolic < 80) return { status: 'Elevated', color: 'warning' };
    if (systolic < 140 && diastolic < 90) return { status: 'High Stage 1', color: 'warning' };
    return { status: 'High Stage 2', color: 'error' };
  };

  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { status: 'Low', color: 'warning' };
    if (hr > 100) return { status: 'High', color: 'error' };
    return { status: 'Normal', color: 'success' };
  };

  const handleAddVital = () => {
    setEditingVital(null);
    setFormData({
      patient_name: '',
      date: '',
      time: '',
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      weight: '',
      height: '',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditVital = (vital: any) => {
    setEditingVital(vital);
    setFormData({
      patient_name: vital.patient,
      date: vital.date,
      time: vital.time,
      blood_pressure: vital.blood_pressure,
      heart_rate: vital.heart_rate,
      temperature: vital.temperature,
      weight: vital.weight,
      height: vital.height,
      notes: vital.notes,
    });
    setOpenDialog(true);
  };

  const handleDeleteVital = (vitalId: string) => {
    console.log('Delete vital signs:', vitalId);
    // In a real app, this would call the API
  };

  const handleSaveVital = () => {
    console.log('Save vital signs:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const todayVitals = vitalSigns.filter(v => v.date === new Date().toISOString().split('T')[0]);
  const abnormalReadings = vitalSigns.filter(v => {
    const bpStatus = getBloodPressureStatus(v.blood_pressure);
    const hrStatus = getHeartRateStatus(parseInt(v.heart_rate));
    return bpStatus.color === 'error' || hrStatus.color === 'error';
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Vital Signs Records
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddVital}
          >
            Record Vital Signs
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <HeartIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {todayVitals.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Records
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUpIcon color="error" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {abnormalReadings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Abnormal Readings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <HeartIcon color="success" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {vitalSigns.length - abnormalReadings.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Normal Readings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <HeartIcon color="info" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {vitalSigns.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Records
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Blood Pressure</TableCell>
                <TableCell>Heart Rate</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell>Weight/Height</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vitalSigns.map((vital) => {
                const bpStatus = getBloodPressureStatus(vital.blood_pressure);
                const hrStatus = getHeartRateStatus(parseInt(vital.heart_rate));
                
                return (
                  <TableRow key={vital.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {vital.patient.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {vital.patient}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{vital.date}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vital.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">{vital.blood_pressure}</Typography>
                        <Chip
                          label={bpStatus.status}
                          color={bpStatus.color}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">{vital.heart_rate} bpm</Typography>
                        <Chip
                          label={hrStatus.status}
                          color={hrStatus.color}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{vital.temperature}°F</Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{vital.weight} lbs</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vital.height}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {vital.notes}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditVital(vital)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteVital(vital.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Vital Signs Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingVital ? 'Edit Vital Signs' : 'Record New Vital Signs'}
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
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Blood Pressure (e.g., 120/80)"
                value={formData.blood_pressure}
                onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Heart Rate (bpm)"
                type="number"
                value={formData.heart_rate}
                onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Temperature (°F)"
                type="number"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Weight (lbs)"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label={'Height (e.g., 5\'10")'}
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                margin="normal"
              />
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
            <Button onClick={handleSaveVital} variant="contained">
              {editingVital ? 'Update' : 'Record'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default VitalSigns;
