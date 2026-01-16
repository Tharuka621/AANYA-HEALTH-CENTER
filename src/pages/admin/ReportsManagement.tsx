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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  PeopleAlt as PeopleIcon,
  Science as ScienceIcon,
  Medication as MedicationIcon,
  Inventory2 as InventoryIcon,
} from '@mui/icons-material';

const ReportsManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    status: 'draft',
  });

  // Quick access sample reports state
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewType, setQuickViewType] = useState<
    'patientVisits' | 'labTests' | 'prescriptions' | 'inventory' | null
  >(null);

  // Mock reports data
  const reports = [
    {
      id: '1',
      title: 'Monthly Patient Statistics',
      type: 'Patient Report',
      description: 'Patient demographics and visit statistics for December 2024',
      status: 'published',
      created_date: '2024-12-01',
      author: 'Admin',
    },
    {
      id: '2',
      title: 'Revenue Analysis Q4 2024',
      type: 'Financial Report',
      description: 'Quarterly revenue analysis and billing trends',
      status: 'published',
      created_date: '2024-12-15',
      author: 'Admin',
    },
    {
      id: '3',
      title: 'Lab Test Results Summary',
      type: 'Lab Report',
      description: 'Summary of all lab tests performed in December',
      status: 'draft',
      created_date: '2024-12-18',
      author: 'Lab Technician',
    },
    {
      id: '4',
      title: 'Prescription Audit Report',
      type: 'Pharmacy Report',
      description: 'Audit of prescriptions issued and dispensed',
      status: 'review',
      created_date: '2024-12-19',
      author: 'Pharmacist',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'review': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const handleAddReport = () => {
    setEditingReport(null);
    setFormData({
      title: '',
      type: '',
      description: '',
      status: 'draft',
    });
    setOpenDialog(true);
  };

  const handleEditReport = (report: any) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      type: report.type,
      description: report.description,
      status: report.status,
    });
    setOpenDialog(true);
  };

  const handleDeleteReport = (reportId: string) => {
    console.log('Delete report:', reportId);
    // In a real app, this would call the API
  };

  const handleViewReport = (reportId: string) => {
    console.log('View report:', reportId);
    // In a real app, this would open the report
  };

  const handleDownloadReport = (reportId: string) => {
    console.log('Download report:', reportId);
    // In a real app, this would download the report
  };

  const handleSaveReport = () => {
    console.log('Save report:', formData);
    setOpenDialog(false);
    // In a real app, this would call the API
  };

  const publishedReports = reports.filter(r => r.status === 'published').length;
  const draftReports = reports.filter(r => r.status === 'draft').length;
  const reviewReports = reports.filter(r => r.status === 'review').length;

  // Sample datasets for quick access reports
  const patientVisitsData = [
    { date: '2025-01-03', patient: 'Kasun Bandara', doctor: 'Dr. Milinda Abeykoon', reason: 'Follow-up', status: 'Completed' },
    { date: '2025-01-04', patient: 'Nimal Perera', doctor: 'Dr. Milinda Abeykoon', reason: 'Fever', status: 'Completed' },
    { date: '2025-01-05', patient: 'Ishara Silva', doctor: 'Dr. Milinda Abeykoon', reason: 'Headache', status: 'No Show' },
  ];

  const labTestsData = [
    { date: '2025-01-02', patient: 'Amaya Fernando', test: 'FBC', result: 'Normal', lab: 'Central Lab' },
    { date: '2025-01-04', patient: 'Sunil Jayasuriya', test: 'Lipid Profile', result: 'High LDL', lab: 'Central Lab' },
    { date: '2025-01-05', patient: 'Madhavi Perera', test: 'Blood Sugar (FBS)', result: 'Elevated', lab: 'Central Lab' },
  ];

  const prescriptionsData = [
    { date: '2025-01-03', patient: 'Kasun Bandara', medicine: 'Paracetamol 500mg', qty: 10, prescribedBy: 'Dr. Milinda Abeykoon' },
    { date: '2025-01-03', patient: 'Nimal Perera', medicine: 'Amoxicillin 250mg', qty: 15, prescribedBy: 'Dr. Milinda Abeykoon' },
    { date: '2025-01-04', patient: 'Ishara Silva', medicine: 'Cetirizine 10mg', qty: 7, prescribedBy: 'Dr. Milinda Abeykoon' },
  ];

  const inventoryData = [
    { item: 'Paracetamol 500mg', category: 'Tablet', inStock: 125, minRequired: 50, status: 'OK' },
    { item: 'Amoxicillin 250mg', category: 'Capsule', inStock: 30, minRequired: 60, status: 'Low' },
    { item: 'Syringes 5ml', category: 'Supply', inStock: 400, minRequired: 200, status: 'OK' },
  ];

  const handleOpenQuickView = (
    type: 'patientVisits' | 'labTests' | 'prescriptions' | 'inventory'
  ) => {
    setQuickViewType(type);
    setQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setQuickViewOpen(false);
    setQuickViewType(null);
  };

  const toCSV = (rows: any[], headers?: string[]) => {
    if (!rows.length) return '';
    const cols = headers || Object.keys(rows[0]);
    const escape = (v: any) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const head = cols.join(',');
    const body = rows.map(r => cols.map(c => escape(r[c as keyof typeof r])).join(',')).join('\n');
    return head + '\n' + body;
  };

  const downloadCSV = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            Reports Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddReport}
          >
            Create Report
          </Button>
        </Box>

        {/* Quick Access Reports */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Quick Access Reports
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            <Box>
              <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>Patient Visit Report</Typography>
                    <PeopleIcon />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Daily/weekly/monthly visit summary
                  </Typography>
                  <Button variant="contained" color="inherit" size="small" onClick={() => handleOpenQuickView('patientVisits')}>
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>Lab Test Report</Typography>
                    <ScienceIcon />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Performed tests and outcomes
                  </Typography>
                  <Button variant="contained" color="inherit" size="small" onClick={() => handleOpenQuickView('labTests')}>
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>Prescription Report</Typography>
                    <MedicationIcon />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Medicine issuance/usage
                  </Typography>
                  <Button variant="contained" color="inherit" size="small" onClick={() => handleOpenQuickView('prescriptions')}>
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>Inventory Report</Typography>
                    <InventoryIcon />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    Stock levels and alerts
                  </Typography>
                  <Button variant="contained" color="inherit" size="small" onClick={() => handleOpenQuickView('inventory')}>
                    View Report
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* Summary Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ReportIcon color="success" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {publishedReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Published Reports
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ReportIcon color="warning" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {draftReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Draft Reports
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ReportIcon color="info" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {reviewReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Under Review
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <ReportIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {reports.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reports
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {report.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.type}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {report.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{report.author}</TableCell>
                  <TableCell>
                    {new Date(report.created_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewReport(report.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {report.status === 'published' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditReport(report)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteReport(report.id)}
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

        {/* Quick View Dialog */}
        <Dialog open={quickViewOpen} onClose={handleCloseQuickView} maxWidth="md" fullWidth>
          <DialogTitle>
            {quickViewType === 'patientVisits' && 'Patient Visit Report'}
            {quickViewType === 'labTests' && 'Lab Test Report'}
            {quickViewType === 'prescriptions' && 'Prescription Report'}
            {quickViewType === 'inventory' && 'Inventory Report'}
          </DialogTitle>
          <DialogContent>
            {quickViewType === 'patientVisits' && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patientVisitsData.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>{r.patient}</TableCell>
                      <TableCell>{r.doctor}</TableCell>
                      <TableCell>{r.reason}</TableCell>
                      <TableCell>
                        <Chip size="small" color={r.status === 'Completed' ? 'success' : r.status === 'No Show' ? 'warning' : 'default'} label={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {quickViewType === 'labTests' && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Test</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Lab</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labTestsData.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>{r.patient}</TableCell>
                      <TableCell>{r.test}</TableCell>
                      <TableCell>{r.result}</TableCell>
                      <TableCell>{r.lab}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {quickViewType === 'prescriptions' && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Medicine</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Prescribed By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescriptionsData.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>{r.patient}</TableCell>
                      <TableCell>{r.medicine}</TableCell>
                      <TableCell>{r.qty}</TableCell>
                      <TableCell>{r.prescribedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {quickViewType === 'inventory' && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">In Stock</TableCell>
                    <TableCell align="right">Min Required</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryData.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{r.item}</TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell align="right">{r.inStock}</TableCell>
                      <TableCell align="right">{r.minRequired}</TableCell>
                      <TableCell>
                        <Chip size="small" color={r.status === 'OK' ? 'success' : r.status === 'Low' ? 'warning' : 'default'} label={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            {quickViewType && (
              <Button
                startIcon={<DownloadIcon />}
                onClick={() => {
                  let csv = '';
                  if (quickViewType === 'patientVisits') csv = toCSV(patientVisitsData);
                  if (quickViewType === 'labTests') csv = toCSV(labTestsData);
                  if (quickViewType === 'prescriptions') csv = toCSV(prescriptionsData);
                  if (quickViewType === 'inventory') csv = toCSV(inventoryData);
                  downloadCSV(`${quickViewType}-sample.csv`, csv);
                }}
              >
                Download CSV
              </Button>
            )}
            <Button onClick={handleCloseQuickView} variant="contained">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Add/Edit Report Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingReport ? 'Edit Report' : 'Create New Report'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Report Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Report Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="Patient Report">Patient Report</MenuItem>
                  <MenuItem value="Financial Report">Financial Report</MenuItem>
                  <MenuItem value="Lab Report">Lab Report</MenuItem>
                  <MenuItem value="Pharmacy Report">Pharmacy Report</MenuItem>
                  <MenuItem value="Appointment Report">Appointment Report</MenuItem>
                  <MenuItem value="Custom Report">Custom Report</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="review">Under Review</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveReport} variant="contained">
              {editingReport ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ReportsManagement;

