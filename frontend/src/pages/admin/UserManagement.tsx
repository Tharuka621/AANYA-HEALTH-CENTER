import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { axiosInstance } from '../../services/api';
import { useToast } from '../../components/common/Toast';

interface UserData {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const { showSuccess, showError } = useToast();

  const roleOptions = [
    { value: 'PATIENT', label: 'Patient' },
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'PHARMACIST', label: 'Pharmacist' },
    { value: 'LAB_TECH', label: 'Lab Technician' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  // Initial load of user directory used by filters and role/action controls.
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetches all users with role/status metadata for admin operations.
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data.users);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Persists role changes and updates the local row immediately for responsive UI.
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setUpdatingUserId(userId);
      await axiosInstance.put(`/admin/users/${userId}/role`, {
        role: newRole,
      });
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      showSuccess(`User role updated to ${newRole}`);
    } catch (err: any) {
      console.error('Failed to update role:', err);
      showError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteClick = (user: UserData) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Executes a soft-destructive flow: confirm dialog -> API delete -> local state sync.
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setDeleting(true);
      await axiosInstance.delete(`/admin/users/${userToDelete.id}`);
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      
      showSuccess(`User ${userToDelete.full_name} deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      showError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getRoleColor = (role: string) => {
    const roleUpper = role.toUpperCase();
    switch (roleUpper) {
      case 'ADMIN': return 'error';
      case 'DOCTOR': return 'primary';
      case 'RECEPTIONIST': return 'info';
      case 'PHARMACIST': return 'warning';
      case 'LAB_TECH': return 'secondary';
      case 'LAB': return 'secondary';
      case 'PATIENT': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const filteredUsers = roleFilter === 'ALL' 
    ? users 
    : users.filter(user => user.role.toUpperCase() === roleFilter);

  const getRoleCount = (role: string) => {
    if (role === 'ALL') return users.length;
    return users.filter(user => user.role.toUpperCase() === role).length;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ py: { xs: 1.5, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
            User Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Role Filter Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={roleFilter}
            onChange={(e, newValue) => setRoleFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { fontSize: { xs: '0.7rem', sm: '0.8rem' }, minHeight: { xs: 40, sm: 48 } },
            }}
          >
            <Tab 
              label={`All (${getRoleCount('ALL')})`} 
              value="ALL" 
            />
            <Tab 
              label={`Patients (${getRoleCount('PATIENT')})`} 
              value="PATIENT" 
            />
            <Tab 
              label={`Doctors (${getRoleCount('DOCTOR')})`} 
              value="DOCTOR" 
            />
            <Tab 
              label={`Receptionists (${getRoleCount('RECEPTIONIST')})`} 
              value="RECEPTIONIST" 
            />
            <Tab 
              label={`Pharmacists (${getRoleCount('PHARMACIST')})`} 
              value="PHARMACIST" 
            />
            <Tab 
              label={`Lab Techs (${getRoleCount('LAB_TECH')})`} 
              value="LAB_TECH" 
            />
            <Tab 
              label={`Admins (${getRoleCount('ADMIN')})`} 
              value="ADMIN" 
            />
          </Tabs>
        </Paper>

        <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <TableContainer component={Paper} elevation={2}>
            <Table sx={{ minWidth: { xs: 600, sm: 700 } }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>User</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Phone</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Role</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Registered</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                        {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {user.full_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.phone || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={user.role.toUpperCase()}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingUserId === user.id}
                      >
                        {roleOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Chip
                              label={option.label}
                              color={getRoleColor(option.value)}
                              size="small"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={getStatusColor(user.is_active)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(user)}
                      title="Delete user"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>

        {filteredUsers.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              {roleFilter === 'ALL' ? 'No users found' : `No ${roleFilter.toLowerCase()} users found`}
            </Typography>
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete user <strong>{userToDelete?.full_name}</strong> ({userToDelete?.email})?
              <br />
              <br />
              This action cannot be undone and will permanently remove all associated data.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default UserManagement;
