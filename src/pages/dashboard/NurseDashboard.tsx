import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MonitorHeart as VitalSignsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Welcome Section */}
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome, {user?.full_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Nurse dashboard - Feature coming soon.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Placeholder Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      --
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patients Today
                    </Typography>
                  </Box>
                  <PersonIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      --
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Appointments
                    </Typography>
                  </Box>
                  <CalendarIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      --
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vital Signs
                    </Typography>
                  </Box>
                  <VitalSignsIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Coming Soon Alert */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Nurse Dashboard Coming Soon
              </Typography>
              <Typography variant="body2">
                This dashboard will include patient management, appointment scheduling, vital signs monitoring, 
                and other nursing-specific features. Stay tuned for updates!
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default NurseDashboard;

