import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
  steps: { title: string; icon: React.ReactNode }[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8 relative">
      {/* Progress line */}
      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-300 z-0" />

      {/* Filled line */}
      <div
        className="absolute top-6 left-0 h-1 bg-primary z-0 transition-all"
        style={{
          width: `${(currentStep - 1) / (steps.length - 1) * 100}%`
        }}
      />

      {/* Steps */}
      <div className="relative flex justify-between items-center z-10">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
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
            <span
              className={`mt-2 text-sm font-medium ${
                index + 1 <= currentStep ? 'text-primary' : 'text-gray-500'
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
