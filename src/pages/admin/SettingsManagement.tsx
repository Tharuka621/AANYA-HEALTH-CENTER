import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

const SettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState({
    // General Settings
    clinic_name: 'Aanya Health Center',
    clinic_address: '123 Medical Street, Health City, HC 12345',
    clinic_phone: '+1 (555) 123-4567',
    clinic_email: 'info@aanyahealth.com',
    clinic_website: 'www.aanyahealth.com',
    
    // Appointment Settings
    appointment_duration: '30',
    max_appointments_per_day: '20',
    allow_online_booking: true,
    require_confirmation: true,
    
    // Notification Settings
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    prescription_reminders: true,
    
    // Security Settings
    session_timeout: '60',
    password_policy: 'strong',
    two_factor_auth: false,
    audit_logging: true,
    
    // System Settings
    timezone: 'UTC-5',
    date_format: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // In a real app, this would call the API
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={700}>
            System Settings
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </Box>

        {saved && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={<BusinessIcon color="primary" />}
                title="General Settings"
                subheader="Basic clinic information and contact details"
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Clinic Name"
                      value={settings.clinic_name}
                      onChange={(e) => handleSettingChange('clinic_name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Clinic Phone"
                      value={settings.clinic_phone}
                      onChange={(e) => handleSettingChange('clinic_phone', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Clinic Address"
                      value={settings.clinic_address}
                      onChange={(e) => handleSettingChange('clinic_address', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Clinic Email"
                      type="email"
                      value={settings.clinic_email}
                      onChange={(e) => handleSettingChange('clinic_email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Clinic Website"
                      value={settings.clinic_website}
                      onChange={(e) => handleSettingChange('clinic_website', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointment Settings */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={<SettingsIcon color="primary" />}
                title="Appointment Settings"
                subheader="Configure appointment booking and management"
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Appointment Duration (minutes)"
                      type="number"
                      value={settings.appointment_duration}
                      onChange={(e) => handleSettingChange('appointment_duration', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Max Appointments Per Day"
                      type="number"
                      value={settings.max_appointments_per_day}
                      onChange={(e) => handleSettingChange('max_appointments_per_day', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={settings.timezone}
                        label="Timezone"
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      >
                        <MenuItem value="UTC-5">UTC-5 (EST)</MenuItem>
                        <MenuItem value="UTC-6">UTC-6 (CST)</MenuItem>
                        <MenuItem value="UTC-7">UTC-7 (MST)</MenuItem>
                        <MenuItem value="UTC-8">UTC-8 (PST)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.allow_online_booking}
                          onChange={(e) => handleSettingChange('allow_online_booking', e.target.checked)}
                        />
                      }
                      label="Allow Online Booking"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.require_confirmation}
                          onChange={(e) => handleSettingChange('require_confirmation', e.target.checked)}
                        />
                      }
                      label="Require Confirmation"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={<NotificationsIcon color="primary" />}
                title="Notification Settings"
                subheader="Configure email and SMS notifications"
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email_notifications}
                          onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.sms_notifications}
                          onChange={(e) => handleSettingChange('sms_notifications', e.target.checked)}
                        />
                      }
                      label="SMS Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.appointment_reminders}
                          onChange={(e) => handleSettingChange('appointment_reminders', e.target.checked)}
                        />
                      }
                      label="Appointment Reminders"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.prescription_reminders}
                          onChange={(e) => handleSettingChange('prescription_reminders', e.target.checked)}
                        />
                      }
                      label="Prescription Reminders"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={<SecurityIcon color="primary" />}
                title="Security Settings"
                subheader="Configure security and access controls"
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      type="number"
                      value={settings.session_timeout}
                      onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Password Policy</InputLabel>
                      <Select
                        value={settings.password_policy}
                        label="Password Policy"
                        onChange={(e) => handleSettingChange('password_policy', e.target.value)}
                      >
                        <MenuItem value="basic">Basic</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="strong">Strong</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={settings.currency}
                        label="Currency"
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                      >
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                        <MenuItem value="INR">INR (₹)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.two_factor_auth}
                          onChange={(e) => handleSettingChange('two_factor_auth', e.target.checked)}
                        />
                      }
                      label="Two-Factor Authentication"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.audit_logging}
                          onChange={(e) => handleSettingChange('audit_logging', e.target.checked)}
                        />
                      }
                      label="Audit Logging"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SettingsManagement;

