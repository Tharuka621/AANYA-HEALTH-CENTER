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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Science as ScienceIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';
import { adminService } from '../../services/admin.service';
import { LabTestCatalogItem } from '../../types';
import { useToast } from '../../components/common/Toast';

interface AdminLabTestOrder {
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
  const [tabValue, setTabValue] = useState(0);
  const [labOrders, setLabOrders] = useState<AdminLabTestOrder[]>([]);
  const [catalog, setCatalog] = useState<LabTestCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<LabTestCatalogItem> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { showSuccess, showError } = useToast();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 0) fetchLabOrders();
    else fetchCatalog();
  };

  const fetchLabOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/lab-tests');
      setLabOrders(response.data.labTests || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lab orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getLabTestCatalog();
      if (result.success) {
        setCatalog(result.data);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) fetchLabOrders();
    else fetchCatalog();
  }, [tabValue]);

  const handleOpenFile = (item: Partial<LabTestCatalogItem> | null = null) => {
    setEditingItem(item || { name: '', price: 0, description: '', type: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!editingItem?.name || editingItem.price === undefined) {
      showError('Name and Price are required');
      return;
    }

    try {
      setSubmitting(true);
      let result;
      if (editingItem.id) {
        result = await adminService.updateLabTestPrice(editingItem.id, editingItem);
      } else {
        result = await adminService.createLabTest(editingItem as Omit<LabTestCatalogItem, 'id'>);
      }

      if (result.success) {
        showSuccess(result.message);
        handleCloseDialog();
        fetchCatalog();
      } else {
        showError(result.message);
      }
    } catch (err) {
      showError('Failed to save lab test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this test from the catalog?')) return;

    try {
      const result = await adminService.deleteLabTest(id);
      if (result.success) {
        showSuccess(result.message);
        fetchCatalog();
      } else {
        showError(result.message);
      }
    } catch (err) {
      showError('Failed to delete lab test');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Lab Management</Typography>
            <Typography variant="body1" color="text.secondary">Manage lab orders and service catalog</Typography>
          </Box>
          <Box display="flex" gap={2}>
            {tabValue === 1 && (
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => handleOpenFile()}
              >
                Add New Test
              </Button>
            )}
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={tabValue === 0 ? fetchLabOrders : fetchCatalog} 
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Lab Orders" id="lab-mgmt-tab-0" />
            <Tab label="Service Catalog (Prices)" id="lab-mgmt-tab-1" />
          </Tabs>
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {tabValue === 0 ? (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
            ) : labOrders.length === 0 ? (
              <Box py={8} textAlign="center">
                <ScienceIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No lab orders found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Test Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {labOrders.map((test) => (
                      <TableRow key={test.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                              {test.patient_name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>{test.patient_name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{test.test_name}</TableCell>
                        <TableCell>{test.test_type}</TableCell>
                        <TableCell>{`Dr. ${test.doctor_name}`}</TableCell>
                        <TableCell>{format(new Date(test.requested_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          <Chip label={test.item_status} color={getStatusColor(test.item_status)} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                           <Typography variant="caption" color="text.secondary">
                             {test.result_text || 'No results yet'}
                           </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        ) : (
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
            ) : catalog.length === 0 ? (
              <Box py={8} textAlign="center">
                <ScienceIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Catalog is empty</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Test Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category/Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Price (LKR)</TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {catalog.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                        <TableCell>
                          <Chip label={item.type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description || '-'}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 700, color: 'primary.main' }}>
                          {item.price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box display="flex" justifyContent="center" gap={1}>
                            <IconButton size="small" color="primary" onClick={() => handleOpenFile(item)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        )}
      </Box>

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem?.id ? 'Edit Lab Test' : 'Add New Lab Test'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Test Name"
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category / Type"
                placeholder="e.g. Blood Test, Urine Test"
                value={editingItem?.type || ''}
                onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (LKR)"
                type="number"
                value={editingItem?.price || 0}
                onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editingItem?.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LabTestManagement;
