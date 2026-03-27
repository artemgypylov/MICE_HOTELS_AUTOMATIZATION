import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../../services/api';

interface Hall {
  id: string;
  name: string;
  maxCapacity: number;
  areaSqm: number | null;
  basePricePerDay: number;
  description: string | null;
  floor: number | null;
  naturalLight: boolean;
  isActive: boolean;
  hotel: {
    id: string;
    name: string;
  };
}

const AdminHallsTab: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [formData, setFormData] = useState({
    hotelId: '',
    name: '',
    maxCapacity: '',
    areaSqm: '',
    basePricePerDay: '',
    description: '',
    floor: '',
    naturalLight: false,
    isActive: true,
  });

  const fetchHalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/halls');
      setHalls(response.data);
    } catch (err: any) {
      console.error('Error fetching halls:', err);
      setError(err.response?.data?.error || 'Failed to fetch halls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const handleOpenDialog = (hall?: Hall) => {
    if (hall) {
      setEditingHall(hall);
      setFormData({
        hotelId: hall.hotel.id,
        name: hall.name,
        maxCapacity: hall.maxCapacity.toString(),
        areaSqm: hall.areaSqm?.toString() || '',
        basePricePerDay: hall.basePricePerDay.toString(),
        description: hall.description || '',
        floor: hall.floor?.toString() || '',
        naturalLight: hall.naturalLight,
        isActive: hall.isActive,
      });
    } else {
      setEditingHall(null);
      // Get first hotel ID from existing halls
      const firstHotelId = halls.length > 0 ? halls[0].hotel.id : '';
      setFormData({
        hotelId: firstHotelId,
        name: '',
        maxCapacity: '',
        areaSqm: '',
        basePricePerDay: '',
        description: '',
        floor: '',
        naturalLight: false,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingHall(null);
  };

  const handleSave = async () => {
    try {
      setError(null);

      const data = {
        hotelId: formData.hotelId,
        name: formData.name,
        maxCapacity: parseInt(formData.maxCapacity),
        areaSqm: formData.areaSqm ? parseFloat(formData.areaSqm) : null,
        basePricePerDay: parseFloat(formData.basePricePerDay),
        description: formData.description || null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        naturalLight: formData.naturalLight,
        isActive: formData.isActive,
      };

      if (editingHall) {
        await api.put(`/admin/halls/${editingHall.id}`, data);
      } else {
        await api.post('/admin/halls', data);
      }

      handleCloseDialog();
      fetchHalls();
    } catch (err: any) {
      console.error('Error saving hall:', err);
      setError(err.response?.data?.error || 'Failed to save hall');
    }
  };

  const handleDelete = async (hallId: string) => {
    if (!confirm('Are you sure you want to delete this hall?')) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/admin/halls/${hallId}`);
      fetchHalls();
    } catch (err: any) {
      console.error('Error deleting hall:', err);
      setError(err.response?.data?.error || 'Failed to delete hall');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Halls</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Hall
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Hotel</TableCell>
              <TableCell align="right">Capacity</TableCell>
              <TableCell align="right">Area (m²)</TableCell>
              <TableCell align="right">Price/Day</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {halls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No halls found. Click "Add Hall" to create one.
                </TableCell>
              </TableRow>
            ) : (
              halls.map((hall) => (
                <TableRow key={hall.id}>
                  <TableCell>{hall.name}</TableCell>
                  <TableCell>{hall.hotel.name}</TableCell>
                  <TableCell align="right">{hall.maxCapacity}</TableCell>
                  <TableCell align="right">
                    {hall.areaSqm ? hall.areaSqm.toString() : 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    ${parseFloat(hall.basePricePerDay.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={hall.isActive ? 'Active' : 'Inactive'}
                      color={hall.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(hall)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(hall.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingHall ? 'Edit Hall' : 'Add New Hall'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hall Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Capacity"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Area (m²)"
                type="number"
                value={formData.areaSqm}
                onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Price Per Day"
                type="number"
                value={formData.basePricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, basePricePerDay: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Floor"
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.naturalLight}
                    onChange={(e) =>
                      setFormData({ ...formData, naturalLight: e.target.checked })
                    }
                  />
                }
                label="Natural Light"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingHall ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminHallsTab;
