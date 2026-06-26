import React, { useState, useEffect, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListItemAvatar,
  Chip,
  Tooltip,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  DoneAll as DoneAllIcon,
  FiberManualRecord as DotIcon,
  Schedule as ScheduleIcon,
  LocalPharmacy as PharmacyIcon,
  Science as LabIcon,
  CalendarToday as CalendarIcon,
  PeopleAlt as PeopleIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLogout } from '../../hooks/useAuth';
import { axiosInstance } from '../../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  created_at: string;
}

interface HeaderProps {
  onMenuToggle?: () => void;
}

const DISMISSED_KEY = 'aanya_dismissed_notifications';

const getDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch { return []; }
};

const setDismissed = (ids: string[]) => {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
};

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissed, setDismissedState] = useState<string[]>(getDismissed());
  const [loading, setLoading] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notifications');
      if (res.data?.ok && res.data.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + periodic polling every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Unread = not dismissed
  const unreadNotifications = notifications.filter(n => !dismissed.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = (id: string) => {
    const updated = [...dismissed, id];
    setDismissedState(updated);
    setDismissed(updated);
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = [...new Set([...dismissed, ...allIds])];
    setDismissedState(updated);
    setDismissed(updated);
  };

  const handleProfileOpen = (e: React.MouseEvent<HTMLElement>) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(e.currentTarget);
    fetchNotifications(); // refresh on open
  };
  const handleNotifClose = () => setNotifAnchor(null);

  const handleLogout = () => {
    logout.mutate();
    handleProfileClose();
    navigate('/login');
  };

  // Dynamic display name
  const displayName = user?.role === 'doctor'
    ? `Dr. ${user.full_name}`
    : user?.full_name || 'User';

  const formatRole = (role: string) =>
    role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');

  const getDashboardRole = (role?: string) => {
    if (!role) return 'patient';
    return role === 'lab_tech' ? 'lab' : role;
  };

  // Avatar initials from real name
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Relative time helper
  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  // Notification type config
  const getNotifConfig = (type: string, category: string) => {
    const categoryIcons: Record<string, React.ReactElement> = {
      waiting: <ScheduleIcon fontSize="small" />,
      appointments: <CalendarIcon fontSize="small" />,
      appointment: <CalendarIcon fontSize="small" />,
      checkin: <PersonIcon fontSize="small" />,
      slots: <ScheduleIcon fontSize="small" />,
      prescriptions: <PharmacyIcon fontSize="small" />,
      prescription: <PharmacyIcon fontSize="small" />,
      inventory: <PharmacyIcon fontSize="small" />,
      expiry: <WarningIcon fontSize="small" />,
      lab: <LabIcon fontSize="small" />,
      pending: <ScheduleIcon fontSize="small" />,
      request: <LabIcon fontSize="small" />,
      progress: <LabIcon fontSize="small" />,
      users: <PeopleIcon fontSize="small" />,
      summary: <InfoIcon fontSize="small" />,
      labs: <LabIcon fontSize="small" />,
    };

    const typeColors: Record<string, string> = {
      info: '#2196f3',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
    };

    const typeBg: Record<string, string> = {
      info: '#e3f2fd',
      success: '#e8f5e9',
      warning: '#fff3e0',
      error: '#fce4ec',
    };

    return {
      icon: categoryIcons[category] || <InfoIcon fontSize="small" />,
      color: typeColors[type] || '#2196f3',
      bg: typeBg[type] || '#e3f2fd',
    };
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        width: '100%',
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)',
        color: '#fff',
        borderBottom: '1px solid',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ width: '100%', justifyContent: 'space-between', minHeight: { xs: '56px !important', sm: '64px !important' } }}>
        {/* Left side - Hamburger + Welcome Text */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, minWidth: 0, overflow: 'hidden' }}>
          {/* Hamburger menu - visible on mobile only */}
          {onMenuToggle && (
            <IconButton
              color="inherit"
              aria-label="open menu"
              onClick={onMenuToggle}
              sx={{
                display: { xs: 'inline-flex', md: 'none' },
                mr: 0.5,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <MedicalIcon sx={{ fontSize: { xs: 22, sm: 28 }, color: 'rgba(255,255,255,0.9)', flexShrink: 0 }} />
          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <Typography 
              variant="body1" 
              fontWeight={700} 
              sx={{ 
                lineHeight: 1.2, 
                letterSpacing: '0.02em',
                fontSize: { xs: '0.8rem', sm: '1rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Welcome back, </Box>
              {displayName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                opacity: 0.75, 
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.5 }, flexShrink: 0 }}>
          {/* Notification Bell */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotifOpen}
              id="notification-bell"
              size="small"
              sx={{
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    height: 16,
                    minWidth: 16,
                    fontWeight: 700,
                    animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(244,67,54,0.7)' },
                      '70%': { boxShadow: '0 0 0 6px rgba(244,67,54,0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(244,67,54,0)' },
                    },
                  },
                }}
              >
                <NotificationsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Info + Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: { xs: 0, sm: 1 } }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2, fontSize: '0.8rem' }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.6rem' }}>
                {user?.role ? formatRole(user.role) : ''}
              </Typography>
            </Box>

            <Tooltip title="Account menu">
              <IconButton
                onClick={handleProfileOpen}
                size="small"
                id="profile-menu-button"
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 30, sm: 36 },
                    height: { xs: 30, sm: 36 },
                    bgcolor: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  }}
                >
                  {user?.full_name ? getInitials(user.full_name) : <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ─── Notification Dropdown ─── */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              width: { xs: '95vw', sm: 400 },
              maxWidth: 400,
              maxHeight: 520,
              borderRadius: 3,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            },
          }}
          BackdropProps={{
            sx: { backgroundColor: 'transparent' },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: { xs: 1.5, sm: 2.5 },
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 100%)',
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {unreadCount} unread
                </Typography>
              )}
            </Box>
            {unreadCount > 0 && (
              <Chip
                icon={<DoneAllIcon sx={{ fontSize: 16 }} />}
                label="Mark all read"
                size="small"
                onClick={handleMarkAllRead}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  bgcolor: alpha('#1565c0', 0.1),
                  color: '#1565c0',
                  '&:hover': { bgcolor: alpha('#1565c0', 0.2) },
                }}
              />
            )}
          </Box>

          {/* Notification List */}
          {loading && notifications.length === 0 ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary" variant="body2">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0, maxHeight: 400, overflowY: 'auto' }}>
              {notifications.map((notif, index) => {
                const isRead = dismissed.includes(notif.id);
                const config = getNotifConfig(notif.type, notif.category);

                return (
                  <React.Fragment key={notif.id}>
                    <ListItem
                      sx={{
                        px: { xs: 1.5, sm: 2.5 },
                        py: 1.5,
                        cursor: 'pointer',
                        bgcolor: isRead ? 'transparent' : alpha(config.color, 0.04),
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(config.color, 0.08),
                        },
                      }}
                      onClick={() => !isRead && handleMarkAsRead(notif.id)}
                    >
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: config.bg,
                            color: config.color,
                          }}
                        >
                          {config.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {!isRead && (
                              <DotIcon sx={{ fontSize: 8, color: config.color, flexShrink: 0 }} />
                            )}
                            <Typography
                              variant="body2"
                              fontWeight={isRead ? 500 : 700}
                              color="text.primary"
                              component="div"
                              sx={{ lineHeight: 1.3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                              {notif.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{
                                display: 'block',
                                lineHeight: 1.4,
                                mt: 0.25,
                                opacity: isRead ? 0.7 : 1,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              }}
                            >
                              {notif.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              component="div"
                              sx={{
                                fontSize: '0.65rem',
                                color: 'text.disabled',
                                mt: 0.5,
                                display: 'block',
                              }}
                            >
                              {timeAgo(notif.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Menu>

        {/* ─── Profile Menu ─── */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleProfileClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: 3,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            },
          }}
        >
          {/* Profile card */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#1565c0',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {user?.full_name ? getInitials(user.full_name) : <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  {displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
          </Box>

          <MenuItem
            onClick={() => {
              handleProfileClose();
              const role = getDashboardRole(user?.role);
              navigate(`/dashboard/${role}/profile`);
            }}
            sx={{ py: 1.5, '&:hover': { bgcolor: alpha('#1565c0', 0.06) } }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleProfileClose();
              const role = getDashboardRole(user?.role);
              navigate(`/dashboard/${role}/settings`);
            }}
            sx={{ py: 1.5, '&:hover': { bgcolor: alpha('#1565c0', 0.06) } }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleLogout}
            disabled={logout.isPending}
            sx={{
              py: 1.5,
              color: 'error.main',
              '&:hover': { bgcolor: alpha('#f44336', 0.06) },
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>
              {logout.isPending ? 'Logging out...' : 'Logout'}
            </ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;