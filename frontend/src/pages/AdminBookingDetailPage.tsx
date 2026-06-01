import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../services/api';

interface Author {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: Author;
}

interface StatusHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
  changedBy: Author;
}

const authorName = (a: Author): string =>
  [a.firstName, a.lastName].filter(Boolean).join(' ') || a.email;

interface BookingDetail {
  id: string;
  eventName: string | null;
  eventFormat: string | null;
  status: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  totalPrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  user: {
    email: string;
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  };
  hotel: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  bookingHalls: Array<{
    id: string;
    bookingDate: string;
    price: number;
    hall: {
      name: string;
      maxCapacity: number;
    };
    seatingLayout: {
      layoutType: string;
      capacity: number;
    } | null;
  }>;
  bookingCatering: Array<{
    id: string;
    quantity: number;
    price: number;
    serviceDate: string | null;
    cateringItem: {
      name: string;
      pricePerPerson: number;
      category: {
        name: string;
      };
    };
  }>;
  bookingServices: Array<{
    id: string;
    quantity: number;
    price: number;
    service: {
      name: string;
      basePrice: number;
      pricingType: string;
      category: {
        name: string;
      };
    };
  }>;
}

const AdminBookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/bookings/${id}`);
      setBooking(response.data);
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      setError(err.response?.data?.error || 'Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsAndHistory = async () => {
    try {
      const [c, h] = await Promise.all([
        api.get(`/admin/bookings/${id}/comments`),
        api.get(`/admin/bookings/${id}/status-history`),
      ]);
      setComments(c.data);
      setHistory(h.data);
    } catch (err) {
      console.error('Error fetching comments/history:', err);
    }
  };

  useEffect(() => {
    fetchBooking();
    fetchCommentsAndHistory();
  }, [id]);

  const handleStatusChange = async () => {
    try {
      setUpdatingStatus(true);
      await api.put(`/admin/bookings/${id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
      });
      setStatusDialogOpen(false);
      setStatusNote('');
      fetchBooking();
      fetchCommentsAndHistory();
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setPostingComment(true);
      await api.post(`/admin/bookings/${id}/comment`, { text: newComment.trim() });
      setNewComment('');
      fetchCommentsAndHistory();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setPostingComment(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !booking) {
    return (
      <Box>
        <Alert severity="error">{error || 'Booking not found'}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/bookings')}
          sx={{ mt: 2 }}
        >
          Back to Bookings
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/bookings')}
          >
            Back
          </Button>
          <Typography variant="h4">
            Booking Details
          </Typography>
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status)}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setNewStatus(booking.status);
            setStatusDialogOpen(true);
          }}
        >
          Change Status
        </Button>
      </Box>

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Event Name
            </Typography>
            <Typography variant="body1">{booking.eventName || 'Untitled'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Event Format
            </Typography>
            <Typography variant="body1">{booking.eventFormat || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Date Range
            </Typography>
            <Typography variant="body1">
              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Number of Guests
            </Typography>
            <Typography variant="body1">{booking.numGuests}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Total Price
            </Typography>
            <Typography variant="h6" color="primary">
              {formatPrice(booking.totalPrice)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Submitted At
            </Typography>
            <Typography variant="body1">
              {booking.submittedAt ? formatDateTime(booking.submittedAt) : 'Not submitted'}
            </Typography>
          </Grid>
          {booking.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body1">{booking.notes}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Client Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Client Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">
              {booking.user.firstName && booking.user.lastName
                ? `${booking.user.firstName} ${booking.user.lastName}`
                : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{booking.user.email}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Company
            </Typography>
            <Typography variant="body1">{booking.user.companyName || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1">{booking.user.phone || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Hotel Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hotel Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Hotel Name
            </Typography>
            <Typography variant="body1">{booking.hotel.name}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body1">
              {booking.hotel.address && booking.hotel.city
                ? `${booking.hotel.address}, ${booking.hotel.city}`
                : booking.hotel.address || booking.hotel.city || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Contact Email
            </Typography>
            <Typography variant="body1">{booking.hotel.contactEmail || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Contact Phone
            </Typography>
            <Typography variant="body1">{booking.hotel.contactPhone || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Halls */}
      {booking.bookingHalls.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Halls
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hall Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Layout</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {booking.bookingHalls.map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCell>{hall.hall.name}</TableCell>
                    <TableCell>{formatDate(hall.bookingDate)}</TableCell>
                    <TableCell>
                      {hall.seatingLayout
                        ? `${hall.seatingLayout.capacity} (${hall.hall.maxCapacity} max)`
                        : hall.hall.maxCapacity}
                    </TableCell>
                    <TableCell>
                      {hall.seatingLayout?.layoutType || 'Standard'}
                    </TableCell>
                    <TableCell align="right">{formatPrice(hall.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Catering */}
      {booking.bookingCatering.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Catering
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Quantity (Persons)</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {booking.bookingCatering.map((catering) => (
                  <TableRow key={catering.id}>
                    <TableCell>{catering.cateringItem.category.name}</TableCell>
                    <TableCell>{catering.cateringItem.name}</TableCell>
                    <TableCell>
                      {catering.serviceDate ? formatDate(catering.serviceDate) : 'N/A'}
                    </TableCell>
                    <TableCell align="right">{catering.quantity}</TableCell>
                    <TableCell align="right">{formatPrice(catering.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Services */}
      {booking.bookingServices.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Services
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Pricing Type</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {booking.bookingServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.service.category.name}</TableCell>
                    <TableCell>{service.service.name}</TableCell>
                    <TableCell>{service.service.pricingType}</TableCell>
                    <TableCell align="right">{service.quantity}</TableCell>
                    <TableCell align="right">{formatPrice(service.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Timestamps */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Audit Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1">{formatDateTime(booking.createdAt)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body1">{formatDateTime(booking.updatedAt)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Status History (timeline) */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          История статусов
        </Typography>
        {history.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Изменений статуса пока нет.
          </Typography>
        ) : (
          <List dense>
            {history.map((h) => (
              <ListItem key={h.id} sx={{ borderLeft: '2px solid #1976d2', pl: 2, mb: 1 }}>
                <ListItemText
                  primary={
                    <span>
                      {h.fromStatus ? `${h.fromStatus} → ` : ''}
                      <strong>{h.toStatus}</strong>
                      {h.note ? ` — ${h.note}` : ''}
                    </span>
                  }
                  secondary={`${authorName(h.changedBy)} · ${formatDateTime(h.createdAt)}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Manager comments */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Комментарии менеджера
        </Typography>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Комментариев пока нет.
          </Typography>
        ) : (
          <List>
            {comments.map((c) => (
              <ListItem key={c.id} alignItems="flex-start" sx={{ display: 'block' }}>
                <Typography variant="body2">{c.text}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {authorName(c.author)} · {formatDateTime(c.createdAt)}
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </ListItem>
            ))}
          </List>
        )}
        <Box display="flex" gap={1} mt={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Добавить комментарий…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
          />
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={postingComment || !newComment.trim()}
          >
            {postingComment ? '…' : 'Отправить'}
          </Button>
        </Box>
      </Paper>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Booking Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a new status for this booking:
          </DialogContentText>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            size="small"
            label="Комментарий / причина (опционально)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={updatingStatus}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            disabled={updatingStatus || newStatus === booking.status}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookingDetailPage;
