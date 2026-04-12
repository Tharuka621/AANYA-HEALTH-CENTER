import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  SvgIcon,
} from '@mui/material';
import {
  LocalHospital as VisitIcon,
  Science as LabIcon,
  Medication as PrescriptionIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { ReportType } from '../../../../types/reports';

interface ReportTypeCardProps {
  type: ReportType;
  title: string;
  description: string;
  filterChips: string[];
  onGenerate: (type: ReportType) => void;
}

const iconMap: Record<ReportType, typeof SvgIcon> = {
  PATIENT_VISIT: VisitIcon,
  LAB_TEST: LabIcon,
  PRESCRIPTION: PrescriptionIcon,
  INVENTORY: InventoryIcon,
  PHARMACY_PREDICTION: TrendingUpIcon,
};

const colorMap: Record<ReportType, string> = {
  PATIENT_VISIT: '#1976d2',
  LAB_TEST: '#9c27b0',
  PRESCRIPTION: '#2e7d32',
  INVENTORY: '#ed6c02',
  PHARMACY_PREDICTION: '#1565c0',
};

const ReportTypeCard: React.FC<ReportTypeCardProps> = ({
  type,
  title,
  description,
  filterChips,
  onGenerate,
}) => {
  const IconComponent = iconMap[type];
  const primaryColor = colorMap[type];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${primaryColor}15`,
              mr: 2,
            }}
          >
            <IconComponent sx={{ fontSize: 32, color: primaryColor }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, minHeight: 40 }}
        >
          {description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {filterChips.map((chip, index) => (
            <Chip
              key={index}
              label={chip}
              size="small"
              variant="outlined"
              sx={{
                borderColor: `${primaryColor}40`,
                color: primaryColor,
                fontSize: '0.75rem',
              }}
            />
          ))}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<TrendingUpIcon />}
          onClick={() => onGenerate(type)}
          sx={{
            bgcolor: primaryColor,
            borderRadius: '12px',
            textTransform: 'none',
            py: 1,
            fontWeight: 600,
            '&:hover': {
              bgcolor: primaryColor,
              filter: 'brightness(0.9)',
            },
          }}
        >
          Generate Report
        </Button>
      </CardActions>
    </Card>
  );
};

export default ReportTypeCard;
