import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
  LocalPharmacy as PharmacyIcon,
  Science as LabIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  AdminPanelSettings as AdminIcon,
  ContactEmergency as EmergencyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { axiosInstance } from '../../services/api';

interface ProfileData {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  // Doctor fields
  doctor_id?: number;
  specialization?: string;
  qualification?: string;
  license_no?: string;
  // Patient fields
  patient_id?: number;
  nic?: string;
  dob?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies?: string[];
}

interface StatsData {
  [key: string]: number;
}

const roleGradients: Record<string, string> = {
  DOCTOR: 'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
  PATIENT: 'linear-gradient(135deg, #00695c 0%, #00897b 100%)',
  RECEPTIONIST: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
  PHARMACIST: 'linear-gradient(135deg, #e65100 0%, #f57c00 100%)',
  LAB: 'linear-gradient(135deg, #004d40 0%, #00796b 100%)',
  LAB_TECH: 'linear-gradient(135deg, #004d40 0%, #00796b 100%)',
  ADMIN: 'linear-gradient(135deg, #b71c1c 0%, #c62828 100%)',
};

const roleIcons: Record<string, React.ReactElement> = {
  DOCTOR: <MedicalIcon sx={{ fontSize: 40, color: 'white' }} />,
  PATIENT: <PersonIcon sx={{ fontSize: 40, color: 'white' }} />,
  RECEPTIONIST: <ScheduleIcon sx={{ fontSize: 40, color: 'white' }} />,
  PHARMACIST: <PharmacyIcon sx={{ fontSize: 40, color: 'white' }} />,
  LAB: <LabIcon sx={{ fontSize: 40, color: 'white' }} />,
  LAB_TECH: <LabIcon sx={{ fontSize: 40, color: 'white' }} />,
  ADMIN: <AdminIcon sx={{ fontSize: 40, color: 'white' }} />,
};

