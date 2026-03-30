import React, { useState } from "react";
import { format } from 'date-fns';
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
  Alert,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Science as ScienceIcon,
} from "@mui/icons-material";
import { axiosInstance } from "../../services/api";

const LabReports: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const [labReports, setLabReports] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchLabReports = async () => {
      try {
        const response = await axiosInstance.get('/lab/patient/lab-orders');
        setLabReports(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch lab reports', error);
      }
    };
    fetchLabReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setOpenDialog(true);
  };

  const handleDownloadReport = (resultUrl: string) => {
    if (!resultUrl) return;
    // Construct the full URL — result_url is relative like /uploads/lab-reports/filename.pdf
    const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
    const fullUrl = resultUrl.startsWith('http') ? resultUrl : `${baseUrl}${resultUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const completedReports = labReports.filter(
    (r) => r.status === "completed"
  ).length;
  const pendingReports = labReports.filter(
    (r) => r.status === "in_progress"
  ).length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" fontWeight={700}>
            My Lab Reports
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Completed Reports: {completedReports}
            </Typography>
          </Alert>
          <Alert severity="warning" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Pending Reports: {pendingReports}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Name</TableCell>
                <TableCell>Test Type</TableCell>
                <TableCell>Requested Date</TableCell>
                <TableCell>Completed Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {labReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <ScienceIcon color="primary" />
                      <Typography variant="body2" fontWeight={600}>
                        {report.test_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.test_type}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(report.requested_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {report.completed_date
                      ? format(new Date(report.completed_date), 'dd/MM/yyyy')
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{report.doctor}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewReport(report)}
                      >
                        <ViewIcon />
                      </IconButton>
                      {report.status === "completed" && report.result_url && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            title="Download PDF"
                            onClick={() => handleDownloadReport(report.result_url)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Report Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Lab Report Details</DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Box sx={{ pt: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <ScienceIcon color="primary" />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedReport.test_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedReport.test_type} - Requested by{" "}
                      {selectedReport.doctor}
                    </Typography>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Test Information
                  </Typography>
                  <Typography variant="body2">
                    Requested Date:{" "}
                    {format(new Date(
                      selectedReport?.requested_date
                    ), 'dd/MM/yyyy')}
                  </Typography>
                  {selectedReport.completed_date && (
                    <Typography variant="body2">
                      Completed Date:{" "}
                      {format(new Date(
                        selectedReport.completed_date
                      ), 'dd/MM/yyyy')}
                    </Typography>
                  )}
                  <Box mt={1}>
                    <Chip
                      label={selectedReport.status}
                      color={getStatusColor(selectedReport.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                {selectedReport.values && (
                  <Box mb={2}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                    >
                      Test Results
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Parameter</TableCell>
                            <TableCell>Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(
                            selectedReport.values as Record<string, string>
                          ).map(([parameter, value]) => (
                            <TableRow key={parameter}>
                              <TableCell>{parameter}</TableCell>
                              <TableCell>{value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedReport.notes}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            {selectedReport?.status === "completed" &&
              selectedReport?.result_url && (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadReport(selectedReport.result_url)}
                >
                  Download PDF Report
                </Button>
              )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LabReports;
