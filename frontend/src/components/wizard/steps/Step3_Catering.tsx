import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  ChevronRight,
  Coffee,
  UtensilsCrossed,
  Wine,
  Cake,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { WizardData, CateringCategory } from '../../../types';
import { Button, Card, Badge, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import api from '../../../services/api';

interface Step3Props {
  data: WizardData;
  bookingId: string | null;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Food images from Unsplash
const foodImages: Record<string, string> = {
  'Coffee Break': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
  'Lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  'Dinner': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
  'Breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Coffee Breaks': Coffee,
  'Lunches': UtensilsCrossed,
  'Dinners': Wine,
  'Desserts': Cake,
};

const dietaryIcons: Record<string, string> = {
  'Vegetarian': '🥬',
  'Vegan': '🌱',
  'Gluten-Free': '🌾',
  'Halal': '☪️',
  'Kosher': '✡️',
};

const Step3Catering: React.FC<Step3Props> = ({ data, bookingId, onUpdate, onNext, onBack }) => {
  const [selectedCatering, setSelectedCatering] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: categories } = useQuery<CateringCategory[]>({
    queryKey: ['catering', data.hotelId],
    queryFn: async () => {
      const response = await api.get(`/hotels/${data.hotelId}/catering`);
      return response.data;
    },
  });

  const handleQuantityChange = (itemId: string, delta: number) => {
    const newSelection = new Map(selectedCatering);
    const currentQty = newSelection.get(itemId) || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    if (newQty > 0) {
      newSelection.set(itemId, newQty);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedCatering(newSelection);
  };

  const setQuantity = (itemId: string, quantity: number) => {
    const newSelection = new Map(selectedCatering);
    if (quantity > 0) {
      newSelection.set(itemId, quantity);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedCatering(newSelection);
  };

  const handleNext = async () => {
    const cateringData = Array.from(selectedCatering.entries()).map(([itemId, quantity]) => ({
      cateringItemId: itemId,
      quantity,
    }));

    setLoading(true);
    try {
      await api.put(`/bookings/${bookingId}`, {
        catering: cateringData,
      });

      onUpdate({ selectedCatering: cateringData });
      onNext();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onUpdate({ selectedCatering: [] });
    onNext();
  };

  const totalItems = selectedCatering.size;
  const totalServings = Array.from(selectedCatering.values()).reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Food & Beverage Options
        </h2>
        <p className="mt-2 text-gray-500">
          Select catering packages for your event (optional)
        </p>
      </div>

      {/* Summary bar */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                <UtensilsCrossed className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{totalItems} items selected</p>
                <p className="text-sm text-gray-500">{totalServings} total servings</p>
              </div>
            </div>
            <Badge className="bg-primary-100 text-primary-700">
              <Check className="mr-1 h-3 w-3" />
              Catering Added
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
          const Icon = categoryIcons[category.name] || UtensilsCrossed;
          const isExpanded = expandedCategory === category.id || expandedCategory === null;
          const categorySelectedCount = category.items.filter(item => selectedCatering.has(item.id)).length;

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
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-accent-100">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.items.length} options available</p>
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

                {/* Items */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {category.items.map((item, itemIndex) => {
                        const quantity = selectedCatering.get(item.id) || 0;
                        const isSelected = quantity > 0;
                        const imageUrl = foodImages[item.name] || foodImages['default'];

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: itemIndex * 0.05 }}
                          >
                            <div
                              className={cn(
                                'group relative overflow-hidden rounded-xl border-2 transition-all duration-300',
                                isSelected
                                  ? 'border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-500/10'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                              )}
                            >
                              {/* Image */}
                              <div className="relative h-32 overflow-hidden">
                                <img
                                  src={imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                
                                {/* Price tag */}
                                <div className="absolute top-2 right-2 rounded-lg bg-white/90 px-2 py-1">
                                  <span className="text-sm font-bold text-primary-600">
                                    ${item.pricePerPerson}
                                  </span>
                                  <span className="text-xs text-gray-500">/person</span>
                                </div>

                                {/* Selected indicator */}
                                {isSelected && (
                                  <div className="absolute top-2 left-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
                                      <Check className="h-4 w-4" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-4">
                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                  {item.description}
                                </p>

                                {/* Dietary options */}
                                {item.dietaryOptions.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.dietaryOptions.map((option) => (
                                      <Badge 
                                        key={option} 
                                        variant="secondary" 
                                        className="text-xs"
                                      >
                                        {dietaryIcons[option] || '✓'} {option}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                <p className="mt-2 text-xs text-gray-400">
                                  Min. {item.minPersons} persons
                                </p>

                                {/* Quantity controls */}
                                <div className="mt-3 flex items-center gap-2">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, -10)}
                                    disabled={quantity === 0}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  
                                  <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 0)}
                                    className="h-8 w-20 text-center"
                                    min={0}
                                  />
                                  
                                  <button
                                    onClick={() => handleQuantityChange(item.id, 10)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>

                                  {quantity === 0 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setQuantity(item.id, data.numGuests)}
                                      className="ml-auto"
                                    >
                                      Add for all
                                    </Button>
                                  )}
                                </div>

                                {isSelected && (
                                  <p className="mt-2 text-sm font-medium text-primary-600">
                                    Subtotal: ${(item.pricePerPerson * quantity).toFixed(2)}
                                  </p>
                                )}
                              </div>
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
            Skip Catering
          </Button>
          <Button variant="gradient" onClick={handleNext} disabled={loading}>
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                Next: Services
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step3Catering;
