import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Rating,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Description as PrescriptionIcon,
  Science as LabIcon,
  LocalPharmacy as PharmacyIcon,
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Modal from '../components/common/Modal';
import DoctorCard from '../components/common/DoctorCard';
import AppointmentModal from '../components/common/AppointmentModal';
import { User } from '../types';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);

  // Single doctor data
  const doctors: User[] = [
    {
      id: '1',
      email: 'doctor@aanya.com',
      full_name: 'Dr. Sarah Wilson',
      role: 'doctor',
      phone: '+1234567891',
      created_at: '2024-01-01T00:00:00Z'
    },
  ];

  const features = [
    {
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      title: 'Online Appointments',
      description: 'Book appointments with our qualified doctors online. Easy scheduling and reminders.',
      color: 'primary.main',
    },
    {
      icon: <PrescriptionIcon sx={{ fontSize: 40 }} />,
      title: 'E-Prescriptions',
      description: 'Digital prescriptions sent directly to your pharmacy. No more paper prescriptions.',
      color: 'success.main',
    },
    {
      icon: <LabIcon sx={{ fontSize: 40 }} />,
      title: 'Lab Reports',
      description: 'Access your lab results online. Secure and convenient digital reports.',
      color: 'warning.main',
    },
    {
      icon: <PharmacyIcon sx={{ fontSize: 40 }} />,
      title: 'Pharmacy Integration',
      description: 'Integrated pharmacy services with medication delivery and inventory management.',
      color: 'secondary.main',
    },
  ];

  const handleBookAppointment = (doctor: User) => {
    setSelectedDoctor(doctor);
    setAppointmentModalOpen(true);
  };

  const handleAppointmentConfirm = (appointmentData: any) => {
    console.log('Appointment booked:', appointmentData);
    setAppointmentModalOpen(false);
    setSelectedDoctor(null);
    // In a real app, you would call the API to create the appointment
  };

  const handleAppointmentCancel = () => {
    setAppointmentModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h2" fontWeight={700} gutterBottom>
                  Aanya Health Center
                </Typography>
                <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                  Your Health, Our Priority
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Experience comprehensive healthcare services with modern technology and compassionate care. 
                  Book appointments, access prescriptions, and manage your health records all in one place.
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'grey.100',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/signup"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="center">
                <Avatar
                  sx={{
                    width: 300,
                    height: 300,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <MedicalIcon sx={{ fontSize: 120, color: 'white' }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Search Section */}
      <Box sx={{ py: 4, backgroundColor: 'background.default' }}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Find Your Doctor
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Search for doctors by name, specialization, or location
            </Typography>
          </Box>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search doctors, specializations, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Why Choose Aanya Health Center?
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
              We provide comprehensive healthcare services with modern technology and compassionate care
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: `${feature.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Doctors Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Our Expert Doctor
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
              Meet our experienced healthcare professional dedicated to your well-being
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {doctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                <DoctorCard
                  doctor={doctor}
                  onBookAppointment={handleBookAppointment}
                  specialization="General Medicine"
                  experience="5+ years"
                  consultationFee={50}
                  rating={4.8}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 8, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Get in Touch
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                Have questions or need assistance? We're here to help you with all your healthcare needs.
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <PhoneIcon />
                  <Typography>+1 (234) 567-890</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <EmailIcon />
                  <Typography>info@aanyahealth.com</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <LocationIcon />
                  <Typography>123 Health Street, Medical City, MC 12345</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <TimeIcon />
                  <Typography>Mon-Fri: 8:00 AM - 6:00 PM</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Emergency Services
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                  For medical emergencies, please call our 24/7 emergency hotline:
                </Typography>
                <Typography variant="h4" fontWeight={700} color="error.light">
                  911
                </Typography>
                <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
                  Our emergency department is always ready to provide immediate care.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Appointment Modal */}
      <Modal
        open={appointmentModalOpen}
        onClose={handleAppointmentCancel}
        maxWidth="md"
        title="Book Appointment"
      >
        {selectedDoctor && (
          <AppointmentModal
            doctor={selectedDoctor}
            onConfirm={handleAppointmentConfirm}
            onCancel={handleAppointmentCancel}
          />
        )}
      </Modal>
    </Box>
  );
};

export default Home;
