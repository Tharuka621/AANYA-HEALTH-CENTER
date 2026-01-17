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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

const PharmacyManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    manufacturer: '',
    batch_number: '',
    expiry_date: '',
    stock_quantity: '',
    unit_price: '',
    reorder_level: '',
    category: '',
  });

  // Mock medicines data
  const medicines = [
    {
      id: '1',
      name: 'Metformin',
      generic_name: 'Metformin HCl',
      manufacturer: 'Generic Pharma',
      batch_number: 'MF2024001',
      expiry_date: '2025-12-31',
      stock_quantity: 500,
      unit_price: 2.50,
      reorder_level: 50,
      category: 'Diabetes',
    },
    {
      id: '2',
      name: 'Lisinopril',
      generic_name: 'Lisinopril',
      manufacturer: 'CardioMed',
      batch_number: 'LS2024001',
      expiry_date: '2025-06-30',
      stock_quantity: 25,
      unit_price: 1.80,
      reorder_level: 30,
      category: 'Hypertension',
    },
    {
      id: '3',
      name: 'Aspirin',
      generic_name: 'Acetylsalicylic Acid',
      manufacturer: 'HeartCare',
      batch_number: 'AS2024001',
      expiry_date: '2025-03-15',
      stock_quantity: 1000,
      unit_price: 0.50,
      reorder_level: 100,
      category: 'Cardiovascular',
    },
    {
      id: '4',
      name: 'Vitamin D3',
      generic_name: 'Cholecalciferol',
      manufacturer: 'Vitamins Plus',
      batch_number: 'VD2024001',
      expiry_date: '2025-08-20',
      stock_quantity: 5,
      unit_price: 3.20,
      reorder_level: 20,
      category: 'Supplements',
    },
  ];

  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity <= reorderLevel) return { status: 'low', color: 'error' };
    if (quantity <= reorderLevel * 2) return { status: 'medium', color: 'warning' };
    return { status: 'good', color: 'success' };
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      generic_name: '',
      manufacturer: '',
      batch_number: '',
      expiry_date: '',
      stock_quantity: '',
      unit_price: '',
      reorder_level: '',
      category: '',
    });
    setOpenDialog(true);
  };

  const handleEditMedicine = (medicine: any) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      generic_name: medicine.generic_name,
      manufacturer: medicine.manufacturer,
      batch_number: medicine.batch_number,
      expiry_date: medicine.expiry_date,
      stock_quantity: medicine.stock_quantity.toString(),
      unit_price: medicine.unit_price.toString(),
      reorder_level: medicine.reorder_level.toString(),
      category: medicine.category,
    });
    setOpenDialog(true);
  };

  const handleDeleteMedicine = (medicineId: string) => {
    console.log('Delete medicine:', medicineId);
    // In a real app, this would call the API
  };

  const handleSaveMedicine = () => {
    console.log('Save medicine:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const lowStockMedicines = medicines.filter(m => m.stock_quantity <= m.reorder_level);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Pharmacy Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddMedicine}
          >
            Add Medicine
          </Button>
        </Box>

        {/* Low Stock Alert */}
        {lowStockMedicines.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <WarningIcon />
              <Typography variant="body2">
                {lowStockMedicines.length} medicine(s) are running low on stock
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <InventoryIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {medicines.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Medicines
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
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {lowStockMedicines.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low Stock Items
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
                  <InventoryIcon color="success" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {medicines.reduce((sum, m) => sum + m.stock_quantity, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Stock
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
                  <InventoryIcon color="info" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      ${medicines.reduce((sum, m) => sum + (m.stock_quantity * m.unit_price), 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
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
                <TableCell>Medicine</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell>Batch Number</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.stock_quantity, medicine.reorder_level);
                return (
                  <TableRow key={medicine.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {medicine.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {medicine.generic_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell>{medicine.batch_number}</TableCell>
                    <TableCell>
                      {new Date(medicine.expiry_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">
                          {medicine.stock_quantity}
                        </Typography>
                        <Chip
                          label={stockStatus.status}
                          color={stockStatus.color}
                          size="small"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>${medicine.unit_price}</TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditMedicine(medicine)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteMedicine(medicine.id)}
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

        {/* Add/Edit Medicine Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Medicine Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Generic Name"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Batch Number"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Reorder Level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveMedicine} variant="contained">
              {editingMedicine ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PharmacyManagement;

