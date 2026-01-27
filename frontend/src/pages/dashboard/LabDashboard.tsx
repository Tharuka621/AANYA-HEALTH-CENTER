import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Science as LabIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Description as ReportIcon,
  Person as PersonIcon,
  LocalHospital,
  CalendarToday,
  Close,
  PlayArrow,
} from '@mui/icons-material';
import {
  getPendingLabOrderItems,
  getCompletedLabOrderItems,
  updateOrderItemStatus,
  addLabResult,
  updateLabOrderStatus,
} from '../../mock/labMock';
import { LabOrderItemWithDetails } from '../../types/lab';

const LabDashboard: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LabOrderItemWithDetails | null>(null);
  const [resultText, setResultText] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);

  // Get data from mock database
  const pendingItems = getPendingLabOrderItems();
  const completedItems = getCompletedLabOrderItems();

  const stats = {
    pending: pendingItems.length,
    inProgress: pendingItems.filter(item => item.order_status === 'IN_PROGRESS').length,
    completed: completedItems.length,
  };

  const handleStartTest = (item: LabOrderItemWithDetails) => {
    // Update order status to IN_PROGRESS
    updateLabOrderStatus(item.lab_order_id, 'IN_PROGRESS');
    window.location.reload(); // Refresh to show updated status
  };

  const handleUploadClick = (item: LabOrderItemWithDetails) => {
    setSelectedItem(item);
    setUploadModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReportFile(event.target.files[0]);
    }
  };

  const handleSubmitResults = () => {
    if (!selectedItem) return;

    // Create file URL if file exists
    const fileUrl = reportFile ? URL.createObjectURL(reportFile) : null;
    
    // Add lab result to database
    addLabResult(selectedItem.id, resultText || null, fileUrl);

    // Update item status to DONE (will auto-complete order if all items done)
    updateOrderItemStatus(selectedItem.id, 'DONE');

    // Close dialog and reset
    setUploadModalOpen(false);
    setResultText('');
    setReportFile(null);
    setSelectedItem(null);
  };

  const handleCancelUpload = () => {
    setUploadModalOpen(false);
    setSelectedItem(null);
    setResultText('');
    setReportFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDERED':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Lab Technician Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Process lab test orders and upload results
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700} color="white">
                      {stats.pending}
                    </Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.9)">
                      Pending Tests
                    </Typography>
                  </Box>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #939dfb 0%, #2f40c3 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700} color="white">
                      {stats.inProgress}
                    </Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.9)">
                      In Progress
                    </Typography>
                  </Box>
                  <LabIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #3d58f3 0%, #e1e2ff 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700} color="white">
                      {stats.completed}
                    </Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.9)">
                      Completed Today
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Lab Tests Table */}
          <Grid item xs={12}>
            <Card>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ScheduleIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                    Pending Lab Tests ({stats.pending})
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                {pendingItems.length > 0 ? (
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell><strong>Appointment No</strong></TableCell>
                          <TableCell><strong>Patient</strong></TableCell>
                          <TableCell><strong>Test Name</strong></TableCell>
                          <TableCell><strong>Test Type</strong></TableCell>
                          <TableCell><strong>Doctor</strong></TableCell>
                          <TableCell><strong>Requested Date</strong></TableCell>
                          <TableCell><strong>Order Status</strong></TableCell>
                          <TableCell align="center"><strong>Action</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pendingItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Chip 
                                label={item.appointment_no} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {item.patient_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.patient_phone}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.test_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={item.test_type} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocalHospital fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {item.doctor_name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarToday fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {formatDate(item.requested_date)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.order_status}
                                size="small"
                                color={getStatusColor(item.order_status) as any}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" gap={1} justifyContent="center">
                                {item.order_status === 'ORDERED' && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="info"
                                    startIcon={<PlayArrow />}
                                    onClick={() => handleStartTest(item)}
                                  >
                                    Start Test
                                  </Button>
                                )}
                                {item.order_status === 'IN_PROGRESS' && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(item)}
                                  >
                                    Upload Result
                                  </Button>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box textAlign="center" py={6}>
                    <ScheduleIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No pending lab tests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All tests have been processed
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Tests Table */}
          <Grid item xs={12}>
            <Card>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #4191d8 0%, #00f2fe 100%)',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircleIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                    Completed Tests ({completedItems.length})
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                {completedItems.length > 0 ? (
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell><strong>Appointment No</strong></TableCell>
                          <TableCell><strong>Patient</strong></TableCell>
                          <TableCell><strong>Test Name</strong></TableCell>
                          <TableCell><strong>Test Type</strong></TableCell>
                          <TableCell><strong>Doctor</strong></TableCell>
                          <TableCell><strong>Requested Date</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {completedItems.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Chip 
                                label={item.appointment_no} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {item.patient_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.patient_phone}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {item.test_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={item.test_type} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocalHospital fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {item.doctor_name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <CalendarToday fontSize="small" color="action" />
                                <Typography variant="body2">
                                  {formatDate(item.requested_date)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip label="DONE" size="small" color="success" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box textAlign="center" py={6}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No completed tests yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Result Modal */}
        <Dialog open={uploadModalOpen} onClose={handleCancelUpload} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <UploadIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Upload Lab Test Result
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleCancelUpload}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {selectedItem && (
              <Box>
                {/* Test Details */}
                <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Test Name
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedItem.test_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Patient
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedItem.patient_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Doctor
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedItem.doctor_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Test Type
                        </Typography>
                        <Chip label={selectedItem.test_type} size="small" />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Result Text */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Test Results (Text)"
                  placeholder="Enter test results, values, and observations..."
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {/* File Upload */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Upload Report File (Optional)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ReportIcon />}
                    fullWidth
                  >
                    {reportFile ? reportFile.name : 'Choose File (PDF, DOC, DOCX)'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCancelUpload} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResults}
              variant="contained"
              startIcon={<CheckCircleIcon />}
              disabled={!resultText && !reportFile}
            >
              Submit Result
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LabDashboard;
