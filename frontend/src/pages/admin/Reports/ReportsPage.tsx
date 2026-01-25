import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Grid,
  Tabs,
  Tab,
  Paper,
  Skeleton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  BarChart as InsightsIcon,
  TableChart as TableIcon,
} from '@mui/icons-material';
import {
  ReportType,
  GenerateReportPayload,
  ReportPreview,
  SavedReport,
  ReportFilters,
} from '../../../types/reports';
import {
  getSavedReports,
  generateReport,
  deleteReport,
  downloadReportPDF,
} from '../../../api/reports';
import ReportTypeCard from './components/ReportTypeCard';
import ReportFiltersComponent from './components/ReportFilters';
import ReportResultsTable from './components/ReportResultsTable';
import SavedReportsTable from './components/SavedReportsTable';
import GenerateReportDialog from './components/GenerateReportDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
};

const ReportsPage: React.FC = () => {
  // State management
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [reportPreview, setReportPreview] = useState<ReportPreview | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedReportsLoading, setSavedReportsLoading] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [dialogInitialType, setDialogInitialType] = useState<ReportType | undefined>();
  const [activeTab, setActiveTab] = useState(0);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Load saved reports on mount
  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    setSavedReportsLoading(true);
    try {
      const reports = await getSavedReports();
      setSavedReports(reports);
    } catch (error) {
      showSnackbar('Failed to load saved reports', 'error');
    } finally {
      setSavedReportsLoading(false);
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'info' = 'success'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleGenerateFromCard = (type: ReportType) => {
    setDialogInitialType(type);
    setGenerateDialogOpen(true);
  };

  const handleGenerateReport = async (payload: GenerateReportPayload) => {
    setLoading(true);
    try {
      const preview = await generateReport(payload);
      setReportPreview(preview);
      setSelectedReportType(payload.type);
      setActiveTab(0); // Switch to Preview tab
      showSnackbar('Report generated successfully', 'success');
      loadSavedReports(); // Refresh saved reports
    } catch (error) {
      showSnackbar('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async (filters: ReportFilters) => {
    if (!selectedReportType) return;

    setLoading(true);
    try {
      const preview = await generateReport({
        type: selectedReportType,
        title: `${selectedReportType} Report`,
        filters,
      });
      setReportPreview(preview);
      setActiveTab(0);
      showSnackbar('Filters applied successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to apply filters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setReportPreview(null);
    showSnackbar('Filters reset', 'info');
  };

  const handleRefresh = () => {
    if (selectedReportType && reportPreview) {
      handleApplyFilters(reportPreview.data as any);
    } else {
      loadSavedReports();
    }
    showSnackbar('Data refreshed', 'info');
  };

  const handleExport = () => {
    if (!reportPreview) return;
    showSnackbar('Export functionality will be implemented', 'info');
  };

  const handleViewSavedReport = async (report: SavedReport) => {
    setLoading(true);
    try {
      const preview = await generateReport({
        type: report.type,
        title: report.title,
        filters: { dateFrom: null, dateTo: null, groupBy: 'daily', outputFormat: 'table' },
      });
      setReportPreview(preview);
      setSelectedReportType(report.type);
      setActiveTab(0);
      showSnackbar('Report loaded successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to load report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSavedReport = async (report: SavedReport) => {
    try {
      await downloadReportPDF(report.id);
      showSnackbar('Report downloaded as PDF', 'success');
    } catch (error) {
      showSnackbar('Failed to download report', 'error');
    }
  };

  const handleEditReport = (_report: SavedReport) => {
    showSnackbar('Edit functionality will be implemented', 'info');
  };

  const handleDeleteReport = async (report: SavedReport) => {
    try {
      await deleteReport(report.id);
      await loadSavedReports();
      showSnackbar('Report deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete report', 'error');
    }
  };

  const reportTypeData = [
    {
      type: 'PATIENT_VISIT' as ReportType,
      title: 'Patient Visits',
      description: 'Track patient visits, vitals, and appointment details',
      filterChips: ['Daily', 'Weekly', 'Monthly'],
    },
    {
      type: 'LAB_TEST' as ReportType,
      title: 'Lab Tests',
      description: 'Analyze lab orders, results, and completion status',
      filterChips: ['By Test Type', 'By Status', 'By Technician'],
    },
    {
      type: 'PRESCRIPTION' as ReportType,
      title: 'Prescriptions',
      description: 'Review prescribed medicines and issued quantities',
      filterChips: ['By Doctor', 'By Medicine', 'Issued Only'],
    },
    {
      type: 'INVENTORY' as ReportType,
      title: 'Inventory',
      description: 'Monitor stock levels, low stock alerts, and expiry dates',
      filterChips: ['Low Stock', 'Expiring Soon', 'By Medicine'],
    },
  ];

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Reports
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Generate clinical and operational reports for Aanya Health Center
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <RefreshIcon />
              </IconButton>

              <IconButton
                onClick={handleExport}
                disabled={!reportPreview}
                sx={{
                  bgcolor: 'white',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <ExportIcon />
              </IconButton>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setDialogInitialType(undefined);
                  setGenerateDialogOpen(true);
                }}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Generate Report
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Report Type Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {reportTypeData.map((report) => (
            <Grid item xs={12} sm={6} md={3} key={report.type}>
              <ReportTypeCard
                type={report.type}
                title={report.title}
                description={report.description}
                filterChips={report.filterChips}
                onGenerate={handleGenerateFromCard}
              />
            </Grid>
          ))}
        </Grid>

        {/* Filters Section */}
        <ReportFiltersComponent
          reportType={selectedReportType}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />

        {/* Results Section */}
        {selectedReportType && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              mb: 4,
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ px: 2 }}
              >
                <Tab
                  icon={<TableIcon />}
                  iconPosition="start"
                  label="Preview"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
                <Tab
                  icon={<InsightsIcon />}
                  iconPosition="start"
                  label="Insights"
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              {loading ? (
                <Box sx={{ p: 3 }}>
                  <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                </Box>
              ) : (
                <Box sx={{ p: 3 }}>
                  <ReportResultsTable
                    reportType={selectedReportType}
                    data={reportPreview?.data || []}
                    loading={loading}
                    onView={(row) => console.log('View:', row)}
                    onDownloadPDF={() => showSnackbar('PDF download started', 'info')}
                    onDownloadCSV={() => showSnackbar('CSV download started', 'info')}
                  />
                </Box>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <InsightsIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Chart Insights Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visual analytics and trends will be available in the next update
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        )}

        {/* Saved Reports Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Saved Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            View and manage previously generated reports
          </Typography>

          {savedReportsLoading ? (
            <Box>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Box>
          ) : (
            <SavedReportsTable
              reports={savedReports}
              loading={savedReportsLoading}
              onView={handleViewSavedReport}
              onDownload={handleDownloadSavedReport}
              onEdit={handleEditReport}
              onDelete={handleDeleteReport}
            />
          )}
        </Box>

        {/* Generate Report Dialog */}
        <GenerateReportDialog
          open={generateDialogOpen}
          onClose={() => {
            setGenerateDialogOpen(false);
            setDialogInitialType(undefined);
          }}
          onGenerate={handleGenerateReport}
          initialReportType={dialogInitialType}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: '12px' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ReportsPage;
