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
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
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

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
        </Grid>

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

