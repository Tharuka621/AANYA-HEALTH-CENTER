import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid, Card,
  CardContent, CircularProgress, Alert, InputAdornment, Stack,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import { useToast } from '../../components/common/Toast';

interface LabOrderRow {
  id: number;
  patient_name: string;
  patient_phone: string;
  status: string;
  created_at: string;
  tests: string | null; // comma-separated test names
  visit_id: number;
  patient_id: number;
}

const statusColors: Record<string, any> = {
  ORDERED: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const statusLabels: Record<string, string> = {
  ORDERED: 'Ordered',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const LabTestList: React.FC = () => {
  const { showError } = useToast();
  const [labOrders, setLabOrders] = useState<LabOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<LabOrderRow | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchLabOrders = async () => {
    setLoading(true);
    try {
      // Get today's queue to find all patients, then get their lab orders
      const queueRes = await axiosInstance.get('/doctor/queue');
      const visits: any[] = queueRes.data;

      // Collect unique patient IDs
      const patientIds = [...new Set(visits.map((v: any) => v.patient_id))];

      // Fetch history for each patient and collect lab orders
      const allOrders: LabOrderRow[] = [];
      await Promise.all(patientIds.map(async (pid) => {
        try {
          const r = await axiosInstance.get(`/doctor/patients/${pid}/history`);
          const { labOrders, visits: patientVisits } = r.data;
          const patient = visits.find((v: any) => v.patient_id === pid);

          labOrders.forEach((lo: any) => {
            allOrders.push({
              id: lo.id,
              patient_name: patient?.patient_name || 'Unknown',
              patient_phone: patient?.patient_phone || '',
              status: lo.status,
              created_at: lo.created_at,
              tests: lo.tests,
              visit_id: 0,
              patient_id: pid,
            });
          });
        } catch {
          // skip
        }
      }));

      // Sort by most recent
      allOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setLabOrders(allOrders);
    } catch {
      showError('Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return labOrders.filter(lo => {
      const matchesSearch = !searchQuery ||
        lo.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lo.tests?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lo.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [labOrders, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: labOrders.length,
    ordered: labOrders.filter(l => l.status === 'ORDERED').length,
    inProgress: labOrders.filter(l => l.status === 'IN_PROGRESS').length,
    completed: labOrders.filter(l => l.status === 'COMPLETED').length,
  }), [labOrders]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={800}>Lab Test Orders</Typography>
            <Typography variant="body2" color="text.secondary">
              Lab orders placed for today's patients
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchLabOrders} disabled={loading}>
            Refresh
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Total Orders', value: stats.total, color: '#1a237e' },
            { label: 'Ordered', value: stats.ordered, color: '#e65100' },
            { label: 'In Progress', value: stats.inProgress, color: '#0277bd' },
            { label: 'Completed', value: stats.completed, color: '#2e7d32' },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: s.color, textTransform: 'uppercase' }}>
                    {s.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ color: s.color }}>{s.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField fullWidth size="small" placeholder="Search by patient name or test..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={7}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['all', 'ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                    <Chip key={s} label={s === 'all' ? 'All' : statusLabels[s] || s}
                      variant={statusFilter === s ? 'filled' : 'outlined'}
                      color={statusFilter === s ? 'primary' : 'default'}
                      size="small"
                      onClick={() => setStatusFilter(s)}
                      sx={{ cursor: 'pointer', fontWeight: 600 }} />
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Table */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">Loading lab orders...</Typography>
            </Box>
          ) : filteredOrders.length === 0 ? (
            <Box py={10} textAlign="center">
              <ScienceIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No lab orders found</Typography>
              <Typography variant="body2" color="text.disabled">
                {labOrders.length === 0
                  ? 'No lab orders have been placed for today\'s patients'
                  : 'Try adjusting your search filters'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tests Ordered</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: 'warning.light', width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}>
                            {order.patient_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{order.patient_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.patient_phone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box maxWidth={300}>
                          {order.tests ? order.tests.split(',').map((t, i) => (
                            <Chip key={i} label={t.trim()} size="small"
                              sx={{ mr: 0.5, mb: 0.5, fontSize: '0.65rem' }} variant="outlined" />
                          )) : <Typography variant="caption" color="text.secondary">—</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(order.created_at).toLocaleDateString()}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={statusLabels[order.status] || order.status}
                          size="small" color={statusColors[order.status] || 'default'}
                          sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" startIcon={<ViewIcon />}
                          onClick={() => { setSelectedOrder(order); setOpenDialog(true); }}>
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Detail Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScienceIcon color="warning" />
            <Typography variant="h6" fontWeight={700}>Lab Order Details</Typography>
          </DialogTitle>
          <DialogContent>
            {selectedOrder && (
              <Box sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2"><strong>Patient:</strong> {selectedOrder.patient_name}</Typography>
                  {selectedOrder.patient_phone && (
                    <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.patient_phone}</Typography>
                  )}
                  <Typography variant="body2"><strong>Ordered:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</Typography>
                </Alert>

                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Tests Ordered</Typography>
                <Box mb={3}>
                  {selectedOrder.tests
                    ? selectedOrder.tests.split(',').map((t, i) => (
                      <Chip key={i} label={t.trim()} color="primary" sx={{ mr: 1, mb: 1 }} />
                    ))
                    : <Typography variant="body2" color="text.secondary">No tests listed</Typography>
                  }
                </Box>

                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Status</Typography>
                <Chip label={statusLabels[selectedOrder.status] || selectedOrder.status}
                  color={statusColors[selectedOrder.status] || 'default'} sx={{ mb: 2, fontWeight: 700 }} />

                <Typography variant="caption" color="text.secondary" display="block">
                  Order ID: #{selectedOrder.id}
                </Typography>
              </Box>
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

export default LabTestList;
