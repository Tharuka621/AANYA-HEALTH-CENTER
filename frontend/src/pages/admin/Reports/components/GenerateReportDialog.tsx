import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Radio,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { ReportType, GenerateReportPayload, ReportFilters } from '../../../../types/reports';

interface GenerateReportDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (payload: GenerateReportPayload) => Promise<void>;
  initialReportType?: ReportType;
}

const steps = ['Select Report Type', 'Set Filters', 'Review & Generate'];

// Static report catalog displayed in Step 1 of the wizard.
const reportTypes: Array<{
  type: ReportType;
  title: string;
  description: string;
}> = [
  {
    type: 'PATIENT_VISIT',
    title: 'Patient Visit Report',
    description: 'Track patient visits, vitals, and appointments',
  },
  {
    type: 'LAB_TEST',
    title: 'Lab Test Report',
    description: 'Analyze lab orders, results, and status',
  },
  {
    type: 'PRESCRIPTION',
    title: 'Prescription Report',
    description: 'Review prescribed and issued medications',
  },
  {
    type: 'INVENTORY',
    title: 'Inventory Report',
    description: 'Monitor stock levels, expiry, and reorder alerts',
  },
  {
    type: 'PHARMACY_PREDICTION',
    title: 'Pharmacy Prediction',
    description: 'Forecast medicine demand and recommend order quantities',
  },
];

const GenerateReportDialog: React.FC<GenerateReportDialogProps> = ({
  open,
  onClose,
  onGenerate,
  initialReportType,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState<ReportType | null>(
    initialReportType || null
  );
  const [reportTitle, setReportTitle] = useState('');
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [outputFormat, setOutputFormat] = useState<'table' | 'summary'>('table');
  const [generating, setGenerating] = useState(false);

  // If the dialog is opened from a specific report card, skip type selection.
  React.useEffect(() => {
    if (initialReportType) {
      setSelectedType(initialReportType);
      setActiveStep(1);
    }
  }, [initialReportType]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedType(initialReportType || null);
    setReportTitle('');
    setGroupBy('daily');
    setOutputFormat('table');
    setGenerating(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Builds a minimal payload; detailed filters are applied in the main page filter panel.
  const handleGenerate = async () => {
    if (!selectedType) return;

    const filters: ReportFilters = {
      dateFrom: null,
      dateTo: null,
      groupBy,
      outputFormat,
    };

    const payload: GenerateReportPayload = {
      type: selectedType,
      title: reportTitle || `${selectedType} Report`,
      filters,
    };

    setGenerating(true);
    try {
      await onGenerate(payload);
      handleClose();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Guards Next/Generate actions per wizard step requirements.
  const isStepValid = (): boolean => {
    switch (activeStep) {
      case 0:
        return selectedType !== null;
      case 1:
        return true; // Filters are optional
      case 2:
        return reportTitle.trim().length > 0;
      default:
        return false;
    }
  };

  // Renders the form fragment for the current wizard step.
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            {reportTypes.map((report) => (
              <Grid item xs={12} sm={6} key={report.type}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: '12px',
                    border: selectedType === report.type ? 2 : 1,
                    borderColor:
                      selectedType === report.type ? 'primary.main' : 'divider',
                  }}
                >
                  <CardActionArea
                    onClick={() => setSelectedType(report.type)}
                    sx={{ p: 2 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Radio
                        checked={selectedType === report.type}
                        value={report.type}
                        sx={{ mr: 1 }}
                      />
                      <CardContent sx={{ flex: 1, p: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {report.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {report.description}
                        </Typography>
                      </CardContent>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configure basic filters for the report. Advanced filters can be set after
              generation.
            </Typography>

            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Group By</InputLabel>
                  <Select
                    value={groupBy}
                    label="Group By"
                    onChange={(e) =>
                      setGroupBy(e.target.value as 'daily' | 'weekly' | 'monthly')
                    }
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Output Format</InputLabel>
                  <Select
                    value={outputFormat}
                    label="Output Format"
                    onChange={(e) =>
                      setOutputFormat(e.target.value as 'table' | 'summary')
                    }
                  >
                    <MenuItem value="table">Table</MenuItem>
                    <MenuItem value="summary">Summary</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              label="Report Title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g., Monthly Patient Visit Analysis"
              required
              sx={{ mb: 3 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Review Configuration
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 120 }}
                >
                  Report Type:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {
                    reportTypes.find((r) => r.type === selectedType)?.title || 'N/A'
                  }
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 120 }}
                >
                  Group By:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 1.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ minWidth: 120 }}
                >
                  Output:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {outputFormat.charAt(0).toUpperCase() + outputFormat.slice(1)}
                </Typography>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReportIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Generate New Report
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 0.5 }}
          color="inherit"
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: 'none', borderRadius: '10px' }}
        >
          Cancel
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            startIcon={<BackIcon />}
            sx={{ textTransform: 'none', borderRadius: '10px', mr: 1 }}
          >
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<NextIcon />}
            disabled={!isStepValid()}
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={!isStepValid() || generating}
            startIcon={
              generating ? <CircularProgress size={16} color="inherit" /> : <ReportIcon />
            }
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GenerateReportDialog;
