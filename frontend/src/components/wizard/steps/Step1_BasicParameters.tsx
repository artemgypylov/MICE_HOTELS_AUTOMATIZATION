import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Presentation, 
  GraduationCap, 
  Users, 
  PartyPopper, 
  Rocket, 
  Mic,
  Calendar,
  UserRound,
  FileText,
  ChevronRight
} from 'lucide-react';
import { WizardData } from '../../../types';
import { Button, Input, Label, Textarea, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import api from '../../../services/api';

interface Step1Props {
  data: WizardData;
  bookingId?: string | null;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  setBookingId: (id: string) => void;
}

const eventFormats = [
  { value: 'conference', label: 'Conference', icon: Presentation, description: 'Multi-day professional gathering' },
  { value: 'training', label: 'Training', icon: GraduationCap, description: 'Educational workshop sessions' },
  { value: 'seminar', label: 'Seminar', icon: Users, description: 'Expert-led presentations' },
  { value: 'workshop', label: 'Workshop', icon: Mic, description: 'Hands-on learning sessions' },
  { value: 'corporate_party', label: 'Corporate Party', icon: PartyPopper, description: 'Celebration & networking' },
  { value: 'product_launch', label: 'Product Launch', icon: Rocket, description: 'New product unveiling' },
];

const Step1BasicParameters: React.FC<Step1Props> = ({ data, bookingId, onUpdate, onNext, setBookingId }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!data.eventName || !data.startDate || !data.endDate || !data.numGuests) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(data.endDate) < new Date(data.startDate)) {
      setError('End date must be after start date');
      return;
    }

    if (data.numGuests < 1) {
      setError('Number of guests must be at least 1');
      return;
    }

    setLoading(true);
    try {
      if (bookingId) {
        await api.put(`/bookings/${bookingId}`, {
          eventName: data.eventName,
          eventFormat: data.eventFormat,
          startDate: data.startDate,
          endDate: data.endDate,
          numGuests: data.numGuests,
          notes: data.notes,
        });
      } else {
        const response = await api.post('/bookings', {
          hotelId: data.hotelId,
          eventName: data.eventName,
          eventFormat: data.eventFormat,
          startDate: data.startDate,
          endDate: data.endDate,
          numGuests: data.numGuests,
          notes: data.notes,
        });
        setBookingId(response.data.id);
      }
      
      onNext();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create or update booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Tell Us About Your Event
        </h2>
        <p className="mt-2 text-gray-500">
          Let&apos;s start with the basics to find the perfect venue
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

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-8">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="eventName" className="text-base">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="e.g., Annual Sales Conference 2026"
                value={data.eventName}
                onChange={(e) => onUpdate({ eventName: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            {/* Event Format Selection */}
            <div className="space-y-3">
              <Label className="text-base">Event Format *</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {eventFormats.map((format, index) => {
                  const Icon = format.icon;
                  const isSelected = data.eventFormat === format.value;
                  
                  return (
                    <motion.div
                      key={format.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        type="button"
                        onClick={() => onUpdate({ eventFormat: format.value })}
                        className={cn(
                          'w-full rounded-xl border-2 p-4 text-left transition-all duration-200',
                          isSelected
                            ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/20'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg',
                              isSelected
                                ? 'bg-primary-100 text-primary-600'
                                : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={cn(
                              'font-medium',
                              isSelected ? 'text-primary-700' : 'text-gray-900'
                            )}>
                              {format.label}
                            </p>
                            <p className="text-xs text-gray-500">{format.description}</p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Date and Guests */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={data.startDate}
                  onChange={(e) => onUpdate({ startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={data.endDate}
                  onChange={(e) => onUpdate({ endDate: e.target.value })}
                  min={data.startDate || new Date().toISOString().split('T')[0]}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numGuests" className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-gray-400" />
                  Number of Guests *
                </Label>
                <Input
                  id="numGuests"
                  type="number"
                  placeholder="50"
                  value={data.numGuests || ''}
                  onChange={(e) => onUpdate({ numGuests: parseInt(e.target.value) || 0 })}
                  min={1}
                  className="h-12"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements, accessibility needs, or other details..."
                value={data.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-end pt-8">
        <Button 
          variant="gradient" 
          size="lg"
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating Event...
            </>
          ) : (
            <>
              Continue to Hall Selection
              <ChevronRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Step1BasicParameters;
