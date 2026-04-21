import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { Invoice, InvoicePayment } from '../types';

interface BillingSummaryCardsProps {
  invoices: Invoice[];
  payments: InvoicePayment[];
}

const BillingSummaryCards: React.FC<BillingSummaryCardsProps> = ({ invoices, payments }) => {
  const totalBills = invoices.length;
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

  const cards = [
    {
      title: 'Total Bills',
      value: totalBills,
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Total Revenue',
      value: `Rs. ${totalRevenue.toFixed(2)}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9',
    },
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={6} key={index}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: card.color,
                boxShadow: 2,
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color={card.color}>
                    {card.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    bgcolor: card.bgColor,
                    borderRadius: 3,
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {React.cloneElement(card.icon, { sx: { color: card.color, fontSize: 32 } })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BillingSummaryCards;
