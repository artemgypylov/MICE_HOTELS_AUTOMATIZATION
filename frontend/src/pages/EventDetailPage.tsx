import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:parameter>
<invoke name="useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ConfirmIcon,
  Cancel as CancelIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { Event, EventSupplier, EventStatus, SupplierType } from '../types';

interface EventWithDetails extends Event {
  eventSuppliers?: Array<EventSupplier & {
    supplier: {
      id: string;
      name: string;
      supplierType: SupplierType;
      city?: string;
    };
    eventItems?: Array<{
      id: string;
      itemType: string;
      quantity: number;
      price: number;
      serviceDate?: string;
    }>;
  }>;
}

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading, error } = useQuery<EventWithDetails>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/events/${eventId}/submit`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/events/${eventId}/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const getStatusColor = (status: EventStatus) => {
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

  const getSupplierTypeLabel = (type: SupplierType): string => {
    const labels = {
      VENUE: 'Venue',
      CATERING: 'Catering',
      DECORATION: 'Decoration',
      AV_IT: 'AV/IT',
      TRANSFER: 'Transfer',
      ACCOMMODATION: 'Accommodation',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          Event not found or you don't have permission to view it.
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/events')} sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    );
  }

  const totalSuppliers = event.eventSuppliers?.length || 0;
  const totalItems = event.eventSuppliers?.reduce((sum, es) => sum + (es.eventItems?.length || 0), 0) || 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/events')} sx={{ mb: 2 }}>
          Back to Events
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {event.eventName || 'Unnamed Event'}
          </Typography>
          <Chip label={event.status} color={getStatusColor(event.status)} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Event Summary Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Event Format
                </Typography>
                <Typography variant="body1">
                  {event.eventFormat || 'Not specified'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Dates
                </Typography>
                <Typography variant="body1">
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Number of Guests
                </Typography>
                <Typography variant="body1">
                  {event.numGuests}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Suppliers
                </Typography>
                <Typography variant="body1">
                  {totalSuppliers} supplier{totalSuppliers !== 1 ? 's' : ''}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Total Items
                </Typography>
                <Typography variant="body1">
                  {totalItems}
                </Typography>
              </Box>

              {event.notes && (
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Notes
                  </Typography>
                  <Typography variant="body2">
                    {event.notes}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Price:
                </Typography>
                <Typography variant="h6" color="primary">
                  {event.totalPrice ? `€${event.totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : 'TBD'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {event.status === 'DRAFT' && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<SubmitIcon />}
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  sx={{ mb: 1 }}
                >
                  Submit for Approval
                </Button>
              )}

              {(event.status === 'DRAFT' || event.status === 'PENDING') && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                >
                  Cancel Event
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Suppliers and Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Suppliers & Services
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {event.eventSuppliers && event.eventSuppliers.length > 0 ? (
              event.eventSuppliers.map((eventSupplier) => (
                <Box key={eventSupplier.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {eventSupplier.supplier?.name}
                    </Typography>
                    <Chip
                      label={getSupplierTypeLabel(eventSupplier.supplierType)}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={eventSupplier.status}
                      size="small"
                      color={eventSupplier.status === 'CONFIRMED' ? 'success' : 'default'}
                    />
                  </Box>

                  {eventSupplier.eventItems && eventSupplier.eventItems.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell>Service Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {eventSupplier.eventItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.itemType}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">
                                €{Number(item.price).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                {item.serviceDate ? new Date(item.serviceDate).toLocaleDateString() : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={2} align="right">
                              <strong>Supplier Total:</strong>
                            </TableCell>
                            <TableCell align="right">
                              <strong>
                                €{(eventSupplier.totalPrice || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                              </strong>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No items selected from this supplier yet.
                    </Typography>
                  )}

                  {eventSupplier.notes && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Notes:
                      </Typography>
                      <Typography variant="body2">
                        {eventSupplier.notes}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))
            ) : (
              <Alert severity="info">
                No suppliers added to this event yet.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetailPage;
