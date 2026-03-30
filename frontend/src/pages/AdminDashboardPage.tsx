import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  AttachMoney,
  PendingActions,
} from '@mui/icons-material';
import api from '../services/api';
import AdminLayout from '../components/admin/AdminLayout';

interface OverviewStats {
  totalBookings: number;
  bookingsByStatus: Array<{ status: string; count: number }>;
  totalRevenue: number;
  pendingRequests: number;
  avgBookingValue: number;
}

interface RecentBooking {
  id: string;
  eventName: string | null;
  status: string;
  totalPrice: number | null;
  startDate: string;
  createdAt: string;
  user: {
    email: string;
    companyName: string | null;
  };
  hotel: {
    name: string;
  };
}

interface PopularHall {
  hall: {
    name: string;
    maxCapacity: number;
  };
  bookingCount: number;
  totalRevenue: number;
}

interface PopularCatering {
  item: {
    name: string;
    category: {
      name: string;
    };
  };
  orderCount: number;
  totalQuantity: number;
  totalRevenue: number;
}

interface PopularService {
  service: {
    name: string;
    category: {
      name: string;
    };
  };
  orderCount: number;
  totalQuantity: number;
  totalRevenue: number;
}

const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [popularHalls, setPopularHalls] = useState<PopularHall[]>([]);
  const [popularCatering, setPopularCatering] = useState<PopularCatering[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overviewRes,
        recentRes,
        hallsRes,
        cateringRes,
        servicesRes,
      ] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/analytics/recent-bookings', { params: { limit: 5 } }),
        api.get('/admin/analytics/popular-halls', { params: { limit: 5 } }),
        api.get('/admin/analytics/popular-catering', { params: { limit: 5 } }),
        api.get('/admin/analytics/popular-services', { params: { limit: 5 } }),
      ]);

      setOverview(overviewRes.data);
      setRecentBookings(recentRes.data);
      setPopularHalls(hallsRes.data);
      setPopularCatering(cateringRes.data);
      setPopularServices(servicesRes.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
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

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${parseFloat(price.toString()).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: overview?.totalBookings || 0,
      icon: <Assignment />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      iconColor: '#fff',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(overview?.totalRevenue || 0),
      icon: <AttachMoney />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      iconColor: '#fff',
    },
    {
      title: 'Pending Requests',
      value: overview?.pendingRequests || 0,
      icon: <PendingActions />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      iconColor: '#fff',
    },
    {
      title: 'Avg Booking Value',
      value: formatPrice(overview?.avgBookingValue || 0),
      icon: <TrendingUp />,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      iconColor: '#fff',
    },
  ];

  return (
    <AdminLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Overview of your hotel booking operations and analytics
        </Typography>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  background: card.gradient,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      right: -10, 
                      top: -10, 
                      opacity: 0.2,
                      transform: 'rotate(15deg)'
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 100 } })}
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

      {/* Two Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          {/* Booking Status Breakdown */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Status Breakdown
            </Typography>
            <Box>
              {overview?.bookingsByStatus.map((item) => (
                <Box
                  key={item.status}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Chip label={item.status} color={getStatusColor(item.status)} />
                  <Typography variant="h6">{item.count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Popular Halls */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Most Booked Halls
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hall</TableCell>
                    <TableCell align="right">Bookings</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {popularHalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    popularHalls.map((hall, index) => (
                      <TableRow key={index}>
                        <TableCell>{hall.hall?.name}</TableCell>
                        <TableCell align="right">{hall.bookingCount}</TableCell>
                        <TableCell align="right">{formatPrice(hall.totalRevenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Popular Catering */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Most Ordered Catering
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {popularCatering.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    popularCatering.map((catering, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {catering.item?.name}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {catering.item?.category?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{catering.orderCount}</TableCell>
                        <TableCell align="right">{formatPrice(catering.totalRevenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          {/* Recent Bookings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bookings
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No recent bookings
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          {booking.eventName || 'Untitled'}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(booking.startDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {booking.user.companyName || booking.user.email}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{formatPrice(booking.totalPrice)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Popular Services */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Most Requested Services
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {popularServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    popularServices.map((service, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {service.service?.name}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {service.service?.category?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{service.orderCount}</TableCell>
                        <TableCell align="right">{formatPrice(service.totalRevenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  </AdminLayout>
  );
};

export default AdminDashboardPage;
