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

interface CateringCategory {
  id: string;
  name: string;
  hotel: {
    id: string;
    name: string;
  };
}

interface CateringItem {
  id: string;
  name: string;
  description: string | null;
  pricePerPerson: number;
  minPersons: number;
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

const AdminCateringTab: React.FC = () => {
  const [items, setItems] = useState<CateringItem[]>([]);
  const [categories, setCategories] = useState<CateringCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CateringItem | null>(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    pricePerPerson: '',
    minPersons: '1',
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/admin/catering-items'),
        api.get('/admin/catering-categories'),
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      console.error('Error fetching catering data:', err);
      setError(err.response?.data?.error || 'Failed to fetch catering data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (item?: CateringItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        categoryId: item.category.id,
        name: item.name,
        description: item.description || '',
        pricePerPerson: item.pricePerPerson.toString(),
        minPersons: item.minPersons.toString(),
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        categoryId: categories.length > 0 ? categories[0].id : '',
        name: '',
        description: '',
        pricePerPerson: '',
        minPersons: '1',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    try {
      setError(null);

      const data = {
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description || null,
        pricePerPerson: parseFloat(formData.pricePerPerson),
        minPersons: parseInt(formData.minPersons),
        isActive: formData.isActive,
      };

      if (editingItem) {
        await api.put(`/admin/catering-items/${editingItem.id}`, data);
      } else {
        await api.post('/admin/catering-items', data);
      }

      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      console.error('Error saving catering item:', err);
      setError(err.response?.data?.error || 'Failed to save catering item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this catering item?')) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/admin/catering-items/${itemId}`);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting catering item:', err);
      setError(err.response?.data?.error || 'Failed to delete catering item');
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
        <Typography variant="h6">Catering Items</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={categories.length === 0}
        >
          Add Catering Item
        </Button>
      </Box>

      {categories.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No catering categories found. Please create categories first.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Hotel</TableCell>
              <TableCell align="right">Price/Person</TableCell>
              <TableCell align="right">Min Persons</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No catering items found. Click "Add Catering Item" to create one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>{item.category.hotel.name}</TableCell>
                  <TableCell align="right">
                    ${parseFloat(item.pricePerPerson.toString()).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{item.minPersons}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.isActive ? 'Active' : 'Inactive'}
                      color={item.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(item)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
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
        <DialogTitle>
          {editingItem ? 'Edit Catering Item' : 'Add New Catering Item'}
        </DialogTitle>
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
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price Per Person"
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerPerson: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Persons"
                type="number"
                value={formData.minPersons}
                onChange={(e) =>
                  setFormData({ ...formData, minPersons: e.target.value })
                }
                required
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
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCateringTab;
