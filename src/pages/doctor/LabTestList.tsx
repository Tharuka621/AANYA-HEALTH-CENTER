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
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Science as ScienceIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const LabTestList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    test_name: '',
    test_type: '',
    requested_date: '',
    status: 'requested',
    notes: '',
  });

  // Mock lab tests data
  const labTests = [
    {
      id: '1',
      patient: 'John Doe',
      test_name: 'Complete Blood Count',
      test_type: 'Blood Test',
      requested_date: '2024-12-15',
      status: 'completed',
      notes: 'Routine checkup',
      result_url: '/reports/cbc_john_doe.pdf',
    },
    {
      id: '2',
      patient: 'Alice Smith',
      test_name: 'Lipid Profile',
      test_type: 'Blood Test',
      requested_date: '2024-12-16',
      status: 'in_progress',
      notes: 'Cholesterol monitoring',
      result_url: null,
    },
    {
      id: '3',
      patient: 'Bob Johnson',
      test_name: 'Urine Analysis',
      test_type: 'Urine Test',
      requested_date: '2024-12-17',
      status: 'requested',
      notes: 'Diabetes screening',
      result_url: null,
    },
    {
      id: '4',
      patient: 'Emma Wilson',
      test_name: 'Thyroid Function Test',
      test_type: 'Blood Test',
      requested_date: '2024-12-18',
      status: 'cancelled',
      notes: 'Patient did not show up',
      result_url: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'primary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleAddTest = () => {
    setEditingTest(null);
    setFormData({
      patient_name: '',
      test_name: '',
      test_type: '',
      requested_date: '',
      status: 'requested',
      notes: '',
    });
    setOpenDialog(true);
  };

  const handleEditTest = (test: any) => {
    setEditingTest(test);
    setFormData({
      patient_name: test.patient,
      test_name: test.test_name,
      test_type: test.test_type,
      requested_date: test.requested_date,
      status: test.status,
      notes: test.notes,
    });
    setOpenDialog(true);
  };

  const handleDeleteTest = (testId: string) => {
    console.log('Delete test:', testId);
    // In a real app, this would call the API
  };

  const handleViewTest = (testId: string) => {
    console.log('View test:', testId);
    // In a real app, this would open test details
  };

  const handleDownloadResult = (testId: string) => {
    console.log('Download result for test:', testId);
    // In a real app, this would download the file
  };

  const handleSaveTest = () => {
    console.log('Save test:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const pendingTests = labTests.filter(t => t.status === 'requested').length;
  const completedTests = labTests.filter(t => t.status === 'completed').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Lab Test Requests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTest}
          >
            Request Lab Test
          </Button>
        </Box>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Pending Tests: {pendingTests}
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Completed Tests: {completedTests}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Test Name</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Requested Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {labTests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {test.patient.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {test.patient}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{test.test_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={test.test_type}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(test.requested_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={test.status}
                      color={getStatusColor(test.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {test.notes}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewTest(test.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {test.status === 'completed' && test.result_url && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleDownloadResult(test.id)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditTest(test)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTest(test.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add/Edit Lab Test Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTest ? 'Edit Lab Test' : 'Request New Lab Test'}
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
                label="Test Name"
                value={formData.test_name}
                onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Test Type</InputLabel>
                <Select
                  value={formData.test_type}
                  label="Test Type"
                  onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                >
                  <MenuItem value="Blood Test">Blood Test</MenuItem>
                  <MenuItem value="Urine Test">Urine Test</MenuItem>
                  <MenuItem value="X-Ray">X-Ray</MenuItem>
                  <MenuItem value="MRI">MRI</MenuItem>
                  <MenuItem value="CT Scan">CT Scan</MenuItem>
                  <MenuItem value="Ultrasound">Ultrasound</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Requested Date"
                type="date"
                value={formData.requested_date}
                onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="requested">Requested</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
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
            <Button onClick={handleSaveTest} variant="contained">
              {editingTest ? 'Update' : 'Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LabTestList;

