import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Building2, 
  Coffee, 
  Sparkles, 
  FileText,
  Check,
  ChevronLeft
} from 'lucide-react';
import Step1BasicParameters from '../components/wizard/steps/Step1_BasicParameters';
import Step2HallSelection from '../components/wizard/steps/Step2_HallSelection';
import Step3Catering from '../components/wizard/steps/Step3_Catering';
import Step4AdditionalServices from '../components/wizard/steps/Step4_AdditionalServices';
import Step5FinalEstimate from '../components/wizard/steps/Step5_FinalEstimate';
import { Progress } from '@/components/ui';
import { cn } from '@/lib/utils';
import { WizardData } from '../types';

const steps = [
  { id: 1, title: 'Event Details', icon: CalendarDays, description: 'Basic info' },
  { id: 2, title: 'Select Hall', icon: Building2, description: 'Choose venue' },
  { id: 3, title: 'Catering', icon: Coffee, description: 'Food & drinks' },
  { id: 4, title: 'Services', icon: Sparkles, description: 'Add extras' },
  { id: 5, title: 'Summary', icon: FileText, description: 'Review & book' },
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

  const progressValue = ((activeStep + 1) / steps.length) * 100;

  const renderStepContent = (step: number) => {
    const commonProps = {
      data: wizardData,
      bookingId,
      onUpdate: updateWizardData,
    };

    switch (step) {
      case 0:
        return (
          <Step1BasicParameters
            {...commonProps}
            onNext={handleNext}
            setBookingId={setBookingId}
          />
        );
      case 1:
        return (
          <Step2HallSelection
            {...commonProps}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3Catering
            {...commonProps}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4AdditionalServices
            {...commonProps}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step5FinalEstimate
            {...commonProps}
            onBack={handleBack}
            onComplete={() => navigate('/dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 pb-12">
      {/* Header with progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Progress bar */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {activeStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progressValue)}% complete
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Steps navigation */}
          <div className="hidden md:flex items-center justify-between py-4 -mx-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex-1 flex items-center px-2',
                    index < steps.length - 1 && 'relative'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                        isCompleted && 'border-primary-600 bg-primary-600 text-white',
                        isActive && 'border-primary-600 bg-primary-50 text-primary-600',
                        !isCompleted && !isActive && 'border-gray-200 bg-white text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="hidden lg:block">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div
                        className={cn(
                          'h-0.5 rounded transition-all duration-300',
                          isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile step indicator */}
          <div className="flex md:hidden items-center justify-between py-4">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className="flex items-center gap-1 text-sm text-gray-500 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = steps[activeStep].icon;
                return (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                      <Icon className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="font-medium text-gray-900">{steps[activeStep].title}</span>
                  </>
                );
              })()}
            </div>
            <div className="w-12" />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WizardPage;
