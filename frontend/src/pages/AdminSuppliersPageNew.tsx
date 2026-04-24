import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { api } from '../services/api';
import { Supplier, CreateSupplierDTO, UpdateSupplierDTO, SupplierType } from '../types';

const categories = [
  { id: 'VENUE' as const, label: 'Hotels', icon: Building2, color: 'primary' },
  { id: 'CATERING' as const, label: 'Catering', icon: UtensilsCrossed, color: 'accent' },
  { id: 'SERVICE' as const, label: 'Services', icon: Sparkles, color: 'success' },
];

const AdminSuppliersPageNew: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<SupplierType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const initialFormData = {
    name: '',
    supplierType: 'VENUE' as SupplierType,
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    country: '',
  };

  const [formData, setFormData] = useState<Omit<CreateSupplierDTO, 'settings'>>(initialFormData);

  // Fetching suppliers
  const { data: suppliers = [], isLoading } = useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: api.supplier.listSuppliers,
  });

  // Mutation for creating a supplier
  const createSupplierMutation = useMutation({
    mutationFn: api.supplier.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      handleCloseDialog();
    },
  });

  // Mutation for updating a supplier
  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplierDTO }) => api.supplier.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      handleCloseDialog();
    },
  });

  // Mutation for deleting a supplier
  const deleteSupplierMutation = useMutation({
    mutationFn: api.supplier.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        supplierType: supplier.supplierType,
        contactEmail: supplier.contactEmail || '',
        contactPhone: supplier.contactPhone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country || '',
      });
    } else {
      setEditingSupplier(null);
      setFormData(initialFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleSave = () => {
    const dataToSave = { ...formData, settings: {} }; // Add settings if needed
    if (editingSupplier) {
      updateSupplierMutation.mutate({ id: editingSupplier.id, data: dataToSave });
    } else {
      createSupplierMutation.mutate(dataToSave);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      deleteSupplierMutation.mutate(id);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.supplierType === activeCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: boolean) => (status ? CheckCircle : XCircle);
  const getStatusColor = (status: boolean) =>
    status ? 'text-success-600 bg-success-50' : 'text-error-600 bg-error-50';

  const getCategoryIcon = (type: SupplierType) => {
    return categories.find(c => c.id === type)?.icon || Building2;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Suppliers Management</h1>
            <p className="mt-2 text-neutral-600">Manage all service providers for events</p>
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
        {/* ... (stats can be derived from the `suppliers` data) ... */}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
              activeCategory === 'all' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-neutral-600 hover:bg-neutral-50'
            )}
          >
            All Suppliers
          </button>
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
                  activeCategory === cat.id ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-neutral-600 hover:bg-neutral-50'
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
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="text-center py-16"><Loader2 className="w-8 h-8 mx-auto animate-spin text-primary-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSuppliers.map(supplier => {
                const Icon = getCategoryIcon(supplier.supplierType);
                const StatusIcon = getStatusIcon(supplier.isActive);
                const categoryInfo = categories.find(c => c.id === supplier.supplierType);

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
                              onClick={() => handleOpenDialog(supplier)}
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

                        <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4', getStatusColor(supplier.isActive))}>
                          <StatusIcon className="w-3 h-3" />
                          {supplier.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </div>

                        <div className="text-sm text-neutral-600">
                          <p><strong>Email:</strong> {supplier.contactEmail || 'N/A'}</p>
                          <p><strong>City:</strong> {supplier.city || 'N/A'}</p>
                        </div>

                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSuppliers.length === 0 && (
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
              </div>

              <div className="p-6 space-y-4">
                {!editingSupplier && (
                    <div>
                        <label className="block text-sm font-medium text-neutral-900 mb-3">Select Category</label>
                        <div className="grid grid-cols-3 gap-3">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFormData({ ...formData, supplierType: cat.id })}
                                        className={cn(
                                            'p-4 rounded-xl border-2 transition-all',
                                            formData.supplierType === cat.id ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'
                                        )}
                                    >
                                        <Icon className={cn('w-8 h-8 mx-auto mb-2', formData.supplierType === cat.id ? 'text-primary-600' : 'text-neutral-600')} />
                                        <div className={cn('text-sm font-medium', formData.supplierType === cat.id ? 'text-primary-600' : 'text-neutral-900')}>
                                            {cat.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <Input placeholder="Supplier Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <Input placeholder="Contact Email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                <Input placeholder="Contact Phone" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                <Input placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                <Input placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                <Input placeholder="Country" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />

              </div>

              <div className="p-6 border-t border-neutral-200 flex gap-3">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">Cancel</Button>
                <Button
                  onClick={handleSave}
                  disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  {(createSupplierMutation.isPending || updateSupplierMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
