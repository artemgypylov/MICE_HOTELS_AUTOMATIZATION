import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Stepper, Step, StepLabel, Box, Button } from '@mui/material';
import Step1BasicParameters from '../components/wizard/steps/Step1_BasicParameters';
import Step2HallSelection from '../components/wizard/steps/Step2_HallSelection';
import Step3Catering from '../components/wizard/steps/Step3_Catering';
import Step4AdditionalServices from '../components/wizard/steps/Step4_AdditionalServices';
import Step5FinalEstimate from '../components/wizard/steps/Step5_FinalEstimate';
import { WizardData } from '../types';

const steps = [
  'Basic Parameters',
  'Hall Selection',
  'Catering',
  'Additional Services',
  'Final Estimate',
];

const WizardPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [wizardData, setWizardData] = useState<WizardData>({
    hotelId: hotelId || '',
    eventName: '',
    eventFormat: '',
    startDate: '',
    endDate: '',
    numGuests: 0,
    notes: '',
    selectedHalls: [],
    selectedCatering: [],
    selectedServices: [],
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Step1BasicParameters
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            setBookingId={setBookingId}
          />
        );
      case 1:
        return (
          <Step2HallSelection
            data={wizardData}
            bookingId={bookingId}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3Catering
            data={wizardData}
            bookingId={bookingId}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4AdditionalServices
            data={wizardData}
            bookingId={bookingId}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step5FinalEstimate
            data={wizardData}
            bookingId={bookingId}
            onBack={handleBack}
            onComplete={() => navigate('/dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>{renderStepContent(activeStep)}</Box>
      </Paper>
    </Container>
  );
};

export default WizardPage;
