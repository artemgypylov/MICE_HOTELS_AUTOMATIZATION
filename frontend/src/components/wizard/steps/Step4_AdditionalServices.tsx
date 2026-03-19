import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@tanstack/react-query';
import { WizardData, ServiceCategory } from '../../../types';
import api from '../../../services/api';

interface Step4Props {
  data: WizardData;
  bookingId: string | null;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step4AdditionalServices: React.FC<Step4Props> = ({ data, bookingId, onUpdate, onNext, onBack }) => {
  const [selectedServices, setSelectedServices] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery<ServiceCategory[]>({
    queryKey: ['services', data.hotelId],
    queryFn: async () => {
      const response = await api.get(`/hotels/${data.hotelId}/services`);
      return response.data;
    },
  });

  const handleQuantityChange = (serviceId: string, quantity: number) => {
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onUpdate({ selectedServices: [] });
    onNext();
  };

  const getPricingLabel = (pricingType: string, basePrice: number, unit?: string) => {
    switch (pricingType) {
      case 'FIXED':
        return `$${basePrice}${unit ? `/${unit}` : ''}`;
      case 'PER_PERSON':
        return `$${basePrice}/person`;
      case 'PER_DAY':
        return `$${basePrice}/day`;
      case 'PER_HOUR':
        return `$${basePrice}/hour`;
      default:
        return `$${basePrice}`;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 4: Additional Services
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Add extra services to enhance your event (optional)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {categories?.map((category) => (
        <Accordion key={category.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{category.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {category.services.map((service) => {
                const quantity = selectedServices.get(service.id) || 0;
                const isSelected = quantity > 0;

                return (
                  <Grid item xs={12} md={6} key={service.id}>
                    <Card variant={isSelected ? 'elevation' : 'outlined'}>
                      <CardContent>
                        <Typography variant="h6">{service.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.description}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                          {getPricingLabel(service.pricingType, service.basePrice, service.unit)}
                        </Typography>

                        <TextField
                          type="number"
                          label="Quantity"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(service.id, parseInt(e.target.value) || 0)}
                          inputProps={{ min: 0, max: 100 }}
                          fullWidth
                          sx={{ mt: 2 }}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>Back</Button>
        <Box>
          <Button onClick={handleSkip} sx={{ mr: 1 }}>
            Skip
          </Button>
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            {loading ? 'Saving...' : 'Next: Review & Submit'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Step4AdditionalServices;
