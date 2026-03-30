import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon, Science as ScienceIcon } from '@mui/icons-material';
import { axiosInstance } from '../../services/api';

interface AdminLabTest {
  id: number;
  patient_name: string;
  doctor_name: string;
  test_name: string;
  test_type: string;
  requested_date: string;
  item_status: string;
  result_text: string | null;
}

const getStatusColor = (status: string): 'primary' | 'warning' | 'success' | 'error' | 'default' => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'warning';
    case 'DONE':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'primary';
  }
};

const LabTestManagement: React.FC = () => {
  const [labTests, setLabTests] = useState<AdminLabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/lab-tests');
      setLabTests(response.data.labTests || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabTests();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Lab Test Management</Typography>
            <Typography variant="body2" color="text.secondary">Live lab-order data from the database</Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchLabTests} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : labTests.length === 0 ? (
            <Box py={8} textAlign="center">
              <ScienceIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No lab tests found</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Test Name</TableCell>
                    <TableCell>Test Type</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Requested Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Result / Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labTests.map((test) => (
                    <TableRow key={test.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {test.patient_name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{test.patient_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{test.test_name}</TableCell>
                      <TableCell>{test.test_type}</TableCell>
                      <TableCell>{`Dr. ${test.doctor_name}`}</TableCell>
                      <TableCell>{format(new Date(test.requested_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Chip label={test.item_status} color={getStatusColor(test.item_status)} size="small" />
                      </TableCell>
                      <TableCell>{test.result_text || 'Pending result'}</TableCell>
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

export default LabTestManagement;
