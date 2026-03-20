import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Hotel } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      const response = await api.get('/hotels');
      return response.data;
    },
  });

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);

      // Fetch user role
      const userResponse = await api.get('/auth/me');
      localStorage.setItem('userRole', userResponse.data.role);

      setLoginOpen(false);

      // Navigate based on role
      if (userResponse.data.role === 'MANAGER' || userResponse.data.role === 'ADMIN') {
        navigate('/admin/bookings');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await api.post('/auth/register', { email, password });
      localStorage.setItem('token', response.data.token);

      // Fetch user role
      const userResponse = await api.get('/auth/me');
      localStorage.setItem('userRole', userResponse.data.role);

      setRegisterOpen(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleStartBooking = (hotelId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginOpen(true);
      return;
    }
    navigate(`/wizard/${hotelId}`);
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>Loading hotels...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to MICE Event Constructor
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph align="center">
        Plan your perfect business event in minutes
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {hotels?.map((hotel) => (
          <Grid item key={hotel.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {hotel.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hotel.city}, {hotel.country}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {hotel.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => handleStartBooking(hotel.id)}>
                  Start Booking
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Login Dialog */}
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
          <Button onClick={() => { setLoginOpen(false); setRegisterOpen(true); }}>Register</Button>
          <Button onClick={handleLogin} variant="contained">Login</Button>
        </DialogActions>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterOpen(false)}>Cancel</Button>
          <Button onClick={handleRegister} variant="contained">Register</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HomePage;
