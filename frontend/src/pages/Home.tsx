import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Description as PrescriptionIcon,
  Science as LabIcon,
  LocalPharmacy as PharmacyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  MedicalServices as MedicalIcon,
  LocalHospital as HospitalIcon,
  FavoriteBorder as HeartIcon,
  Stars as StarsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import doctorImage from '../assets/doctor.png';
// logo intentionally provided in layout; not used directly here

const Home: React.FC = () => {
  // theme not used

  const features = [
    {
      icon: <CalendarIcon sx={{ fontSize: 48 }} />,
      title: 'Smart Scheduling',
      description: 'Book appointments instantly with our intelligent scheduling system. Get reminders and manage your visits effortlessly.',
      color: '#0891b2',
    },
    {
      icon: <PrescriptionIcon sx={{ fontSize: 48 }} />,
      title: 'Digital Prescriptions',
      description: 'Receive electronic prescriptions directly to your device. Share with pharmacies instantly and track your medications.',
      color: '#10b981',
    },
    {
      icon: <LabIcon sx={{ fontSize: 48 }} />,
      title: 'Instant Lab Results',
      description: 'Access your medical test results online as soon as they are available. Secure, fast, and always accessible.',
      color: '#f59e0b',
    },
    {
      icon: <PharmacyIcon sx={{ fontSize: 48 }} />,
      title: 'Pharmacy Network',
      description: 'Connected pharmacy services with home delivery options and real-time medication availability tracking.',
      color: '#8b5cf6',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48 }} />,
      title: 'Secure Records',
      description: 'Your health data is protected with bank-level encryption. Access your complete medical history anytime.',
      color: '#ef4444',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      title: 'Quick Service',
      description: 'Reduced waiting times with digital queue management. Get quality care without the long waits.',
      color: '#06b6d4',
    },
  ];

  const stats = [
    { icon: <PeopleIcon sx={{ fontSize: 40 }} />, value: '10,000+', label: 'Happy Patients' },
    { icon: <HeartIcon sx={{ fontSize: 40 }} />, value: '99%', label: 'Satisfaction Rate' },
    { icon: <StarsIcon sx={{ fontSize: 40 }} />, value: '4.9/5', label: 'Average Rating' },
    { icon: <HospitalIcon sx={{ fontSize: 40 }} />, value: '24/7', label: 'Support Available' },
  ];

  const services = [
    {
      title: 'General Medicine',
      description: 'Comprehensive primary healthcare services for all ages',
      icon: <MedicalIcon sx={{ fontSize: 50 }} />,
    },
    {
      title: 'Specialist Consultations',
      description: 'Expert medical advice from qualified specialists',
      icon: <HospitalIcon sx={{ fontSize: 50 }} />,
    },
    {
      title: 'Diagnostic Services',
      description: 'State-of-the-art laboratory and imaging facilities',
      icon: <LabIcon sx={{ fontSize: 50 }} />,
    },
    {
      title: 'Preventive Care',
      description: 'Regular check-ups and health screening programs',
      icon: <HeartIcon sx={{ fontSize: 50 }} />,
    },
  ];

  return (
    <Box>
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #e2e5edff 0%, #83b2c9ff 50%, #335550ff 100%)',
          color: '#0f172a',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '70%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'pulse 8s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.1)', opacity: 0.8 },
          },
        }}
      >
  <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: { xs: 10, md: 12 }, pb: 8 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                fontWeight={900} 
                gutterBottom
                sx={{
                  fontSize: { xs: '3rem', md: '4.5rem' },
                  lineHeight: 1.1,
                  color: '#024c54ff',
                  mb: 3,
                }}
              >
                Your Health, Our Priority
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  color: '#475569',
                  fontWeight: 400,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  lineHeight: 1.6,
                }}
              >
                Experience healthcare reimagined with cutting-edge technology and compassionate care
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 5, 
                  fontSize: '1.125rem', 
                  lineHeight: 1.8,
                  color: '#475569',
                  maxWidth: 600,
                }}
              >
                Your complete healthcare companion - from appointments to prescriptions, lab reports to pharmacy services. Everything you need for better health, all in one place.
              </Typography>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                    color: 'white',
                    px: 5,
                    py: 2,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 10px 40px rgba(8,145,178,0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 50px rgba(8,145,178,0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Get Started Today
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: '#0891b2',
                    borderWidth: 2,
                    color: '#0891b2',
                    px: 5,
                    py: 2,
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    backgroundColor: 'rgba(8,145,178,0.1)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: '#06b6d4',
                      borderWidth: 2,
                      backgroundColor: 'rgba(8,145,178,0.2)',
                      transform: 'translateY(-3px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                display="flex" 
                justifyContent="center"
                sx={{
                  animation: 'float 4s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-30px) rotate(2deg)' },
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 300, md: 450 },
                    height: { xs: 300, md: 450 },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(8,145,178,0.3) 0%, rgba(6,182,212,0.1) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '3px solid rgba(8,145,178,0.3)',
                      boxShadow: '0 20px 60px rgba(8,145,178,0.3)',
                    }}
                  />
                  <Box
                    component="img"
                    src={doctorImage}
                    alt="Healthcare Professional"
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '4px solid rgba(255,255,255,0.1)',
                    }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                    borderRadius: 4,
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.05)',
                    },
                  }}
                >
                  <Box 
                    sx={{ 
                      color: '#0891b2', 
                      mb: 2,
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(8,145,178,0.1) 0%, rgba(6,182,212,0.05) 100%)',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h3" fontWeight={900} color="#0891b2" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, backgroundColor: '#f8fafc' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="h3" 
              fontWeight={900} 
              gutterBottom
              sx={{ 
                color: '#0f172a',
                mb: 2,
              }}
            >
              Everything You Need in One Place
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              maxWidth="700px" 
              mx="auto"
              sx={{ fontSize: '1.25rem', lineHeight: 1.8, fontWeight: 400 }}
            >
              Our comprehensive platform brings together all aspects of healthcare management for a seamless experience
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 5,
                      background: `linear-gradient(90deg, ${feature.color} 0%, ${feature.color}AA 100%)`,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.4s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-15px)',
                      boxShadow: `0 20px 40px ${feature.color}30`,
                      '&::before': {
                        transform: 'scaleX(1)',
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}05 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: feature.color,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 10, backgroundColor: '#ffffff' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography 
              variant="h3" 
              fontWeight={900} 
              gutterBottom
              sx={{ color: '#0f172a', mb: 2 }}
            >
              Our Healthcare Services
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              maxWidth="700px" 
              mx="auto"
              sx={{ fontSize: '1.25rem', lineHeight: 1.8, fontWeight: 400 }}
            >
              Comprehensive medical services delivered with expertise and care
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    border: '2px solid #e2e8f0',
                    transition: 'all 0.4s ease',
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      borderColor: '#0891b2',
                      boxShadow: '0 15px 35px rgba(8,145,178,0.2)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 3,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(8,145,178,0.1) 0%, rgba(6,182,212,0.05) 100%)',
                      color: '#0891b2',
                      mb: 3,
                    }}
                  >
                    {service.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {service.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 10,
          background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '140%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'rotate 20s linear infinite',
          },
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box textAlign="center" color="white">
            <Typography variant="h3" fontWeight={900} gutterBottom sx={{ mb: 3 }}>
              Ready to Take Control of Your Health?
            </Typography>
            <Typography variant="h6" sx={{ mb: 5, opacity: 0.95, lineHeight: 1.8, fontWeight: 400 }}>
              Join thousands of satisfied patients who trust Aanya Health Center for their healthcare needs
            </Typography>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: '#0891b2',
                px: 6,
                py: 2.5,
                fontSize: '1.25rem',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                '&:hover': {
                  backgroundColor: '#f0f9ff',
                  transform: 'translateY(-5px) scale(1.05)',
                  boxShadow: '0 15px 50px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Your Journey Now
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 10, backgroundColor: '#0f172a', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                Get in Touch
              </Typography>
              <Typography variant="body1" sx={{ mb: 5, color: '#94a3b8', lineHeight: 1.8, fontSize: '1.125rem' }}>
                Have questions or need assistance? Our dedicated team is here to help you with all your healthcare needs.
              </Typography>
              <Stack spacing={3}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(8,145,178,0.1)',
                    border: '1px solid rgba(8,145,178,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(8,145,178,0.15)',
                      transform: 'translateX(10px)',
                      borderColor: '#0891b2',
                    },
                  }}
                >
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(8,145,178,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <PhoneIcon sx={{ fontSize: 28, color: '#0891b2' }} />
                  </Box>
                  <Typography fontSize="1.125rem" fontWeight={500}>+94 (71) 234-5678</Typography>
                </Box>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(8,145,178,0.1)',
                    border: '1px solid rgba(8,145,178,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(8,145,178,0.15)',
                      transform: 'translateX(10px)',
                      borderColor: '#0891b2',
                    },
                  }}
                >
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(8,145,178,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <EmailIcon sx={{ fontSize: 28, color: '#0891b2' }} />
                  </Box>
                  <Typography fontSize="1.125rem" fontWeight={500}>info@aanyahealth.com</Typography>
                </Box>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(8,145,178,0.1)',
                    border: '1px solid rgba(8,145,178,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(8,145,178,0.15)',
                      transform: 'translateX(10px)',
                      borderColor: '#0891b2',
                    },
                  }}
                >
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(8,145,178,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <LocationIcon sx={{ fontSize: 28, color: '#0891b2' }} />
                  </Box>
                  <Typography fontSize="1.125rem" fontWeight={500}>Uhumiya, Kurunegala, Sri Lanka</Typography>
                </Box>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={3}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(8,145,178,0.1)',
                    border: '1px solid rgba(8,145,178,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(8,145,178,0.15)',
                      transform: 'translateX(10px)',
                      borderColor: '#0891b2',
                    },
                  }}
                >
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: 'rgba(8,145,178,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <TimeIcon sx={{ fontSize: 28, color: '#0891b2' }} />
                  </Box>
                  <Typography fontSize="1.125rem" fontWeight={500}>Mon-Fri: 8:00 AM - 6:00 PM</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Emergency section removed as per request */}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;