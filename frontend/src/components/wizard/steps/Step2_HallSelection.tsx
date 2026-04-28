import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Maximize2, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Wifi,
  Monitor,
  Mic,
  Projector,
  Wind
} from 'lucide-react';
import { WizardData, Hall } from '../../../types';
import { Button, Card, CardContent, Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { cn } from '@/lib/utils';
import api from '../../../services/api';
import { appwriteData } from '../../../services/appwriteData';

interface Step2Props {
  data: WizardData;
  bookingId: string | null;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Hall images from Unsplash
const hallImages = [
  'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80', // Conference room
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', // Ballroom
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80', // Training room
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', // Modern meeting
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', // Board room
  'https://images.unsplash.com/photo-1416339698674-4f118dd3388b?w=800&q=80', // Event space
];

// Amenity icons - exported for potential future use
export const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'WiFi': Wifi,
  'Projector': Projector,
  'Screen': Monitor,
  'Sound System': Mic,
  'Air Conditioning': Wind,
};

const layoutImages: Record<string, string> = {
  'THEATER': '🎭',
  'CLASSROOM': '📚',
  'U_SHAPE': '🔲',
  'BOARDROOM': '📋',
  'BANQUET': '🍽️',
  'COCKTAIL': '🍸',
};

const Step2HallSelection: React.FC<Step2Props> = ({ data, bookingId, onUpdate, onNext, onBack }) => {
  const [selectedHalls, setSelectedHalls] = useState<Map<string, { hallId: string; layoutId?: string }>>(new Map());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedHallForPreview, setSelectedHallForPreview] = useState<Hall | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: halls } = useQuery<Hall[]>({
    queryKey: ['halls', data.hotelId],
    queryFn: async () => {
      try {
        return await appwriteData.listHalls(data.hotelId);
      } catch {
      return await appwriteData.listHalls(data.hotelId);
      }
    },
  });

  const getEventDates = () => {
    const dates: string[] = [];
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleSelectHall = (date: string, hallId: string, layoutId?: string) => {
    const newSelection = new Map(selectedHalls);
    newSelection.set(date, { hallId, layoutId });
    setSelectedHalls(newSelection);
  };

  const handleNext = async () => {
    if (selectedHalls.size === 0) {
      setError('Please select at least one hall');
      return;
    }

    const hallsData = Array.from(selectedHalls.entries()).map(([date, selection]) => ({
      hallId: selection.hallId,
      seatingLayoutId: selection.layoutId,
      bookingDate: date,
    }));

    setLoading(true);
    try {
      await appwriteData.updateBooking(bookingId, {
        halls: hallsData, /* We might just save to frontend WizardData for now, but update is cool */
      });

      onUpdate({ selectedHalls: hallsData });
      onNext();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const filteredHalls = halls?.filter((hall) => hall.maxCapacity >= data.numGuests);
  const eventDates = getEventDates();

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Select Your Venue
        </h2>
        <p className="mt-2 text-gray-500">
          Choose a conference hall for each day of your event
        </p>
      </div>

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

      {/* Event dates */}
      {eventDates.map((date, dateIndex) => (
        <motion.div 
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dateIndex * 0.1 }}
          className="mb-8"
        >
          {/* Date header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white font-bold">
              {new Date(date).getDate()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-gray-500">Day {dateIndex + 1} of {eventDates.length}</p>
            </div>
            {selectedHalls.get(date) && (
              <Badge className="ml-auto bg-green-100 text-green-700">
                <Check className="mr-1 h-3 w-3" />
                Hall Selected
              </Badge>
            )}
          </div>

          {/* Halls grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHalls?.map((hall, hallIndex) => {
              const isSelected = selectedHalls.get(date)?.hallId === hall.id;
              const imageUrl = hallImages[hallIndex % hallImages.length];

              return (
                <motion.div
                  key={hall.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: dateIndex * 0.1 + hallIndex * 0.05 }}
                >
                  <Card 
                    className={cn(
                      'group overflow-hidden cursor-pointer transition-all duration-300',
                      isSelected 
                        ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/20' 
                        : 'hover:shadow-xl hover:-translate-y-1'
                    )}
                    onClick={() => handleSelectHall(date, hall.id)}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={hall.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Quick info overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{hall.maxCapacity}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Maximize2 className="h-4 w-4" />
                            <span className="text-sm">{hall.areaSqm}m²</span>
                          </div>
                        </div>
                      </div>

                      {/* Selected badge */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg">
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                      )}

                      {/* Preview button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHallForPreview(hall);
                        }}
                        className="absolute top-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        View Details
                      </button>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{hall.name}</h4>
                        <span className="text-lg font-bold text-primary-600">
                          ${hall.basePricePerDay}
                          <span className="text-xs font-normal text-gray-500">/day</span>
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {hall.description}
                      </p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {hall.amenities.slice(0, 4).map((amenity) => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {hall.amenities.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{hall.amenities.length - 4}
                          </Badge>
                        )}
                      </div>

                      {/* Layout selector for selected hall */}
                      {isSelected && hall.seatingLayouts && hall.seatingLayouts.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2">Seating Layout</p>
                          <div className="flex flex-wrap gap-2">
                            {hall.seatingLayouts.map((layout) => {
                              const isLayoutSelected = selectedHalls.get(date)?.layoutId === layout.id;
                              return (
                                <button
                                  key={layout.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectHall(date, hall.id, layout.id);
                                  }}
                                  className={cn(
                                    'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                                    isLayoutSelected
                                      ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-500'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  )}
                                >
                                  <span>{layoutImages[layout.layoutType] || '📋'}</span>
                                  <span>{layout.layoutType.replace('_', ' ')}</span>
                                  <span className="text-gray-400">({layout.capacity})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Hall Preview Dialog */}
      <Dialog open={!!selectedHallForPreview} onOpenChange={() => setSelectedHallForPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedHallForPreview?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedHallForPreview && (
            <div className="space-y-6">
              {/* Image gallery */}
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={hallImages[activeImageIndex % hallImages.length]}
                  alt={selectedHallForPreview.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={cn(
                          'h-2 w-2 rounded-full transition-all',
                          activeImageIndex === i ? 'bg-white w-4' : 'bg-white/50'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Capacity & Size</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      Up to {selectedHallForPreview.maxCapacity} guests
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4 text-gray-400" />
                      {selectedHallForPreview.areaSqm} m² area
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Price</h4>
                  <p className="text-2xl font-bold text-primary-600">
                    ${selectedHallForPreview.basePricePerDay}
                    <span className="text-sm font-normal text-gray-500">/day</span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHallForPreview.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <p className="text-gray-600">{selectedHallForPreview.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-sm text-gray-500">
          {selectedHalls.size} of {eventDates.length} days selected
        </div>
        <Button variant="gradient" onClick={handleNext} disabled={loading}>
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              Next: Catering
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step2HallSelection;
