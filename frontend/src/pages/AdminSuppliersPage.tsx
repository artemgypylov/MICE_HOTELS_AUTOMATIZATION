import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import LinkIcon from '@mui/icons-material/Link';
import AdminLayout from '../components/admin/AdminLayout';

interface Supplier {
  id: string;
  name: string;
  apiEndpoint: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'pending';
  hotelsCount: number;
  createdAt: string;
}

// Mock data since we don't have a real API yet
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Booking.com API',
    apiEndpoint: 'https://api.booking.com/v1',
    apiKey: 'bk_*****',
    status: 'active',
    hotelsCount: 150,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Travelport',
    apiEndpoint: 'https://api.travelport.com/hotels',
    apiKey: 'tp_*****',
    status: 'active',
    hotelsCount: 89,
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Amadeus GDS',
    apiEndpoint: 'https://api.amadeus.com/v2',
    apiKey: 'am_*****',
    status: 'pending',
    hotelsCount: 0,
    createdAt: '2024-03-01',
  },
];

const AdminSuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    apiEndpoint: '',
    apiKey: '',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        apiEndpoint: supplier.apiEndpoint,
        apiKey: '',
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', apiEndpoint: '', apiKey: '' });
    }
    setConnectionStatus(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
    setFormData({ name: '', apiEndpoint: '', apiKey: '' });
    setConnectionStatus(null);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus(Math.random() > 0.3 ? 'success' : 'error');
    setTestingConnection(false);
  };

  const handleSave = () => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => 
        s.id === editingSupplier.id 
          ? { ...s, name: formData.name, apiEndpoint: formData.apiEndpoint }
          : s
      ));
    } else {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        name: formData.name,
        apiEndpoint: formData.apiEndpoint,
        apiKey: formData.apiKey.substring(0, 3) + '_*****',
        status: 'pending',
        hotelsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Suppliers
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage API integrations with hotel suppliers
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              px: 3,
            }}
          >
            Add Supplier
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3}>
          {filteredSuppliers.map((supplier) => (
            <Grid item xs={12} md={6} lg={4} key={supplier.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                    <Box 
                      sx={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BusinessIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(supplier)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(supplier.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {supplier.name}
                  </Typography>
                  
                  <Chip 
                    label={supplier.status.toUpperCase()} 
                    color={getStatusColor(supplier.status) as any}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LinkIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {supplier.apiEndpoint}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    API Key: {supplier.apiKey}
                  </Typography>
                  
                  <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {supplier.hotelsCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hotels Connected
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredSuppliers.length === 0 && (
          <Box textAlign="center" py={8}>
            <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No suppliers found
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              Add your first supplier to start importing hotels
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Supplier
            </Button>
          </Box>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Supplier Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="API Endpoint URL"
                placeholder="https://api.supplier.com/v1"
                value={formData.apiEndpoint}
                onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="API Key"
                type="password"
                placeholder={editingSupplier ? 'Leave blank to keep current' : 'Enter API key'}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                sx={{ mb: 3 }}
              />
              
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testingConnection || !formData.apiEndpoint}
                fullWidth
              >
                {testingConnection ? (
                  <CircularProgress size={24} />
                ) : (
                  'Test Connection'
                )}
              </Button>
              
              {connectionStatus && (
                <Alert 
                  severity={connectionStatus === 'success' ? 'success' : 'error'} 
                  sx={{ mt: 2 }}
                >
                  {connectionStatus === 'success' 
                    ? 'Connection successful! API is responding correctly.'
                    : 'Connection failed. Please check your credentials.'}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSave}
              disabled={!formData.name || !formData.apiEndpoint}
            >
              {editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default AdminSuppliersPage;
