import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Rating
} from '@mui/material';
import { Person as PersonIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { User } from '../../types';

interface DoctorCardProps {
  doctor: User;
  onBookAppointment?: (doctor: User) => void;
  showRating?: boolean;
  rating?: number;
  specialization?: string;
  experience?: string;
  consultationFee?: number;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBookAppointment,
  showRating = true,
  rating = 4.5,
  specialization = 'General Medicine',
  experience = '5+ years',
  consultationFee = 50,
}) => {
  const handleBookAppointment = () => {
    if (onBookAppointment) {
      onBookAppointment(doctor);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ position: 'relative', p: 2, pb: 0 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>
          
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {doctor.full_name}
            </Typography>
            
            <Chip
              label={specialization}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            
            {showRating && (
              <Box display="flex" alignItems="center" gap={1}>
                <Rating value={rating} precision={0.1} size="small" readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({rating})
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, pt: 1 }}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {experience} experience
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Consultation Fee: ${consultationFee}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Phone: {doctor.phone}
          </Typography>
        </Box>
      </CardContent>

      {onBookAppointment && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleBookAppointment}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Book Appointment
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default DoctorCard;

