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
import html2canvas from 'html2canvas';
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
  getReportPreview,
  deleteReport,
  downloadReportPDF,
  downloadReportCSV,
} from '../../../api/reports';
import ReportTypeCard from './components/ReportTypeCard';
import ReportFiltersComponent from './components/ReportFilters';
import ReportResultsTable from './components/ReportResultsTable';
import SavedReportsTable from './components/SavedReportsTable';
import GenerateReportDialog from './components/GenerateReportDialog';
import ReportInsights from './components/ReportInsights';

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
  const [lastPayload, setLastPayload] = useState<GenerateReportPayload | null>(null);
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
      setLastPayload(payload);
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
      setLastPayload({
        type: selectedReportType,
        title: `${selectedReportType} Report`,
        filters,
      });
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
    setLastPayload(null);
    showSnackbar('Filters reset', 'info');
  };

  const handleRefresh = async () => {
    if (lastPayload) {
      setLoading(true);
      try {
        const preview = await generateReport(lastPayload);
        setReportPreview(preview);
        showSnackbar('Data refreshed', 'info');
        await loadSavedReports();
      } catch (error) {
        showSnackbar('Failed to refresh report', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      loadSavedReports();
      showSnackbar('Saved reports refreshed', 'info');
    }
  };

  const captureCharts = async () => {
    const chartIds = [
      'chart-visits-doctor', 'chart-visit-status',
      'chart-ordered-tests', 'chart-test-results',
      'chart-top-medicines', 'chart-prescription-doctor',
      'chart-predicted-demand', 'chart-inventory-status',
      'chart-stock-health', 'chart-low-stock'
    ];
    
    const images: string[] = [];
    for (const id of chartIds) {
      const el = document.getElementById(id);
      if (el) {
        try {
          const canvas = await html2canvas(el, {
            scale: 2,
            logging: false,
            useCORS: true,
            backgroundColor: '#ffffff'
          });
          images.push(canvas.toDataURL('image/png'));
        } catch (err) {
          console.error(`Failed to capture chart ${id}:`, err);
        }
      }
    }
    return images;
  };

  const handleExport = async (format: 'PDF' | 'CSV' = 'PDF') => {
    if (!reportPreview) return;
    setLoading(true);
    try {
      if (format === 'PDF') {
        const chartImages = await captureCharts();
        await downloadReportPDF(reportPreview.reportId, chartImages);
        showSnackbar(
          chartImages.length > 0 
            ? 'Report with charts downloaded as PDF' 
            : 'Report downloaded as PDF (Insights tab was not active)', 
          'success'
        );
      } else {
        await downloadReportCSV(reportPreview.reportId);
        showSnackbar('Report downloaded as CSV', 'success');
      }
    } catch (error) {
      showSnackbar(`Failed to export report as ${format}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    setLoading(true);
    try {
      const chartImages = await captureCharts();
      await downloadReportPDF(id, chartImages);
      showSnackbar('Report downloaded as PDF', 'success');
    } catch (error) {
      showSnackbar('Failed to download PDF', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async (id: string) => {
    try {
      await downloadReportCSV(id);
      showSnackbar('Report downloaded as CSV', 'success');
    } catch (error) {
      showSnackbar('Failed to download CSV', 'error');
    }
  };

  const handleViewSavedReport = async (report: SavedReport) => {
    setLoading(true);
    try {
      const preview = await getReportPreview(report.id);
      setReportPreview(preview);
      setSelectedReportType(report.type);
      setLastPayload(null);
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
    {
      type: 'PHARMACY_PREDICTION' as ReportType,
      title: 'Pharmacy Prediction',
      description: 'Forecast medicine demand and recommend order quantities',
      filterChips: ['Critical Restock', 'Restock Needed', 'Adequate'],
    },
    {
      type: 'PHARMACY_PROFITABILITY' as ReportType,
      title: 'Pharmacy Profitability',
      description: 'Analyze revenue, cost, and profit margins for dispensed medicines',
      filterChips: ['By Medicine', 'By Category'],
    },
    {
      type: 'PEAK_CLINIC_HOURS' as ReportType,
      title: 'Peak Clinic Hours',
      description: 'Identify busiest clinic hours to optimize staff scheduling',
      filterChips: ['By Time of Day'],
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
                onClick={() => handleExport('PDF')}
                disabled={!reportPreview}
                title="Download PDF"
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
                    onDownloadPDF={() => handleDownloadPDF(reportPreview!.reportId)}
                    onDownloadCSV={() => handleDownloadCSV(reportPreview!.reportId)}
                  />
                </Box>
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <ReportInsights
                reportType={selectedReportType}
                reportPreview={reportPreview}
              />
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
