import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import api from '../services/api';

interface Booking {
  id: string;
  eventName: string | null;
  status: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  totalPrice: number | null;
  createdAt: string;
  user: {
    email: string;
    companyName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  hotel: {
    name: string;
  };
}

const AdminBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');

  // Pagination state
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0'));
  const [rowsPerPage, setRowsPerPage] = useState(parseInt(searchParams.get('limit') || '10'));
  const [total, setTotal] = useState(0);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: page + 1,
        limit: rowsPerPage,
      };

      if (status && status !== 'ALL') params.status = status;
      if (search) params.search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await api.get('/admin/bookings', { params });
      setBookings(response.data.bookings);
      setTotal(response.data.pagination.total);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Update URL with current filters
    const params: any = {
      page: page.toString(),
      limit: rowsPerPage.toString(),
    };
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    setSearchParams(params);
  }, [page, rowsPerPage, status, search, dateFrom, dateTo]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchBookings();
  };

  const handleResetFilters = () => {
    setStatus('ALL');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
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

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin - Bookings Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Event name, company, email..."
            sx={{ minWidth: 250 }}
          />

          <TextField
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
          <Button variant="outlined" onClick={handleResetFilters}>
            Reset
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Bookings Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              No bookings found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Name</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Hotel</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Guests</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow
                      key={booking.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{booking.eventName || 'Untitled'}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {booking.user.firstName && booking.user.lastName
                              ? `${booking.user.firstName} ${booking.user.lastName}`
                              : booking.user.email}
                          </Typography>
                          {booking.user.companyName && (
                            <Typography variant="caption" color="text.secondary">
                              {booking.user.companyName}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{booking.hotel.name}</TableCell>
                      <TableCell>
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </TableCell>
                      <TableCell>{booking.numGuests}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
                      <TableCell>{formatDate(booking.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AdminBookingsPage;
