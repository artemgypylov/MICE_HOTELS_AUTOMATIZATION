import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  MenuItem,
  Alert,
} from '@mui/material';
import { WizardData } from '../../../types';
import api from '../../../services/api';

interface Step1Props {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  setBookingId: (id: string) => void;
}

const eventFormats = [
  { value: 'conference', label: 'Conference' },
  { value: 'training', label: 'Training' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'corporate_party', label: 'Corporate Party' },
  { value: 'product_launch', label: 'Product Launch' },
];

const Step1BasicParameters: React.FC<Step1Props> = ({ data, onUpdate, onNext, setBookingId }) => {
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
      onNext();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Step 1: Basic Event Parameters
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Tell us about your event
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Event Name"
            value={data.eventName}
            onChange={(e) => onUpdate({ eventName: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            select
            label="Event Format"
            value={data.eventFormat}
            onChange={(e) => onUpdate({ eventFormat: e.target.value })}
          >
            {eventFormats.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Number of Guests"
            value={data.numGuests || ''}
            onChange={(e) => onUpdate({ numGuests: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            type="date"
            label="Start Date"
            value={data.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            type="date"
            label="End Date"
            value={data.endDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: data.startDate || new Date().toISOString().split('T')[0] }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Notes"
            value={data.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Next: Select Hall'}
        </Button>
      </Box>
    </Box>
  );
};

export default Step1BasicParameters;
