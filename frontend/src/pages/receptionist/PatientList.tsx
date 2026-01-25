import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

import { MenuItem } from "@mui/material";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nic: string;
  gender: string;
  blood_type: string;
  allergies: string;
  date_of_birth: string;
  status: "active" | "inactive";
}

const PatientList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data - replace with API call
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      full_name: "Kasun Bandara",
      email: "kasun@example.com",
      phone: "+94 71 123 4567",
      nic: "199012301234",
      gender: "Male",
      blood_type: "O+",
      allergies: "None",
      date_of_birth: "1990-05-15",
      status: "active",
    },
    {
      id: "2",
      full_name: "Nimal Perera",
      email: "nimal@example.com",
      phone: "+94 77 555 8899",
      nic: "198506152345",
      gender: "Male",
      blood_type: "A+",
      allergies: "Penicillin",
      date_of_birth: "1985-08-22",
      status: "active",
    },
    {
      id: "3",
      full_name: "Ishara Silva",
      email: "ishara@example.com",
      phone: "+94 76 234 5678",
      nic: "199310052678",
      gender: "Female",
      blood_type: "B+",
      allergies: "Peanuts",
      date_of_birth: "1993-12-10",
      status: "active",
    },
  ]);

  // Registration form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    nic: "",
    gender: "",
    blood_type: "",
    allergies: "",
    date_of_birth: "",
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone.includes(search) ||
      patient.nic.includes(search) ||
      patient.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewOpen(true);
  };

  const handleRegisterPatient = () => {
    // TODO: API call to register patient
    const newPatient: Patient = {
      id: (patients.length + 1).toString(),
      ...formData,
      status: "active",
    };
    setPatients([...patients, newPatient]);
    console.log("Register patient:", formData);
    setRegisterOpen(false);
    // Reset form
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      nic: "",
      gender: "",
      blood_type: "",
      allergies: "",
      date_of_birth: "",
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Patient Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Register and manage patient records
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setRegisterOpen(true)}
            size="large"
          >
            Register New Patient
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {patients.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Patients
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {patients.filter((p) => p.status === "active").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Patients
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Records
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Patient List */}
        <Card>
          <CardContent>
            <Box mb={3}>
              <TextField
                fullWidth
                placeholder="Search by name, phone, NIC, or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>NIC</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Blood Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {patient.full_name}
                        </Typography>
                      </TableCell>
                      <TableCell>{patient.nic}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          {patient.phone}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          {patient.email}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.blood_type}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.status}
                          size="small"
                          color={
                            patient.status === "active" ? "success" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small" color="secondary">
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Register Patient Dialog */}
        <Dialog
          open={registerOpen}
          onClose={() => setRegisterOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Register New Patient</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIC"
                    value={formData.nic}
                    onChange={(e) =>
                      setFormData({ ...formData, nic: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
               <TextField
  fullWidth
  select
  id="gender"
  name="gender"
  label="Gender"
  value={formData.gender}
  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
  required
>
  <MenuItem value="">
    <em>None</em>
  </MenuItem>
  <MenuItem value="Male">Male</MenuItem>
  <MenuItem value="Female">Female</MenuItem>
  <MenuItem value="Other">Other</MenuItem>
</TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_of_birth: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Blood Type"
                    value={formData.blood_type}
                    onChange={(e) =>
                      setFormData({ ...formData, blood_type: e.target.value })
                    }
                    placeholder="e.g., O+, A+, B+"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Allergies"
                    value={formData.allergies}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRegisterPatient}>
              Register Patient
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Patient Dialog */}
        <Dialog
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Patient Details</DialogTitle>
          <DialogContent>
            {selectedPatient && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPatient.full_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      NIC
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPatient.nic}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.date_of_birth}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Blood Type
                    </Typography>
                    <Typography variant="body1">
                      <Chip
                        label={selectedPatient.blood_type}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">
                      <Chip
                        label={selectedPatient.status}
                        size="small"
                        color={
                          selectedPatient.status === "active"
                            ? "success"
                            : "default"
                        }
                      />
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Allergies
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.allergies || "None"}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PatientList;
