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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import api from '../../services/api';

interface ServiceCategory {
  id: string;
  name: string;
  hotel: {
    id: string;
    name: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  pricingType: string;
  basePrice: number;
  unit: string | null;
  isActive: boolean;
  category: {
    id: string;
    name: string;
    hotel: {
      id: string;
      name: string;
    };
  };
}

const AdminServicesTab: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    pricingType: 'FIXED',
    basePrice: '',
    unit: '',
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesRes, categoriesRes] = await Promise.all([
        api.get('/admin/services'),
        api.get('/admin/service-categories'),
      ]);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      console.error('Error fetching services data:', err);
      setError(err.response?.data?.error || 'Failed to fetch services data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        categoryId: service.category.id,
        name: service.name,
        description: service.description || '',
        pricingType: service.pricingType,
        basePrice: service.basePrice.toString(),
        unit: service.unit || '',
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        categoryId: categories.length > 0 ? categories[0].id : '',
        name: '',
        description: '',
        pricingType: 'FIXED',
        basePrice: '',
        unit: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingService(null);
  };

  const handleSave = async () => {
    try {
      setError(null);

      const data = {
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description || null,
        pricingType: formData.pricingType,
        basePrice: parseFloat(formData.basePrice),
        unit: formData.unit || null,
        isActive: formData.isActive,
      };

      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, data);
      } else {
        await api.post('/admin/services', data);
      }

      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.error || 'Failed to save service');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/admin/services/${serviceId}`);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting service:', err);
      setError(err.response?.data?.error || 'Failed to delete service');
    }
  };

  const getPricingTypeLabel = (pricingType: string) => {
    const labels: Record<string, string> = {
      FIXED: 'Fixed',
      PER_PERSON: 'Per Person',
      PER_DAY: 'Per Day',
      PER_HOUR: 'Per Hour',
    };
    return labels[pricingType] || pricingType;
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
        <Typography variant="h6">Additional Services</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={categories.length === 0}
        >
          Add Service
        </Button>
      </Box>

      {categories.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No service categories found. Please create categories first.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Hotel</TableCell>
              <TableCell>Pricing Type</TableCell>
              <TableCell align="right">Base Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No services found. Click "Add Service" to create one.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.category.name}</TableCell>
                  <TableCell>{service.category.hotel.name}</TableCell>
                  <TableCell>{getPricingTypeLabel(service.pricingType)}</TableCell>
                  <TableCell align="right">
                    ${parseFloat(service.basePrice.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={service.isActive ? 'Active' : 'Inactive'}
                      color={service.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(service)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(service.id)}
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
        <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  label="Category"
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name} - {category.hotel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Pricing Type</InputLabel>
                <Select
                  value={formData.pricingType}
                  label="Pricing Type"
                  onChange={(e) =>
                    setFormData({ ...formData, pricingType: e.target.value })
                  }
                >
                  <MenuItem value="FIXED">Fixed</MenuItem>
                  <MenuItem value="PER_PERSON">Per Person</MenuItem>
                  <MenuItem value="PER_DAY">Per Day</MenuItem>
                  <MenuItem value="PER_HOUR">Per Hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Price"
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Unit (e.g., piece, day, hour)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
            <Grid item xs={12}>
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
            {editingService ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminServicesTab;
