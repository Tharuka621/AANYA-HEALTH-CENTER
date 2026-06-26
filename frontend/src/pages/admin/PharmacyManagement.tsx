import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { axiosInstance } from '../../services/api';

interface InventoryItem {
  id: number;
  name: string;
  generic_name: string | null;
  manufacturer: string | null;
  batch_no: string | null;
  expiry_date: string | null;
  stock_quantity: number;
  unit_price: number;
  reorder_level: number;
  category: string | null;
}

const getStockStatus = (quantity: number, reorderLevel: number): { status: string; color: 'error' | 'warning' | 'success' } => {
  // Simple stock health label used in the table chips.
  if (quantity <= reorderLevel) return { status: 'low', color: 'error' };
  if (quantity <= reorderLevel * 2) return { status: 'medium', color: 'warning' };
  return { status: 'good', color: 'success' };
};

const PharmacyManagement: React.FC = () => {
  // Main page state: inventory data, dialog visibility, and form status flags.
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [form, setForm] = useState({
    name: '',
    unit: 'tab',
    description: '',
    manufacturer: '',
    category: '',
    low_stock_threshold: '20',
    batch_no: '',
    expiry_date: '',
    qty_available: '0',
    buy_price: '',
    sell_price: '',
  });

  // Loads inventory rows that drive both the stock table and summary alerts.
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/pharmacy/inventory');
      setInventory(response.data.inventory || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load inventory once when the page is opened.
    fetchInventory();
  }, []);

  const resetForm = () => {
    // Reset all add-medicine inputs to defaults.
    setForm({
      name: '',
      unit: 'tab',
      description: '',
      manufacturer: '',
      category: '',
      low_stock_threshold: '20',
      batch_no: '',
      expiry_date: '',
      qty_available: '0',
      buy_price: '',
      sell_price: '',
    });
    setShowValidation(false);
  };

  const todayKey = new Date().toISOString().split('T')[0];
  // Client-side validation keeps invalid medicine entries from being submitted.
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = 'Medicine name is required';
    }

    if (form.sell_price === '') {
      errors.sell_price = 'Sell price is required';
    } else if (Number(form.sell_price) <= 0) {
      errors.sell_price = 'Sell price must be greater than 0';
    }

    if (form.qty_available !== '' && Number(form.qty_available) < 0) {
      errors.qty_available = 'Opening stock cannot be negative';
    }

    if (form.low_stock_threshold !== '' && Number(form.low_stock_threshold) < 0) {
      errors.low_stock_threshold = 'Low stock threshold cannot be negative';
    }

    if (form.buy_price !== '' && Number(form.buy_price) < 0) {
      errors.buy_price = 'Buy price cannot be negative';
    }

    if (form.expiry_date && form.expiry_date < todayKey) {
      errors.expiry_date = 'Expiry date cannot be in the past';
    }

    return errors;
  }, [form, todayKey]);

  // Used to block submit and show helper text when form has validation issues.
  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  // Creates medicine + opening batch data through admin pharmacy endpoint.
  const handleCreateMedicine = async () => {
    // Stop submit and show field errors first.
    if (hasValidationErrors) {
      setShowValidation(true);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Convert optional empty strings to null and numeric fields to numbers.
      await axiosInstance.post('/admin/pharmacy/medicines', {
        name: form.name,
        unit: form.unit,
        description: form.description || null,
        manufacturer: form.manufacturer || null,
        category: form.category || null,
        low_stock_threshold: Number(form.low_stock_threshold || 20),
        batch_no: form.batch_no || null,
        expiry_date: form.expiry_date || null,
        qty_available: Number(form.qty_available || 0),
        buy_price: form.buy_price === '' ? null : Number(form.buy_price),
        sell_price: Number(form.sell_price),
      });

      setAddDialogOpen(false);
      resetForm();
      // Reload table after successful insert.
      fetchInventory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  // Derived list for warnings and dashboard summary cards.
  const lowStockItems = useMemo(
    () => inventory.filter((item) => Number(item.stock_quantity || 0) <= Number(item.reorder_level || 0)),
    [inventory]
  );

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ py: { xs: 1.5, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>Pharmacy Management</Typography>
            <Typography variant="body2" color="text.secondary">Live inventory data from the database</Typography>
          </Box>
          <Box display="flex" gap={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setAddDialogOpen(true);
                setShowValidation(false);
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add Medicine
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchInventory} disabled={loading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              Refresh
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {lowStockItems.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <WarningIcon />
              <Typography variant="body2">
                {lowStockItems.length} inventory item(s) are at or below the reorder level
              </Typography>
            </Box>
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <InventoryIcon color="primary" sx={{ fontSize: { xs: 24, sm: 32 } }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{inventory.length}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Batches</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <WarningIcon color="warning" sx={{ fontSize: { xs: 24, sm: 32 } }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{lowStockItems.length}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Low Stock</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <InventoryIcon color="success" sx={{ fontSize: { xs: 24, sm: 32 } }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      {inventory.reduce((sum, item) => sum + Number(item.stock_quantity || 0), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Total Stock</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <InventoryIcon color="info" sx={{ fontSize: { xs: 24, sm: 32 } }} />
                  <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '0.85rem', sm: '1.25rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Rs. {inventory.reduce((sum, item) => sum + Number(item.stock_quantity || 0) * Number(item.unit_price || 0), 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Total Value</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          ) : (
            <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ minWidth: { xs: 600, sm: 700 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Medicine</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Manufacturer</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Batch</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Expiry</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Stock</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Unit Price</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Category</TableCell>
                    </TableRow>
                  </TableHead>
                <TableBody>
                  {inventory.map((item) => {
                    const stockStatus = getStockStatus(Number(item.stock_quantity || 0), Number(item.reorder_level || 0));
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.generic_name || '—'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{item.manufacturer || '—'}</TableCell>
                        <TableCell>{item.batch_no || '—'}</TableCell>
                        <TableCell>{item.expiry_date ? format(new Date(item.expiry_date), 'dd/MM/yyyy') : '—'}</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">{item.stock_quantity}</Typography>
                            <Chip label={stockStatus.status} color={stockStatus.color} size="small" />
                          </Box>
                        </TableCell>
                        <TableCell>Rs. {Number(item.unit_price || 0).toFixed(2)}</TableCell>
                        <TableCell>{item.category || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            </Box>
          )}
        </Card>

        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Medicine</DialogTitle>
          <DialogContent>
            {/* Input form for creating a medicine and optional opening batch details. */}
            <Box display="grid" gap={2} sx={{ mt: 1 }}>
              <TextField
                label="Medicine Name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                fullWidth
                error={showValidation && Boolean(validationErrors.name)}
                helperText={showValidation ? validationErrors.name : ''}
              />
              <TextField
                label="Unit"
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                select
                fullWidth
              >
                <MenuItem value="tab">Tablet</MenuItem>
                <MenuItem value="cap">Capsule</MenuItem>
                <MenuItem value="ml">ml</MenuItem>
                <MenuItem value="bottle">Bottle</MenuItem>
                <MenuItem value="tube">Tube</MenuItem>
              </TextField>
              <TextField
                label="Description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Manufacturer"
                value={form.manufacturer}
                onChange={(e) => setForm((prev) => ({ ...prev, manufacturer: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Low Stock Threshold"
                type="number"
                value={form.low_stock_threshold}
                onChange={(e) => setForm((prev) => ({ ...prev, low_stock_threshold: e.target.value }))}
                fullWidth
                error={showValidation && Boolean(validationErrors.low_stock_threshold)}
                helperText={showValidation ? validationErrors.low_stock_threshold : ''}
              />
              <TextField
                label="Batch Number"
                value={form.batch_no}
                onChange={(e) => setForm((prev) => ({ ...prev, batch_no: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Expiry Date"
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm((prev) => ({ ...prev, expiry_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={showValidation && Boolean(validationErrors.expiry_date)}
                helperText={showValidation ? validationErrors.expiry_date : ''}
              />
              <TextField
                label="Opening Stock"
                type="number"
                value={form.qty_available}
                onChange={(e) => setForm((prev) => ({ ...prev, qty_available: e.target.value }))}
                fullWidth
                error={showValidation && Boolean(validationErrors.qty_available)}
                helperText={showValidation ? validationErrors.qty_available : ''}
              />
              <TextField
                label="Buy Price"
                type="number"
                value={form.buy_price}
                onChange={(e) => setForm((prev) => ({ ...prev, buy_price: e.target.value }))}
                fullWidth
                error={showValidation && Boolean(validationErrors.buy_price)}
                helperText={showValidation ? validationErrors.buy_price : ''}
              />
              <TextField
                label="Sell Price"
                type="number"
                value={form.sell_price}
                onChange={(e) => setForm((prev) => ({ ...prev, sell_price: e.target.value }))}
                required
                fullWidth
                error={showValidation && Boolean(validationErrors.sell_price)}
                helperText={showValidation ? validationErrors.sell_price : ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                // Close form and hide validation helpers.
                setAddDialogOpen(false);
                setShowValidation(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                // Force validation visibility, then attempt save.
                setShowValidation(true);
                handleCreateMedicine();
              }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Medicine'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PharmacyManagement;
