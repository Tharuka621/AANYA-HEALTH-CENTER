import React, { useState } from "react";
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
  Print as PrintIcon,
} from "@mui/icons-material";

const LabReports: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Mock lab reports data
  const labReports = [
    {
      id: "1",
      test_name: "Complete Blood Count",
      test_type: "Blood Test",
      requested_date: "2024-12-15",
      completed_date: "2024-12-16",
      status: "completed",
      doctor: "Dr. Milinda Abeykoon",
      notes: "All values within normal range",
      result_url: "/reports/cbc_report.pdf",
      values: {
        Hemoglobin: "14.2 g/dL",
        "White Blood Cells": "7.2 x 10³/μL",
        Platelets: "280 x 10³/μL",
        "Red Blood Cells": "4.5 x 10⁶/μL",
      },
    },
    {
      id: "2",
      test_name: "Lipid Profile",
      test_type: "Blood Test",
      requested_date: "2024-12-10",
      completed_date: "2024-12-11",
      status: "completed",
      doctor: "Dr. Milinda Abeykoon",
      notes: "Cholesterol levels slightly elevated",
      result_url: "/reports/lipid_report.pdf",
      values: {
        "Total Cholesterol": "220 mg/dL",
        "HDL Cholesterol": "45 mg/dL",
        "LDL Cholesterol": "150 mg/dL",
        Triglycerides: "180 mg/dL",
      },
    },
    {
      id: "3",
      test_name: "Urine Analysis",
      test_type: "Urine Test",
      requested_date: "2024-12-08",
      completed_date: null,
      status: "in_progress",
      doctor: "Dr. Milinda Abeykoon",
      notes: "Test in progress",
      result_url: null,
      values: null,
    },
    {
      id: "4",
      test_name: "Thyroid Function Test",
      test_type: "Blood Test",
      requested_date: "2024-12-05",
      completed_date: "2024-12-06",
      status: "completed",
      doctor: "Dr. Milinda Abeykoon",
      notes: "Normal thyroid function",
      result_url: "/reports/thyroid_report.pdf",
      values: {
        TSH: "2.1 mIU/L",
        "Free T4": "1.2 ng/dL",
        "Free T3": "3.1 pg/mL",
      },
    },
  ];

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

  const handleDownloadReport = (reportId: string) => {
    console.log("Download report:", reportId);
    // In a real app, this would download the report
  };

  const handlePrintReport = (reportId: string) => {
    console.log("Print report:", reportId);
    // In a real app, this would open print dialog
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
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => console.log("Download all reports")}
            >
              Download All
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => console.log("Print all reports")}
            >
              Print All
            </Button>
          </Box>
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
                    {new Date(report.requested_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {report.completed_date
                      ? new Date(report.completed_date).toLocaleDateString()
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
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handlePrintReport(report.id)}
                          >
                            <PrintIcon />
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
                    {new Date(
                      selectedReport.requested_date
                    ).toLocaleDateString()}
                  </Typography>
                  {selectedReport.completed_date && (
                    <Typography variant="body2">
                      Completed Date:{" "}
                      {new Date(
                        selectedReport.completed_date
                      ).toLocaleDateString()}
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
                  onClick={() => handleDownloadReport(selectedReport.id)}
                >
                  Download Report
                </Button>
              )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LabReports;
