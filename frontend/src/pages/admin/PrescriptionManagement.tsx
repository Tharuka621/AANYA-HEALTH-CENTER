import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Description as PrescriptionIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { axiosInstance } from '../../services/api';

interface PrescriptionItem {
  medicine_name?: string;
  dosage?: string;
}

interface AdminPrescription {
  id: number;
  patient_name: string;
  doctor_name: string;
  items: PrescriptionItem[];
  created_at: string;
  status: string;
  notes: string | null;
}

const getStatusColor = (status: string): 'primary' | 'success' | 'error' | 'warning' | 'default' => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return 'primary';
    case 'DISPENSED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'EXPIRED':
      return 'warning';
    default:
      return 'default';
  }
};

const PrescriptionManagement: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<AdminPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/prescriptions');
      setPrescriptions(response.data.prescriptions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Prescription Management</Typography>
            <Typography variant="body2" color="text.secondary">Live prescription data from the database</Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchPrescriptions} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : prescriptions.length === 0 ? (
            <Box py={8} textAlign="center">
              <PrescriptionIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No prescriptions found</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Medicines</TableCell>
                    <TableCell>Issued Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow key={prescription.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {prescription.patient_name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{prescription.patient_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{`Dr. ${prescription.doctor_name}`}</TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {prescription.items.filter((item) => item && item.medicine_name).map((item, index) => (
                            <Chip
                              key={`${prescription.id}-${index}`}
                              label={`${item.medicine_name}${item.dosage ? ` ${item.dosage}` : ''}`}
                              size="small"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{format(new Date(prescription.created_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Chip label={prescription.status} color={getStatusColor(prescription.status)} size="small" />
                      </TableCell>
                      <TableCell>{prescription.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </Container>
  );
};

export default PrescriptionManagement;

