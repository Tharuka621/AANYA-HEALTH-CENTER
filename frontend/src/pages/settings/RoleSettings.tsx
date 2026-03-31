import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';

interface RoleSettingsForm {
  reminderMinutesBefore: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  darkMode: boolean;
  hideSensitiveData: boolean;
}

const DEFAULT_SETTINGS: RoleSettingsForm = {
  reminderMinutesBefore: '30',
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  darkMode: false,
  hideSensitiveData: false,
};

const RoleSettings: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const storageKey = useMemo(
    () => `aanya_role_settings_${user?.id || 'guest'}_${user?.role || 'unknown'}`,
    [user?.id, user?.role]
  );

  const [form, setForm] = useState<RoleSettingsForm>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setForm(DEFAULT_SETTINGS);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<RoleSettingsForm>;
      setForm({ ...DEFAULT_SETTINGS, ...parsed });
    } catch {
      setForm(DEFAULT_SETTINGS);
    }
  }, [storageKey]);

  const handleToggle = (key: keyof RoleSettingsForm) => (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setForm((prev) => ({ ...prev, [key]: checked }));
  };

  const handleInput = (key: keyof RoleSettingsForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSave = () => {
    const minutes = Number(form.reminderMinutesBefore);
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 1440) {
      showError('Reminder time must be between 0 and 1440 minutes.');
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(form));
      showSuccess('Settings saved successfully.');
    } catch {
      showError('Unable to save settings. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700}>
            Settings
          </Typography>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save Settings
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                avatar={<NotificationsIcon color="primary" />}
                title="Notification Preferences"
                subheader="Choose how you want to receive reminders and updates"
              />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={1}>
                  <TextField
                    fullWidth
                    label="Reminder Time (minutes before event)"
                    type="number"
                    inputProps={{ min: 0, max: 1440 }}
                    value={form.reminderMinutesBefore}
                    onChange={handleInput('reminderMinutesBefore')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.emailNotifications}
                        onChange={handleToggle('emailNotifications')}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.smsNotifications}
                        onChange={handleToggle('smsNotifications')}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.pushNotifications}
                        onChange={handleToggle('pushNotifications')}
                      />
                    }
                    label="Push Notifications"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                avatar={<TuneIcon color="primary" />}
                title="Display Preferences"
                subheader="Personalize your experience"
              />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.darkMode}
                        onChange={handleToggle('darkMode')}
                      />
                    }
                    label="Enable Dark Mode (saved preference)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={form.hideSensitiveData}
                        onChange={handleToggle('hideSensitiveData')}
                      />
                    }
                    label="Hide Sensitive Information in Lists"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader
                avatar={<SecurityIcon color="primary" />}
                title="Security"
                subheader="Account level controls"
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Security actions such as password change and 2FA enrollment are managed from your profile and authentication flows.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default RoleSettings;
