
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
  steps: { title: string; icon: React.ReactNode }[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step Circle with Icon */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                  index + 1 <= currentStep
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}
              >
                {index + 1 < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  step.icon
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                index + 1 <= currentStep ? 'text-primary' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div 
                className={`absolute h-[2px] top-6 -z-0 transition-colors ${
                  index + 2 <= currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
                style={{
                  left: `${(index * 100) / (steps.length - 1) + 6}%`,
                  width: `${88 / (steps.length - 1)}%`
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
