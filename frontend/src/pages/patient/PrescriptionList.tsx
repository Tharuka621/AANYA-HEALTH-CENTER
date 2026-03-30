import React, { useState } from 'react';
import { format } from 'date-fns';
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
  Pagination,
  Stack,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Description as PrescriptionIcon,
  CheckCircle as ActiveIcon,
  WarningAmber as ExpiredIcon,
  SearchOff as EmptyIcon,
  CalendarToday as CalendarIcon,
  Medication as MedicineIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import CircularProgress from '@mui/material/CircularProgress';

const PrescriptionList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axiosInstance.get('/prescriptions/patient/prescriptions');
        setPrescriptions(response.data?.prescriptions || []);
      } catch (err) {
        console.error('Failed to fetch prescriptions:', err);
        setError('Failed to load prescriptions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'pending':
        return { bg: '#e8f5e9', color: '#2e7d32', icon: <ActiveIcon fontSize="small" /> };
      case 'dispensed':
        return { bg: '#e3f2fd', color: '#1565c0', icon: <ActiveIcon fontSize="small" /> };
      case 'cancelled':
        return { bg: '#ffebee', color: '#c62828', icon: <CancelIcon fontSize="small" /> };
      case 'expired':
        return { bg: '#fff3e0', color: '#e65100', icon: <ExpiredIcon fontSize="small" /> };
      default:
        return { bg: '#f5f5f5', color: '#616161' };
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

  const activePrescriptions = prescriptions.filter(p => p.status?.toLowerCase().trim() === 'active' || p.status?.toLowerCase().trim() === 'pending').length;
  const expiredPrescriptions = prescriptions.filter(p => p.status?.toLowerCase().trim() === 'expired').length;

  // Helper function to safely parse the items array if it's a string
  const parseItems = (items: any) => {
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(items) ? items : [];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fff0f0' }}>
          <Typography color="error" variant="h6">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(45deg, #1e293b 30%, #3b82f6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              My Prescriptions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage your digital medical prescriptions.
            </Typography>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ActiveIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {activePrescriptions}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Active Prescriptions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderRadius: 3,
              boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3)'
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ExpiredIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h3" fontWeight={700}>
                    {expiredPrescriptions}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Expired Prescriptions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {prescriptions.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px dashed #e0e0e0' }}>
            <EmptyIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Prescriptions Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You don't have any prescriptions recorded in the system yet.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Medicines View</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Doctor</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Issued Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.map((prescription) => {
                  const statusStyle = getStatusColor(prescription.status);
                  return (
                    <TableRow
                      key={prescription.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background-color 0.2s' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 300 }}>
                          {parseItems(prescription.items).slice(0, 3).map((item: any, index: number) => (
                            <Chip
                              key={index}
                              icon={<MedicineIcon sx={{ fontSize: 14 }} />}
                              label={`${item.medicine_name} ${item.dosage}`}
                              size="small"
                              variant="outlined"
                              sx={{ bgcolor: 'white', borderColor: '#e2e8f0', color: '#334155' }}
                            />
                          ))}
                          {parseItems(prescription.items).length > 3 && (
                            <Chip
                              label={`+${parseItems(prescription.items).length - 3} more`}
                              size="small"
                              sx={{ bgcolor: '#e2e8f0', color: '#475569', fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#334155' }}>Dr. {prescription.doctor_name || prescription.doctor}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                          {format(new Date(prescription.created_at || prescription.issued_date || new Date()), 'dd/MM/yyyy')}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusStyle.icon}
                          label={(prescription.status || 'Unknown').toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 600,
                            borderRadius: '6px',
                            '& .MuiChip-icon': { color: statusStyle.color }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prescription.notes || 'No specific instructions'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewPrescription(prescription)}
                            sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadPrescription(prescription.id)}
                            sx={{ color: '#10b981', bgcolor: '#ecfdf5', '&:hover': { bgcolor: '#d1fae5' } }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

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
                    {parseItems(selectedPrescription.items).map((item: any, index: number) => (
                      <Chip
                        key={index}
                        label={`${item.medicine_name} ${item.dosage} - ${item.duration_days || item.duration} days`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Date
                  </Typography>
                  <Typography variant="body2">
                    Issued: {format(new Date(selectedPrescription.created_at || selectedPrescription.issued_date || new Date()), 'dd/MM/yyyy')}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    icon={getStatusColor(selectedPrescription.status).icon}
                    label={selectedPrescription.status?.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(selectedPrescription.status).bg,
                      color: getStatusColor(selectedPrescription.status).color,
                      fontWeight: 600,
                      borderRadius: '6px',
                      '& .MuiChip-icon': { color: getStatusColor(selectedPrescription.status).color }
                    }}
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

