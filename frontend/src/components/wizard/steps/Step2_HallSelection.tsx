import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { WizardData, Hall, SeatingLayout } from '../../../types';
import api from '../../../services/api';

interface Step2Props {
  data: WizardData;
  bookingId: string | null;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2HallSelection: React.FC<Step2Props> = ({ data, bookingId, onUpdate, onNext, onBack }) => {
  const [selectedHalls, setSelectedHalls] = useState<Map<string, { hallId: string; layoutId?: string }>>(new Map());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: halls } = useQuery<Hall[]>({
    queryKey: ['halls', data.hotelId],
    queryFn: async () => {
      const response = await api.get(`/hotels/${data.hotelId}/halls`);
      return response.data;
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
      await api.put(`/bookings/${bookingId}`, {
        halls: hallsData,
      });

      onUpdate({ selectedHalls: hallsData });
      onNext();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const filteredHalls = halls?.filter((hall) => hall.maxCapacity >= data.numGuests);
  const eventDates = getEventDates();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 2: Hall Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select a hall for each day of your event
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {eventDates.map((date) => (
        <Box key={date} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>

          <Grid container spacing={2}>
            {filteredHalls?.map((hall) => {
              const isSelected = selectedHalls.get(date)?.hallId === hall.id;

              return (
                <Grid item xs={12} md={6} key={hall.id}>
                  <Card variant={isSelected ? 'elevation' : 'outlined'} sx={{ borderColor: isSelected ? 'primary.main' : undefined }}>
                    <CardContent>
                      <Typography variant="h6">{hall.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Capacity: {hall.maxCapacity} | Area: {hall.areaSqm} m²
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {hall.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {hall.amenities.slice(0, 3).map((amenity) => (
                          <Chip key={amenity} label={amenity} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </Box>
                      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                        ${hall.basePricePerDay}/day
                      </Typography>

                      {isSelected && hall.seatingLayouts && hall.seatingLayouts.length > 0 && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>Seating Layout</InputLabel>
                          <Select
                            value={selectedHalls.get(date)?.layoutId || ''}
                            onChange={(e) => handleSelectHall(date, hall.id, e.target.value)}
                            label="Seating Layout"
                          >
                            {hall.seatingLayouts.map((layout) => (
                              <MenuItem key={layout.id} value={layout.id}>
                                {layout.layoutType} (Cap: {layout.capacity})
                                {layout.priceModifier > 0 && ` +$${layout.priceModifier}`}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => handleSelectHall(date, hall.id)}
                      >
                        {isSelected ? 'Selected' : 'Select Hall'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={handleNext} disabled={loading}>
          {loading ? 'Saving...' : 'Next: Select Catering'}
        </Button>
      </Box>
    </Box>
  );
};

export default Step2HallSelection;
