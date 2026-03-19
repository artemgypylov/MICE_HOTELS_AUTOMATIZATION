import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
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
} from '@mui/material';
import api from '../services/api';
import { Booking } from '../types';

const DashboardPage: React.FC = () => {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings');
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Hotel</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.eventName || 'Unnamed Event'}</TableCell>
                <TableCell>{booking.hotel?.name}</TableCell>
                <TableCell>
                  {new Date(booking.startDate).toLocaleDateString()} -{' '}
                  {new Date(booking.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{booking.numGuests}</TableCell>
                <TableCell>
                  <Chip label={booking.status} color={getStatusColor(booking.status)} size="small" />
                </TableCell>
                <TableCell align="right">
                  {booking.totalPrice ? `$${booking.totalPrice.toLocaleString()}` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DashboardPage;
