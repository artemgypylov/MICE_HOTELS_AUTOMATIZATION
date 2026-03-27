import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon } from '@mui/icons-material';
import api from '../services/api';
import { Event, EventStatus } from '../types';

const EventDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data;
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

  const filteredEvents = events?.filter((event) =>
    statusFilter === 'ALL' || event.status === statusFilter
  ) || [];

  const getSupplierCount = (event: Event): number => {
    return event.eventSuppliers?.length || 0;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading events...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Events
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/new')}
        >
          Create New Event
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(_e, value) => setStatusFilter(value)}
          variant="fullWidth"
        >
          <Tab label="All" value="ALL" />
          <Tab label="Draft" value="DRAFT" />
          <Tab label="Pending" value="PENDING" />
          <Tab label="Confirmed" value="CONFIRMED" />
          <Tab label="Cancelled" value="CANCELLED" />
        </Tabs>
      </Paper>

      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No events found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {statusFilter === 'ALL'
              ? 'Create your first event to get started'
              : `No events with status: ${statusFilter}`
            }
          </Typography>
          {statusFilter === 'ALL' && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/events/new')}
              sx={{ mt: 2 }}
            >
              Create Event
            </Button>
          )}
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell align="center">Guests</TableCell>
                <TableCell align="center">Suppliers</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total Price</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {event.eventName || 'Unnamed Event'}
                    </Typography>
                    {event.eventFormat && (
                      <Typography variant="caption" color="textSecondary">
                        {event.eventFormat}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {/* City would come from event details or first venue */}
                    -
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(event.startDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      to {new Date(event.endDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{event.numGuests}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getSupplierCount(event)}
                      size="small"
                      color={getSupplierCount(event) > 0 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.status}
                      color={getStatusColor(event.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {event.totalPrice ? (
                      <Typography variant="body2" fontWeight="medium">
                        €{event.totalPrice.toLocaleString('de-DE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/events/${event.id}`)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          Total Events: {filteredEvents.length}
          {statusFilter !== 'ALL' && ` (${statusFilter})`}
        </Typography>
      </Box>
    </Container>
  );
};

export default EventDashboardPage;
