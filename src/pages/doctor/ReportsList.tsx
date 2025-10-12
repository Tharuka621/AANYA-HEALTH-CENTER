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
  Assessment as ReportIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

const ReportsList: React.FC = () => {
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
      title: 'Patient John Doe - Medical Summary',
      type: 'Patient Report',
      description: 'Comprehensive medical summary for John Doe',
      status: 'published',
      created_date: '2024-12-15',
      patient: 'John Doe',
    },
    {
      id: '2',
      title: 'Diabetes Management Report',
      type: 'Treatment Report',
      description: 'Diabetes treatment progress and recommendations',
      status: 'published',
      created_date: '2024-12-16',
      patient: 'Multiple Patients',
    },
    {
      id: '3',
      title: 'Monthly Patient Statistics',
      type: 'Statistical Report',
      description: 'Patient demographics and visit statistics',
      status: 'draft',
      created_date: '2024-12-18',
      patient: 'All Patients',
    },
    {
      id: '4',
      title: 'Prescription Audit Report',
      type: 'Audit Report',
      description: 'Review of prescriptions issued this month',
      status: 'review',
      created_date: '2024-12-19',
      patient: 'All Patients',
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            My Reports
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
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Published Reports: {publishedReports}
            </Typography>
          </Alert>
          <Alert severity="warning" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Draft Reports: {draftReports}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Patient</TableCell>
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
                  <TableCell>{report.patient}</TableCell>
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
                  <MenuItem value="Treatment Report">Treatment Report</MenuItem>
                  <MenuItem value="Statistical Report">Statistical Report</MenuItem>
                  <MenuItem value="Audit Report">Audit Report</MenuItem>
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

export default ReportsList;

