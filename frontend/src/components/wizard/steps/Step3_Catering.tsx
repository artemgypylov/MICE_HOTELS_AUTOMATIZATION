import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useQuery } from '@tanstack/react-query';
import { WizardData, CateringCategory } from '../../../types';
import api from '../../../services/api';

interface Step3Props {
  data: WizardData;
  bookingId: string | null;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step3Catering: React.FC<Step3Props> = ({ data, bookingId, onUpdate, onNext, onBack }) => {
  const [selectedCatering, setSelectedCatering] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery<CateringCategory[]>({
    queryKey: ['catering', data.hotelId],
    queryFn: async () => {
      const response = await api.get(`/hotels/${data.hotelId}/catering`);
      return response.data;
    },
  });

  const handleQuantityChange = (itemId: string, quantity: number) => {
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onUpdate({ selectedCatering: [] });
    onNext();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 3: Catering Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose food and beverage options for your event (optional)
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {categories?.map((category) => (
        <Accordion key={category.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{category.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {category.items.map((item) => {
                const quantity = selectedCatering.get(item.id) || 0;
                const isSelected = quantity > 0;

                return (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Card variant={isSelected ? 'elevation' : 'outlined'}>
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {item.dietaryOptions.map((option) => (
                            <Chip key={option} label={option} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                          ${item.pricePerPerson}/person
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Min. {item.minPersons} persons
                        </Typography>

                        <TextField
                          type="number"
                          label="Quantity (persons)"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          inputProps={{ min: 0, max: data.numGuests * 3 }}
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
            {loading ? 'Saving...' : 'Next: Additional Services'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Step3Catering;
