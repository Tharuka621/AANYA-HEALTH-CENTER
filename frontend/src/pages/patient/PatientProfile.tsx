import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Alert,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  ContactEmergency as EmergencyIcon,
  LocalHospital as AllergyIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format, isValid, parseISO } from 'date-fns';
import { axiosInstance } from '../../services/api';

interface PatientProfileData {
  user_id: number;
  patient_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  nic: string | null;
  dob: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  allergies: string[];
}

interface ProfileFormData {
  full_name: string;
  email: string;
  phone: string;
  nic: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  allergiesText: string;
}

const toFormData = (profile: PatientProfileData): ProfileFormData => ({
  full_name: profile.full_name || '',
  email: profile.email || '',
  phone: profile.phone || '',
  nic: profile.nic || '',
  dob: profile.dob || '',
  gender: profile.gender || '',
  address: profile.address || '',
  emergency_contact_name: profile.emergency_contact_name || '',
  emergency_contact_phone: profile.emergency_contact_phone || '',
  allergiesText: (profile.allergies || []).join(', '),
});

const formatDob = (dob: string | null) => {
  if (!dob) return '';
  const parsed = parseISO(dob);
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : dob;
};

const PatientProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [form, setForm] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone: '',
    nic: '',
    dob: '',
    gender: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    allergiesText: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/patient/profile');
      const data: PatientProfileData = response.data.profile;
      setProfile(data);
      setForm(toFormData(data));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const allergies = useMemo(
    () => form.allergiesText.split(',').map((a) => a.trim()).filter(Boolean),
    [form.allergiesText]
  );

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (profile) {
      setForm(toFormData(profile));
    }
    setEditing(false);
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await axiosInstance.put('/patient/profile', {
        full_name: form.full_name,
        phone: form.phone || null,
        nic: form.nic || null,
        dob: form.dob || null,
        gender: form.gender || null,
        address: form.address || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        allergies,
      });

      await fetchProfile();
      setEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and update your personal and emergency details
            </Typography>
          </Box>
          <Box display="flex" gap={1.5}>
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Personal Information Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                    Personal Information
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={form.full_name}
                      disabled={!editing}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={form.email}
                      disabled={true}
                      helperText="Email cannot be changed"
                      InputProps={{
                        startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={form.phone}
                      disabled={!editing}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      InputProps={{
                        startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="NIC Number"
                      value={form.nic}
                      disabled={!editing}
                      onChange={(e) => handleChange('nic', e.target.value)}
                      InputProps={{
                        startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type={editing ? 'date' : 'text'}
                      value={editing ? form.dob : formatDob(form.dob || null)}
                      disabled={!editing}
                      onChange={(e) => handleChange('dob', e.target.value)}
                      InputProps={{
                        startAdornment: <CakeIcon color="action" sx={{ mr: 1 }} />,
                      }}
                      InputLabelProps={editing ? { shrink: true } : undefined}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Gender"
                      value={form.gender}
                      disabled={!editing}
                      onChange={(e) => handleChange('gender', e.target.value)}
                    >
                      <MenuItem value="">Select gender</MenuItem>
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={form.address}
                      disabled={!editing}
                      onChange={(e) => handleChange('address', e.target.value)}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: <HomeIcon color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Emergency Contact & Allergies */}
          <Grid item xs={12} md={6}>
            {/* Emergency Contact Card */}
            <Card sx={{ mb: 3 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #4f6dd9 0%, #7757f5 100%)',
                  p: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <EmergencyIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                    Emergency Contact
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Name"
                      value={form.emergency_contact_name}
                      disabled={!editing}
                      onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Phone"
                      value={form.emergency_contact_phone}
                      disabled={!editing}
                      onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                      InputProps={{
                        startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Allergies Card */}
            <Card>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  p: 2,
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <AllergyIcon sx={{ color: 'white' }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                    Allergies
                  </Typography>
                </Box>
              </Box>
              <CardContent>
                <TextField
                  fullWidth
                  label="Allergies"
                  value={form.allergiesText}
                  disabled={!editing}
                  onChange={(e) => handleChange('allergiesText', e.target.value)}
                  helperText="Use comma-separated values (e.g., Penicillin, Dust)"
                  multiline
                  rows={3}
                />
                <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                  {allergies.length > 0 ? (
                    allergies.map((allergy) => (
                      <Chip key={allergy} label={allergy} color="error" variant="outlined" size="small" />
                    ))
                  ) : (
                    <Alert severity="info" sx={{ width: '100%' }}>
                      No allergies recorded.
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PatientProfile;
