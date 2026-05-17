import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  ChevronRight,
  Wifi,
  Monitor,
  Camera,
  Headphones,
  Printer,
  Car,
  Users,
  Lightbulb,
  Plus,
  Minus,
  Check,
  Package
} from 'lucide-react';
import { WizardData, ServiceCategory } from '../../../types';
import { Button, Card, Badge, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import api from '../../../services/api';

interface Step4Props {
  data: WizardData;
  bookingId: string | null;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Technical Equipment': Monitor,
  'Audio Visual': Headphones,
  'Photography': Camera,
  'Transportation': Car,
  'Staffing': Users,
  'Printing': Printer,
  'Internet': Wifi,
  'Decoration': Lightbulb,
};

const pricingTypeLabels: Record<string, string> = {
  'FIXED': '',
  'PER_PERSON': '/person',
  'PER_DAY': '/day',
  'PER_HOUR': '/hour',
};

const Step4AdditionalServices: React.FC<Step4Props> = ({ data, bookingId, onUpdate, onNext, onBack }) => {
  const [selectedServices, setSelectedServices] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: categories } = useQuery<ServiceCategory[]>({
    queryKey: ['services', data.hotelId],
    queryFn: async () => {
      const response = await api.get(`/hotels/${data.hotelId}/services`);
      return response.data;
    },
  });

  const handleQuantityChange = (serviceId: string, delta: number) => {
    const newSelection = new Map(selectedServices);
    const currentQty = newSelection.get(serviceId) || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    if (newQty > 0) {
      newSelection.set(serviceId, newQty);
    } else {
      newSelection.delete(serviceId);
    }
    setSelectedServices(newSelection);
  };

  const setQuantity = (serviceId: string, quantity: number) => {
    const newSelection = new Map(selectedServices);
    if (quantity > 0) {
      newSelection.set(serviceId, quantity);
    } else {
      newSelection.delete(serviceId);
    }
    setSelectedServices(newSelection);
  };

  const handleNext = async () => {
    const servicesData = Array.from(selectedServices.entries()).map(([serviceId, quantity]) => ({
      serviceId,
      quantity,
    }));

    setLoading(true);
    try {
      await api.put(`/bookings/${bookingId}`, {
        services: servicesData,
      });

      onUpdate({ selectedServices: servicesData });
      onNext();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onUpdate({ selectedServices: [] });
    onNext();
  };

  const totalItems = selectedServices.size;

  const getPricingLabel = (pricingType: string, basePrice: number, unit?: string) => {
    const suffix = pricingTypeLabels[pricingType] || (unit ? `/${unit}` : '');
    return `$${basePrice}${suffix}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Additional Services
        </h2>
        <p className="mt-2 text-gray-500">
          Enhance your event with extra equipment and services
        </p>
      </div>

      {/* Summary bar */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-gradient-to-r from-accent-50 to-pink-50 border border-accent-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100">
                <Package className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{totalItems} services selected</p>
              </div>
            </div>
            <Badge className="bg-accent-100 text-accent-700">
              <Check className="mr-1 h-3 w-3" />
              Services Added
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        {categories?.map((category, categoryIndex) => {
          const Icon = categoryIcons[category.name] || Package;
          const isExpanded = expandedCategory === category.id || expandedCategory === null;
          const categorySelectedCount = category.services.filter(s => selectedServices.has(s.id)).length;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <Card className="overflow-hidden border-0 shadow-lg">
                {/* Category header */}
                <button
                  onClick={() => setExpandedCategory(isExpanded ? 'none' : category.id)}
                  className="flex w-full items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-100 to-pink-100">
                      <Icon className="h-5 w-5 text-accent-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.services.length} services available</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {categorySelectedCount > 0 && (
                      <Badge className="bg-green-100 text-green-700">
                        {categorySelectedCount} selected
                      </Badge>
                    )}
                    <ChevronRight className={cn(
                      'h-5 w-5 text-gray-400 transition-transform',
                      isExpanded && 'rotate-90'
                    )} />
                  </div>
                </button>

                {/* Services */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {category.services.map((service, serviceIndex) => {
                        const quantity = selectedServices.get(service.id) || 0;
                        const isSelected = quantity > 0;

                        return (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: serviceIndex * 0.03 }}
                          >
                            <div
                              className={cn(
                                'relative rounded-xl border-2 p-4 transition-all duration-300',
                                isSelected
                                  ? 'border-accent-500 bg-accent-50/50 shadow-lg shadow-accent-500/10'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                              )}
                            >
                              {/* Selected indicator */}
                              {isSelected && (
                                <div className="absolute -top-2 -right-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg">
                                    <Check className="h-4 w-4" />
                                  </div>
                                </div>
                              )}

                              <div className="flex items-start gap-3 mb-3">
                                <div className={cn(
                                  'flex h-10 w-10 items-center justify-center rounded-lg',
                                  isSelected ? 'bg-accent-100' : 'bg-gray-100'
                                )}>
                                  <Icon className={cn(
                                    'h-5 w-5',
                                    isSelected ? 'text-accent-600' : 'text-gray-500'
                                  )} />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                  <p className="text-lg font-bold text-accent-600">
                                    {getPricingLabel(service.pricingType, service.basePrice, service.unit)}
                                  </p>
                                </div>
                              </div>

                              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                {service.description}
                              </p>

                              {/* Quantity controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuantityChange(service.id, -1)}
                                  disabled={quantity === 0}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                
                                <Input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => setQuantity(service.id, parseInt(e.target.value) || 0)}
                                  className="h-8 w-16 text-center"
                                  min={0}
                                />
                                
                                <button
                                  onClick={() => handleQuantityChange(service.id, 1)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>

                                {quantity === 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuantity(service.id, 1)}
                                    className="ml-auto"
                                  >
                                    Add
                                  </Button>
                                )}
                              </div>

                              {isSelected && (
                                <p className="mt-3 text-sm font-medium text-accent-600">
                                  Subtotal: ${(service.basePrice * quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Services
          </Button>
          <Button variant="gradient" onClick={handleNext} disabled={loading}>
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                Review Summary
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4AdditionalServices;
