import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Science as LabIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Description as ReportIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const LabDashboard: React.FC = () => {
  const { user } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);

  // Mock data
  const pendingTests = [
    {
      id: '1',
      patient: 'John Doe',
      doctor: 'Dr. Sarah Wilson',
      test_name: 'Complete Blood Count',
      requested_date: '2024-12-15',
      status: 'requested',
    },
    {
      id: '2',
      patient: 'Alice Smith',
      doctor: 'Dr. Sarah Wilson',
      test_name: 'Lipid Profile',
      requested_date: '2024-12-14',
      status: 'requested',
    },
  ];

  const completedTests = [
    {
      id: '3',
      patient: 'Bob Johnson',
      doctor: 'Dr. Sarah Wilson',
      test_name: 'Blood Sugar Test',
      completed_date: '2024-12-16',
      status: 'completed',
      report_url: '/reports/blood-sugar-001.pdf',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleUploadResult = (test: any) => {
    setSelectedTest(test);
    setUploadModalOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReportFile(file);
    }
  };

  const handleSubmitUpload = () => {
    if (selectedTest && reportFile) {
      console.log('Uploading report for test:', selectedTest.id, 'File:', reportFile.name);
      // In a real app, this would upload the file and update the test status
      setUploadModalOpen(false);
      setSelectedTest(null);
      setReportFile(null);
    }
  };

  const handleCancelUpload = () => {
    setUploadModalOpen(false);
    setSelectedTest(null);
    setReportFile(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome, {user?.full_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage lab test requests and upload results.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      24
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tests Today
                    </Typography>
                  </Box>
                  <LabIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {pendingTests.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Tests
                    </Typography>
                  </Box>
                  <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {completedTests.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Today
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      18
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reports Generated
                    </Typography>
                  </Box>
                  <ReportIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Lab Tests */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Pending Lab Tests
                  </Typography>
                  <LabIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {pendingTests.length > 0 ? (
                  <List>
                    {pendingTests.map((test, index) => (
                      <React.Fragment key={test.id}>
                        <ListItem>
                          <ListItemIcon>
                            <LabIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {test.test_name}
                                </Typography>
                                <Chip
                                  label={test.status}
                                  size="small"
                                  color={getStatusColor(test.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Patient: {test.patient}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Doctor: {test.doctor}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Requested: {new Date(test.requested_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<UploadIcon />}
                            onClick={() => handleUploadResult(test)}
                          >
                            Upload Result
                          </Button>
                        </ListItem>
                        {index < pendingTests.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No pending lab tests at the moment.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Tests */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Completed Tests
                  </Typography>
                  <CheckCircleIcon color="primary" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                {completedTests.length > 0 ? (
                  <List>
                    {completedTests.map((test, index) => (
                      <React.Fragment key={test.id}>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {test.test_name}
                                </Typography>
                                <Chip
                                  label={test.status}
                                  size="small"
                                  color={getStatusColor(test.status)}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Patient: {test.patient}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Doctor: {test.doctor}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Completed: {new Date(test.completed_date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ReportIcon />}
                            href={test.report_url}
                            target="_blank"
                          >
                            View Report
                          </Button>
                        </ListItem>
                        {index < completedTests.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No completed tests found.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Modal */}
        <Dialog open={uploadModalOpen} onClose={handleCancelUpload} maxWidth="sm" fullWidth>
          <DialogTitle>Upload Lab Test Result</DialogTitle>
          <DialogContent>
            {selectedTest && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Test:</strong> {selectedTest.test_name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Patient:</strong> {selectedTest.patient}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Doctor:</strong> {selectedTest.doctor}
                </Typography>
                
                <Box mt={3}>
                  <TextField
                    fullWidth
                    type="file"
                    label="Upload Report"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ accept: '.pdf,.doc,.docx' }}
                    onChange={handleFileUpload}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelUpload}>Cancel</Button>
            <Button
              onClick={handleSubmitUpload}
              variant="contained"
              disabled={!reportFile}
            >
              Upload Result
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LabDashboard;
