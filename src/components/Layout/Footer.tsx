import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Aanya Health Center
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Providing comprehensive healthcare services with compassion and excellence. 
              Your health and well-being are our top priorities.
            </Typography>
            <Box display="flex" gap={1}>
              <IconButton
                size="small"
                sx={{ color: 'primary.contrastText' }}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'primary.contrastText' }}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'primary.contrastText' }}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Contact Us
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">
                <Link href="tel:+1234567890" color="inherit" underline="hover">
                  +1 (234) 567-890
                </Link>
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <EmailIcon fontSize="small" />
              <Typography variant="body2">
                <Link href="mailto:info@aanyahealth.com" color="inherit" underline="hover">
                  info@aanyahealth.com
                </Link>
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationIcon fontSize="small" />
              <Typography variant="body2">
                123 Health Street, Medical City, MC 12345
              </Typography>
            </Box>
          </Grid>

          {/* Opening Hours */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Opening Hours
            </Typography>
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Saturday:</strong> 9:00 AM - 4:00 PM
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Sunday:</strong> Closed
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Emergency services available 24/7
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Copyright */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="body2">
            © {currentYear} Aanya Health Center. All rights reserved.
          </Typography>
          <Box display="flex" gap={3}>
            <Link href="/privacy" color="inherit" underline="hover" variant="body2">
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" underline="hover" variant="body2">
              Terms of Service
            </Link>
            <Link href="/accessibility" color="inherit" underline="hover" variant="body2">
              Accessibility
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

