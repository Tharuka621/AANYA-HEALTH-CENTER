import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Science as ScienceIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { mockLabOrders, mockLabOrderItems, mockLabTests, mockPatients, mockUsers, mockVisits } from '../../mock/doctorMock';
import { labOrderStatusLabels, labOrderStatusColors, formatDate } from '../../utils/doctorUtils';
import type { LabOrder } from '../../types/doctor';

interface LabOrderWithDetails extends LabOrder {
  patient_name: string;
  patient_phone: string;
  visit_date: string;
  test_names: string[];
  total_tests: number;
}

const LabTestList: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrderWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Get lab orders with patient details
  const getLabOrdersWithDetails = (): LabOrderWithDetails[] => {
    return mockLabOrders.map(order => {
      const visit = mockVisits.find(v => v.id === order.visit_id);
      const patient = mockPatients.find(p => p.id === order.patient_id);
      const user = mockUsers.find(u => u.id === patient?.user_id);
      
      // Get test items for this order
      const orderItems = mockLabOrderItems.filter(item => item.lab_order_id === order.id);
      const testNames = orderItems.map(item => {
        const test = mockLabTests.find(t => t.id === item.lab_test_id);
        return test?.name || 'Unknown Test';
      });

      return {
        ...order,
        patient_name: user?.full_name || 'Unknown',
        patient_phone: user?.phone || 'N/A',
        visit_date: visit?.check_in_time?.split('T')[0] || order.created_at?.split('T')[0] || 'N/A',
        test_names: testNames,
        total_tests: orderItems.length,
      };
    });
  };

  const allLabOrders = getLabOrdersWithDetails();
  
  // Filter by selected date
  const filteredLabOrders = selectedDate
    ? allLabOrders.filter(order => order.visit_date === selectedDate)
    : allLabOrders;

  const handleViewLabOrder = (order: LabOrderWithDetails) => {
    setSelectedLabOrder(order);
    setOpenDialog(true);
  };

  const pendingTests = filteredLabOrders.filter(t => t.status === 'ORDERED').length;
  const completedTests = filteredLabOrders.filter(t => t.status === 'COMPLETED').length;
  const inProgressTests = filteredLabOrders.filter(t => t.status === 'IN_PROGRESS').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Lab Test Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage lab test orders by date
          </Typography>
        </Box>

        {/* Date Filter */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CalendarIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Select Date
              </Typography>
            </Box>
            <TextField
              fullWidth
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Box display="flex" gap={2} mb={4}>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Total: {filteredLabOrders.length}
            </Typography>
          </Alert>
          <Alert severity="warning" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Ordered: {pendingTests}
            </Typography>
          </Alert>
          <Alert severity="info" sx={{ flex: 1 }}>
            <Typography variant="body2">
              In Progress: {inProgressTests}
            </Typography>
          </Alert>
          <Alert severity="success" sx={{ flex: 1 }}>
            <Typography variant="body2">
              Completed: {completedTests}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Tests Ordered</TableCell>
                <TableCell>Visit Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Tests</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLabOrders.length > 0 ? (
                filteredLabOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {order.patient_name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {order.patient_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.patient_phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {order.test_names.map((testName, idx) => (
                          <Chip
                            key={idx}
                            label={testName}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.visit_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={labOrderStatusLabels[order.status]}
                        color={labOrderStatusColors[order.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${order.total_tests} test${order.total_tests > 1 ? 's' : ''}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleViewLabOrder(order)}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        {order.status === 'COMPLETED' && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => console.log('Download results:', order.id)}
                            title="Download Results"
                          >
                            <DownloadIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={4}>
                      <Typography variant="body1" color="text.secondary">
                        No lab test orders found for {formatDate(selectedDate)}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Lab Order Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <ScienceIcon color="primary" />
              <Typography variant="h6">Lab Order Details</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedLabOrder && (
              <Box sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Patient:</strong> {selectedLabOrder.patient_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedLabOrder.patient_phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Visit Date:</strong> {formatDate(selectedLabOrder.visit_date)}
                  </Typography>
                </Alert>

                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Ordered Tests ({selectedLabOrder.total_tests})
                </Typography>
                <Box mb={2}>
                  {selectedLabOrder.test_names.map((testName, idx) => (
                    <Chip
                      key={idx}
                      label={testName}
                      color="primary"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>

                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Order Status
                </Typography>
                <Chip
                  label={labOrderStatusLabels[selectedLabOrder.status]}
                  color={labOrderStatusColors[selectedLabOrder.status]}
                  sx={{ mb: 2 }}
                />

                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Order Information
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Order ID:</strong> {selectedLabOrder.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {formatDate(selectedLabOrder.created_at?.split('T')[0] || 'N/A')}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default LabTestList;

