import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Building2,
  UtensilsCrossed,
  Sparkles,
  Link as LinkIcon,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button, Card, CardContent, Badge, Input, Dialog } from '@/components/ui';
import { cn } from '@/lib/utils';
import AdminLayout from '../components/admin/AdminLayout';
import { appwriteData } from '../services/appwriteData';

type SupplierCategory = 'hotels' | 'catering' | 'services';

interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  apiEndpoint: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'pending';
  itemsCount: number;
  lastSync?: string;
  createdAt: string;
}

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Booking.com API',
    category: 'hotels',
    apiEndpoint: 'https://api.booking.com/v1',
    apiKey: 'bk_*****',
    status: 'active',
    itemsCount: 150,
    lastSync: '2024-03-29 14:30',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'FoodHub Catering',
    category: 'catering',
    apiEndpoint: 'https://api.foodhub.com',
    apiKey: 'fh_*****',
    status: 'active',
    itemsCount: 89,
    lastSync: '2024-03-29 12:15',
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    name: 'EventPro Services',
    category: 'services',
    apiEndpoint: 'https://api.eventpro.com',
    apiKey: 'ep_*****',
    status: 'pending',
    itemsCount: 0,
    createdAt: '2024-03-01',
  },
  {
    id: '4',
    name: 'Travelport Hotels',
    category: 'hotels',
    apiEndpoint: 'https://api.travelport.com/hotels',
    apiKey: 'tp_*****',
    status: 'active',
    itemsCount: 203,
    lastSync: '2024-03-29 10:45',
    createdAt: '2024-01-20',
  },
];

const categories = [
  { id: 'hotels' as const, label: 'Hotels', icon: Building2, color: 'primary' },
  { id: 'catering' as const, label: 'Catering', icon: UtensilsCrossed, color: 'accent' },
  { id: 'services' as const, label: 'Services', icon: Sparkles, color: 'success' },
];

const AdminSuppliersPageNew: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [activeCategory, setActiveCategory] = useState<SupplierCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SupplierCategory>('hotels');
  const [formData, setFormData] = useState({
    name: '',
    apiEndpoint: '',
    apiKey: '',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  const handleOpenDialog = (category?: SupplierCategory, supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSelectedCategory(supplier.category);
      setFormData({
        name: supplier.name,
        apiEndpoint: supplier.apiEndpoint,
        apiKey: '',
      });
    } else {
      setEditingSupplier(null);
      setSelectedCategory(category || 'hotels');
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
        category: selectedCategory,
        apiEndpoint: formData.apiEndpoint,
        apiKey: formData.apiKey.substring(0, 3) + '_*****',
        status: 'pending',
        itemsCount: 0,
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

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'pending': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-50';
      case 'inactive': return 'text-error-600 bg-error-50';
      case 'pending': return 'text-warning-600 bg-warning-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getCategoryIcon = (category: SupplierCategory) => {
    return categories.find(c => c.id === category)?.icon || Building2;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Suppliers Management</h1>
            <p className="mt-2 text-neutral-600">
              Manage API integrations with external providers by category
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">
                    {suppliers.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {categories.map((cat) => {
            const count = suppliers.filter(s => s.category === cat.id).length;
            const Icon = cat.icon;
            return (
              <Card key={cat.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">{cat.label}</p>
                      <p className="text-2xl font-bold text-neutral-900 mt-1">{count}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-${cat.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${cat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
              activeCategory === 'all'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-neutral-600 hover:bg-neutral-50'
            )}
          >
            All Suppliers
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSuppliers.map((supplier) => {
              const Icon = getCategoryIcon(supplier.category);
              const StatusIcon = getStatusIcon(supplier.status);
              const categoryInfo = categories.find(c => c.id === supplier.category);
              
              return (
                <motion.div
                  key={supplier.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group h-full">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                              {supplier.name}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className="mt-1 text-xs bg-primary-50 text-primary-700 border-primary-200"
                            >
                              {categoryInfo?.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleOpenDialog(undefined, supplier)}
                            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-neutral-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id)}
                            className="p-2 rounded-lg hover:bg-error-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-error-600" />
                          </button>
                        </div>
                      </div>

                      {/* Status */}
                      <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4', getStatusColor(supplier.status))}>
                        <StatusIcon className="w-3 h-3" />
                        {supplier.status.toUpperCase()}
                      </div>

                      {/* API Endpoint */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-neutral-600">
                        <LinkIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{supplier.apiEndpoint}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* API Key */}
                      <div className="text-xs text-neutral-500 mb-4">
                        API Key: <code className="bg-neutral-100 px-2 py-0.5 rounded">{supplier.apiKey}</code>
                      </div>

                      {/* Stats */}
                      <div className="pt-4 border-t border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Items Connected</span>
                          <span className="text-lg font-bold text-primary-600">{supplier.itemsCount}</span>
                        </div>
                        {supplier.lastSync && (
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>Last Sync</span>
                            <span>{supplier.lastSync}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredSuppliers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No suppliers found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Add your first supplier to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
            )}
          </motion.div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <p className="text-neutral-600 mt-1">
                  {editingSupplier ? 'Update supplier information' : 'Configure API integration for external provider'}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Category Selection (only for new supplier) */}
                {!editingSupplier && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-3">
                      Select Category
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                              'p-4 rounded-xl border-2 transition-all',
                              selectedCategory === cat.id
                                ? 'border-primary-600 bg-primary-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                            )}
                          >
                            <Icon className={cn(
                              'w-8 h-8 mx-auto mb-2',
                              selectedCategory === cat.id ? 'text-primary-600' : 'text-neutral-600'
                            )} />
                            <div className={cn(
                              'text-sm font-medium',
                              selectedCategory === cat.id ? 'text-primary-600' : 'text-neutral-900'
                            )}>
                              {cat.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    Supplier Name
                  </label>
                  <Input
                    placeholder="e.g., Booking.com API"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* API Endpoint */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    API Endpoint URL
                  </label>
                  <Input
                    placeholder="https://api.supplier.com/v1"
                    value={formData.apiEndpoint}
                    onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                  />
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">
                    API Key
                  </label>
                  <Input
                    type="password"
                    placeholder={editingSupplier ? 'Leave blank to keep current' : 'Enter API key'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  />
                </div>

                {/* Test Connection */}
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testingConnection || !formData.apiEndpoint}
                  className="w-full"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>

                {/* Connection Status */}
                {connectionStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'p-4 rounded-lg flex items-start gap-3',
                      connectionStatus === 'success' ? 'bg-success-50 text-success-900' : 'bg-error-50 text-error-900'
                    )}
                  >
                    {connectionStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {connectionStatus === 'success' ? 'Connection Successful!' : 'Connection Failed'}
                      </p>
                      <p className="text-sm mt-1 opacity-80">
                        {connectionStatus === 'success'
                          ? 'API is responding correctly and ready to use.'
                          : 'Please check your credentials and try again.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-neutral-200 flex gap-3">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.apiEndpoint}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                </Button>
              </div>
            </motion.div>
          </div>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSuppliersPageNew;