const roleLabels: Record<string, string> = {
  DOCTOR: 'Doctor',
  PATIENT: 'Patient',
  RECEPTIONIST: 'Receptionist',
  PHARMACIST: 'Pharmacist',
  LAB: 'Lab Technician',
  LAB_TECH: 'Lab Technician',
  ADMIN: 'Administrator',
};

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData>({});
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get('/profile');
      if (res.data?.ok) {
        setProfile(res.data.profile);
        setStats(res.data.stats || {});
        setEditForm({
          full_name: res.data.profile.full_name || '',
          phone: res.data.profile.phone || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await axiosInstance.put('/profile', editForm);
      await fetchProfile();
      setEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({ full_name: profile.full_name, phone: profile.phone || '' });
    }
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  const role = (profile?.role || user?.role || '').toUpperCase();
  const gradient = roleGradients[role] || roleGradients.ADMIN;
  const roleIcon = roleIcons[role] || roleIcons.ADMIN;
  const roleLabel = roleLabels[role] || role;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const displayName = role === 'DOCTOR' ? `Dr. ${profile?.full_name || ''}` : profile?.full_name || '';

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

        {/* ─── Profile Hero Card ─── */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Gradient Banner */}
          <Box
            sx={{
              background: gradient,
              px: 4,
              pt: 5,
              pb: 8,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 40,
                background: 'white',
                borderRadius: '40px 40px 0 0',
              },
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box display="flex" alignItems="center" gap={2}>
                {roleIcon}
                <Box>
                  <Typography variant="h6" color="white" fontWeight={700}>
                    {roleLabel} Profile
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    AANYA Health Center
                  </Typography>
                </Box>
              </Box>
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditing(true)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Edit
                </Button>
              ) : (
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ bgcolor: 'white', color: gradient.includes('#1a237e') ? '#1a237e' : '#333', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>

          {/* Profile Info Section */}
          <Box sx={{ px: 4, pb: 4, mt: -3, position: 'relative', zIndex: 1 }}>
            <Box display="flex" alignItems="flex-end" gap={3} mb={3}>
              <Avatar
                sx={{
                  width: 96,
                  height: 96,
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: gradient,
                  border: '4px solid white',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
              >
                {profile?.full_name ? getInitials(profile.full_name) : <PersonIcon sx={{ fontSize: 40 }} />}
              </Avatar>
              <Box sx={{ pb: 1 }}>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  {displayName}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Chip
                    label={roleLabel}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      background: gradient,
                      color: 'white',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Member since {formatDate(profile?.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>

        <Grid container spacing={3}>
          {/* ─── Contact Information ─── */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
              <Box sx={{ background: alpha('#1565c0', 0.08), p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon sx={{ color: '#1565c0' }} />
                  <Typography variant="h6" fontWeight={700} color="#1565c0">
                    Contact Information
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={editing ? editForm.full_name : (profile?.full_name || '')}
                      disabled={!editing}
                      onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                      InputProps={{ startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={profile?.email || ''}
                      disabled
                      helperText="Email cannot be changed"
                      InputProps={{ startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={editing ? editForm.phone : (profile?.phone || 'Not set')}
                      disabled={!editing}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      InputProps={{ startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ─── Activity Stats ─── */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', height: '100%' }}>
              <Box sx={{ background: alpha('#00897b', 0.08), p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AssignmentIcon sx={{ color: '#00897b' }} />
                  <Typography variant="h6" fontWeight={700} color="#00897b">
                    Activity Summary
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {getStatCards(role, stats).map((stat, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          bgcolor: alpha(stat.color, 0.06),
                          border: '1px solid',
                          borderColor: alpha(stat.color, 0.12),
                          textAlign: 'center',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-2px)' },
                        }}
                      >
                        <Box sx={{ color: stat.color, mb: 0.5 }}>{stat.icon}</Box>
                        <Typography variant="h5" fontWeight={800} color={stat.color}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ lineHeight: 1.2, display: 'block', mt: 0.3 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ─── Role-Specific Details ─── */}
          {role === 'DOCTOR' && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <Box sx={{ background: alpha('#1a237e', 0.08), p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MedicalIcon sx={{ color: '#1a237e' }} />
                    <Typography variant="h6" fontWeight={700} color="#1a237e">
                      Professional Details
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Specialization"
                        value={profile?.specialization || 'Not set'}
                        disabled
                        InputProps={{ startAdornment: <MedicalIcon color="action" sx={{ mr: 1 }} /> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Qualification"
                        value={profile?.qualification || 'Not set'}
                        disabled
                        InputProps={{ startAdornment: <AssignmentIcon color="action" sx={{ mr: 1 }} /> }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="License No."
                        value={profile?.license_no || 'Not set'}
                        disabled
                        InputProps={{ startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} /> }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {role === 'PATIENT' && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <Box sx={{ background: alpha('#7b1fa2', 0.08), p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BadgeIcon sx={{ color: '#7b1fa2' }} />
                      <Typography variant="h6" fontWeight={700} color="#7b1fa2">
                        Personal Details
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField fullWidth label="NIC Number" value={profile?.nic || 'Not set'} disabled
                          InputProps={{ startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} /> }} />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Date of Birth" value={formatDate(profile?.dob)} disabled
                          InputProps={{ startAdornment: <CakeIcon color="action" sx={{ mr: 1 }} /> }} />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Gender" value={profile?.gender || 'Not set'} disabled />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Address" value={profile?.address || 'Not set'} disabled multiline rows={2}
                          InputProps={{ startAdornment: <HomeIcon color="action" sx={{ mr: 1, alignSelf: 'flex-start', mt: 1 }} /> }} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', mb: 3 }}>
                  <Box sx={{ background: alpha('#c62828', 0.08), p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmergencyIcon sx={{ color: '#c62828' }} />
                      <Typography variant="h6" fontWeight={700} color="#c62828">
                        Emergency Contact
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Contact Name" value={profile?.emergency_contact_name || 'Not set'} disabled
                          InputProps={{ startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} /> }} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Contact Phone" value={profile?.emergency_contact_phone || 'Not set'} disabled
                          InputProps={{ startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} /> }} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Allergies */}
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                  <Box sx={{ background: alpha('#e65100', 0.08), p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WarningIcon sx={{ color: '#e65100' }} />
                      <Typography variant="h6" fontWeight={700} color="#e65100">
                        Allergies
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    {profile?.allergies && profile.allergies.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {profile.allergies.map(a => (
                          <Chip key={a} label={a} color="error" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>No allergies recorded</Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

// ─── Stat card configuration per role ───

function getStatCards(role: string, stats: StatsData) {
  switch (role) {
    case 'DOCTOR':
      return [
        { label: 'Total Appointments', value: stats.total_appointments || 0, color: '#1565c0', icon: <CalendarIcon /> },
        { label: 'Total Patients', value: stats.total_patients || 0, color: '#00897b', icon: <PeopleIcon /> },
        { label: 'Completed Visits', value: stats.completed_visits || 0, color: '#4caf50', icon: <CheckCircleIcon /> },
        { label: 'Prescriptions', value: stats.total_prescriptions || 0, color: '#7b1fa2', icon: <AssignmentIcon /> },
      ];
    case 'PATIENT':
      return [
        { label: 'Appointments', value: stats.total_appointments || 0, color: '#1565c0', icon: <CalendarIcon /> },
        { label: 'Visits', value: stats.completed_visits || 0, color: '#4caf50', icon: <CheckCircleIcon /> },
        { label: 'Prescriptions', value: stats.total_prescriptions || 0, color: '#7b1fa2', icon: <AssignmentIcon /> },
        { label: 'Lab Orders', value: stats.total_lab_orders || 0, color: '#00897b', icon: <LabIcon /> },
      ];
    case 'RECEPTIONIST':
      return [
        { label: "Today's Appointments", value: stats.today_appointments || 0, color: '#1565c0', icon: <CalendarIcon /> },
        { label: 'Checked In Today', value: stats.today_checked_in || 0, color: '#4caf50', icon: <CheckCircleIcon /> },
        { label: "Today's Visits", value: stats.today_visits || 0, color: '#ff9800', icon: <ScheduleIcon /> },
        { label: 'Total Patients', value: stats.total_patients || 0, color: '#7b1fa2', icon: <PeopleIcon /> },
      ];
    case 'PHARMACIST':
      return [
        { label: 'Pending Rx', value: stats.pending_prescriptions || 0, color: '#ff9800', icon: <ScheduleIcon /> },
        { label: 'Dispensed', value: stats.dispensed_prescriptions || 0, color: '#4caf50', icon: <CheckCircleIcon /> },
        { label: 'Low Stock', value: stats.low_stock_items || 0, color: '#f44336', icon: <WarningIcon /> },
        { label: 'Inventory Items', value: stats.total_inventory_items || 0, color: '#1565c0', icon: <InventoryIcon /> },
      ];
    case 'LAB':
    case 'LAB_TECH':
      return [
        { label: 'Pending Tests', value: stats.pending_tests || 0, color: '#ff9800', icon: <ScheduleIcon /> },
        { label: 'In Progress', value: stats.in_progress_tests || 0, color: '#1565c0', icon: <LabIcon /> },
        { label: 'Completed', value: stats.completed_tests || 0, color: '#4caf50', icon: <CheckCircleIcon /> },
        { label: 'Total Orders', value: stats.total_orders || 0, color: '#7b1fa2', icon: <AssignmentIcon /> },
      ];
    case 'ADMIN':
      return [
        { label: 'Total Users', value: stats.total_users || 0, color: '#1565c0', icon: <PeopleIcon /> },
        { label: 'Doctors', value: stats.total_doctors || 0, color: '#00897b', icon: <MedicalIcon /> },
        { label: 'Patients', value: stats.total_patients || 0, color: '#7b1fa2', icon: <PersonIcon /> },
        { label: 'Appointments', value: stats.total_appointments || 0, color: '#ff9800', icon: <CalendarIcon /> },
      ];
    default:
      return [];
  }
}

export default UserProfile;
