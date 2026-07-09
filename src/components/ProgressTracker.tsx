// src/components/ProgressTracker.tsx
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressTrackerProps {
  currentStep: number;
  stepsCount: number;
  stepLabels: string[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStep,
  stepsCount,
  stepLabels,
}) => {
  const percentage = (currentStep / (stepsCount - 1)) * 100;

  return (
    <div className="w-full">
      {/* Mobile progress tracker */}
      <div className="md:hidden flex flex-col items-center gap-2 mb-6">
        <div className="flex justify-between w-full text-xs font-semibold text-slate-400">
          <span>STEP {currentStep + 1} OF {stepsCount}</span>
          <span>{Math.round(percentage)}% COMPLETE</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <h3 className="text-sm font-medium text-slate-200 mt-1">
          {stepLabels[currentStep]}
        </h3>
      </div>

      {/* Desktop progress tracker */}
      <div className="hidden md:block relative mb-8">
        {/* Progress track background line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full" />
        
        {/* Progress track active line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {Array.from({ length: stepsCount }).map((_, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            
            return (
              <div key={idx} className="flex flex-col items-center group">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 
                    ${isCompleted 
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                      : isActive 
                        ? 'bg-slate-900 border-violet-400 text-violet-400 shadow-md shadow-violet-500/30 scale-110' 
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{idx}</span>
                  )}
                </div>
                
                <span 
                  className={`absolute mt-11 text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors duration-300
                    ${isActive 
                      ? 'text-violet-400 font-semibold' 
                      : isCompleted 
                        ? 'text-slate-300' 
                        : 'text-slate-500'
                    }`}
                >
                  {stepLabels[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
