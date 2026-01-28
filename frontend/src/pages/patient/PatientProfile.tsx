import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  ContactEmergency as EmergencyIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  LocalHospital as AllergyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const PatientProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  // User data (from users table)
  const [userData, setUserData] = useState({
    full_name: 'Nimal Perera',
    email: 'nimal@example.com',
    phone: '0771234567',
  });

  // Patient data (from patients table)
  const [patientData, setPatientData] = useState({
    nic: '921234567V',
    dob: '1992-05-15',
    gender: 'MALE',
    address: '123 Galle Road, Colombo 03, Sri Lanka',
    emergency_contact_name: 'Kamala Perera',
    emergency_contact_phone: '0779876543',
  });

  // Allergies (from patient_allergies table)
  const [allergies, setAllergies] = useState<string[]>([
    'Penicillin',
    'Peanuts',
    'Dust mites',
  ]);

  const handleUserDataChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [field]: event.target.value });
  };

  const handlePatientDataChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPatientData({ ...patientData, [field]: event.target.value });
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleDeleteAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // TODO: API call to save data
    console.log('Saving profile data:', { userData, patientData, allergies });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // TODO: Reset to original data
    setIsEditing(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Patient Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your personal and medical information
            </Typography>
          </Box>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box display="flex" gap={2}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                Save Changes
              </Button>
            </Box>
          )}
        </Box>

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
                      value={userData.full_name}
                      onChange={handleUserDataChange('full_name')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={userData.email}
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
                      value={userData.phone}
                      onChange={handleUserDataChange('phone')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="NIC Number"
                      value={patientData.nic}
                      onChange={handlePatientDataChange('nic')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={patientData.dob}
                      onChange={handlePatientDataChange('dob')}
                      disabled={!isEditing}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <CakeIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Gender"
                      value={patientData.gender}
                      onChange={handlePatientDataChange('gender')}
                      disabled={!isEditing}
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={patientData.address}
                      onChange={handlePatientDataChange('address')}
                      disabled={!isEditing}
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
                      value={patientData.emergency_contact_name}
                      onChange={handlePatientDataChange('emergency_contact_name')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Emergency Contact Phone"
                      value={patientData.emergency_contact_phone}
                      onChange={handlePatientDataChange('emergency_contact_phone')}
                      disabled={!isEditing}
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
                {isEditing && (
                  <Box display="flex" gap={1} mb={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add New Allergy"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddAllergy();
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddAllergy}
                    >
                      Add
                    </Button>
                  </Box>
                )}

                {allergies.length > 0 ? (
                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {allergies.map((allergy, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <AllergyIcon fontSize="small" color="error" />
                                  <Typography variant="body1">{allergy}</Typography>
                                </Box>
                              }
                            />
                            {isEditing && (
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  size="small"
                                  onClick={() => handleDeleteAllergy(index)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            )}
                          </ListItem>
                          {index < allergies.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                ) : (
                  <Alert severity="info">
                    No allergies recorded. {isEditing && 'Click "Add" to add allergies.'}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Information Notice */}
          {isEditing && (
            <Grid item xs={12}>
              <Alert severity="warning" icon={<SaveIcon />}>
                <Typography variant="body2" fontWeight={600}>
                  Don't forget to save your changes!
                </Typography>
                <Typography variant="body2">
                  Make sure all information is accurate, especially emergency contact details and allergies.
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default PatientProfile;
