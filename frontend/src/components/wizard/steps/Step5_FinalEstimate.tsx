import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { WizardData, PriceCalculation, Booking } from '../../../types';
import api from '../../../services/api';

interface Step5Props {
  data: WizardData;
  bookingId: string | null;
  onBack: () => void;
  onComplete: () => void;
}

const Step5FinalEstimate: React.FC<Step5Props> = ({ data, bookingId, onBack, onComplete }) => {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: calculation, isLoading: calcLoading } = useQuery<PriceCalculation>({
    queryKey: ['calculation', bookingId],
    queryFn: async () => {
      const response = await api.post(`/bookings/${bookingId}/calculate`);
      return response.data;
    },
    enabled: !!bookingId,
  });

  const { data: booking } = useQuery<Booking>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    },
    enabled: !!bookingId,
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/bookings/${bookingId}/submit`);
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (calcLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 5: Final Estimate
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review your booking and submit your request
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Event Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Event Details
            </Typography>
            <Typography variant="body2">
              <strong>Event Name:</strong> {data.eventName}
            </Typography>
            <Typography variant="body2">
              <strong>Format:</strong> {data.eventFormat}
            </Typography>
            <Typography variant="body2">
              <strong>Dates:</strong> {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              <strong>Number of Guests:</strong> {data.numGuests}
            </Typography>
            {data.notes && (
              <Typography variant="body2">
                <strong>Notes:</strong> {data.notes}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Price Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Price Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Halls:</Typography>
                <Typography>${calculation?.hallsTotal.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Catering:</Typography>
                <Typography>${calculation?.cateringTotal.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Services:</Typography>
                <Typography>${calculation?.servicesTotal.toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${calculation?.grandTotal.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Detailed Breakdown - Halls */}
        {calculation?.breakdown.halls && calculation.breakdown.halls.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Hall Bookings
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Hall</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Layout</TableCell>
                      <TableCell align="right">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculation.breakdown.halls.map((hall, index) => (
                      <TableRow key={index}>
                        <TableCell>{hall.name}</TableCell>
                        <TableCell>{new Date(hall.date).toLocaleDateString()}</TableCell>
                        <TableCell>{hall.layout || 'N/A'}</TableCell>
                        <TableCell align="right">${hall.price.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {/* Detailed Breakdown - Catering */}
        {calculation?.breakdown.catering && calculation.breakdown.catering.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Catering
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculation.breakdown.catering.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell align="right">${item.price.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}

        {/* Detailed Breakdown - Services */}
        {calculation?.breakdown.services && calculation.breakdown.services.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Services
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculation.breakdown.services.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.quantity}</TableCell>
                        <TableCell align="right">${service.price.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>Back</Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </Box>
    </Box>
  );
};

export default Step5FinalEstimate;
