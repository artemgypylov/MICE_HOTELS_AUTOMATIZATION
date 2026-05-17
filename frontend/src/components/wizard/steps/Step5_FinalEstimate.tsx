import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Send,
  Calendar,
  Users,
  Building2,
  UtensilsCrossed,
  Package,
  FileText,
  Download,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { WizardData, PriceCalculation, Booking } from '../../../types';
import { Button, Card, CardContent, CardHeader, Badge } from '@/components/ui';
import api from '../../../services/api';

interface Step5Props {
  data: WizardData;
  bookingId: string | null;
  onBack: () => void;
  onComplete: () => void;
}

const Step5FinalEstimate: React.FC<Step5Props> = ({ data, bookingId, onBack, onComplete }) => {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: calculation, isLoading: calcLoading } = useQuery<PriceCalculation>({
    queryKey: ['calculation', bookingId],
    queryFn: async () => {
      const response = await api.post(`/bookings/${bookingId}/calculate`);
      return response.data;
    },
    enabled: !!bookingId,
  });

  // Booking data is fetched but not displayed directly - used for future expansion
  useQuery<Booking>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    },
    enabled: !!bookingId,
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/bookings/${bookingId}/submit`);
      onComplete();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (calcLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mx-auto" />
          <p className="mt-4 text-gray-500">Calculating your estimate...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100">
          <Sparkles className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Review Your Booking
        </h2>
        <p className="mt-2 text-gray-500">
          Everything looks great! Review the details and submit your request.
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Event Name</p>
                      <p className="font-medium text-gray-900">{data.eventName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Format</p>
                      <p className="font-medium text-gray-900">{data.eventFormat}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Dates</p>
                      <p className="font-medium text-gray-900">
                        {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Guests</p>
                      <p className="font-medium text-gray-900">{data.numGuests} people</p>
                    </div>
                  </div>
                </div>
                {data.notes && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
                    <p className="text-sm text-gray-700">{data.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Hall Bookings */}
          {calculation?.breakdown.halls && calculation.breakdown.halls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Conference Halls</h3>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      ${calculation.hallsTotal.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-3 text-left font-medium text-gray-500">Hall</th>
                          <th className="pb-3 text-left font-medium text-gray-500">Date</th>
                          <th className="pb-3 text-left font-medium text-gray-500">Layout</th>
                          <th className="pb-3 text-right font-medium text-gray-500">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {calculation.breakdown.halls.map((hall, index) => (
                          <tr key={index}>
                            <td className="py-3 font-medium text-gray-900">{hall.name}</td>
                            <td className="py-3 text-gray-600">{new Date(hall.date).toLocaleDateString()}</td>
                            <td className="py-3">
                              <Badge variant="outline">{hall.layout || 'Standard'}</Badge>
                            </td>
                            <td className="py-3 text-right font-medium text-gray-900">
                              ${hall.price.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Catering */}
          {calculation?.breakdown.catering && calculation.breakdown.catering.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Catering</h3>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700">
                      ${calculation.cateringTotal.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-3 text-left font-medium text-gray-500">Item</th>
                          <th className="pb-3 text-left font-medium text-gray-500">Quantity</th>
                          <th className="pb-3 text-right font-medium text-gray-500">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {calculation.breakdown.catering.map((item, index) => (
                          <tr key={index}>
                            <td className="py-3 font-medium text-gray-900">{item.name}</td>
                            <td className="py-3 text-gray-600">{item.quantity}</td>
                            <td className="py-3 text-right font-medium text-gray-900">
                              ${item.price.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Services */}
          {calculation?.breakdown.services && calculation.breakdown.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Additional Services</h3>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">
                      ${calculation.servicesTotal.toLocaleString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="pb-3 text-left font-medium text-gray-500">Service</th>
                          <th className="pb-3 text-left font-medium text-gray-500">Quantity</th>
                          <th className="pb-3 text-right font-medium text-gray-500">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {calculation.breakdown.services.map((service, index) => (
                          <tr key={index}>
                            <td className="py-3 font-medium text-gray-900">{service.name}</td>
                            <td className="py-3 text-gray-600">{service.quantity}</td>
                            <td className="py-3 text-right font-medium text-gray-900">
                              ${service.price.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Price Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-6"
          >
            <Card className="border-0 shadow-xl overflow-hidden">
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Price Summary</h3>
                <p className="text-sm text-white/80">Your complete event estimate</p>
              </div>

              <CardContent className="p-6">
                {/* Price breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Halls
                    </span>
                    <span className="font-medium">${calculation?.hallsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4" />
                      Catering
                    </span>
                    <span className="font-medium">${calculation?.cateringTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Services
                    </span>
                    <span className="font-medium">${calculation?.servicesTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold gradient-text">
                      ${calculation?.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Request
                    </>
                  )}
                </Button>

                {/* PDF download */}
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  disabled
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                  <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                </Button>

                {/* Trust indicators */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Free cancellation within 24h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Secure booking process</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>24/7 customer support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
      </div>
    </div>
  );
};

export default Step5FinalEstimate;
