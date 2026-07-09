// src/components/CompareSpecs.tsx
import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';
import { calculateErgonomics, convertCmToIn, convertInToCm } from '../logic/calcEngine';
import type { UserMeasurements } from '../logic/calcEngine';

interface CompareSpecsProps {
  userMeasurements: UserMeasurements;
  isInch: boolean;
}

interface ChairSpecs {
  modelName: string;
  minSeatHeight: number;
  maxSeatHeight: number;
  seatDepth: number;
  seatWidth: number;
}

export const CompareSpecs: React.FC<CompareSpecsProps> = ({
  userMeasurements,
  isInch,
}) => {
  const ideal = calculateErgonomics(userMeasurements);

  const [specs, setSpecs] = useState<ChairSpecs>({
    modelName: '',
    minSeatHeight: isInch ? convertCmToIn(ideal.seatHeight - 4) : ideal.seatHeight - 10,
    maxSeatHeight: isInch ? convertCmToIn(ideal.seatHeight + 4) : ideal.seatHeight + 10,
    seatDepth: isInch ? convertCmToIn(ideal.seatDepth) : ideal.seatDepth,
    seatWidth: isInch ? convertCmToIn(ideal.seatWidth) : ideal.seatWidth,
  });

  const [compared, setCompared] = useState<boolean>(false);

  const handleInputChange = (field: keyof ChairSpecs, valStr: string) => {
    if (field === 'modelName') {
      setSpecs(prev => ({ ...prev, modelName: valStr }));
    } else {
      const parsed = parseFloat(valStr);
      setSpecs(prev => ({ ...prev, [field]: isNaN(parsed) ? 0 : parsed }));
    }
    setCompared(false);
  };

  // Convert chair inputs to cm for calculations
  const chairInCm = {
    minSeatHeight: isInch ? convertInToCm(specs.minSeatHeight) : specs.minSeatHeight,
    maxSeatHeight: isInch ? convertInToCm(specs.maxSeatHeight) : specs.maxSeatHeight,
    seatDepth: isInch ? convertInToCm(specs.seatDepth) : specs.seatDepth,
    seatWidth: isInch ? convertInToCm(specs.seatWidth) : specs.seatWidth,
  };

  const getResults = () => {
    const checks = [
      {
        name: 'Seat Height Adjustability',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'The chair can adjust to your ideal seat height.',
        ideal: ideal.seatHeight,
        model: `${specs.minSeatHeight} - ${specs.maxSeatHeight} ${isInch ? 'in' : 'cm'}`,
        test: () => {
          if (ideal.seatHeight < chairInCm.minSeatHeight) {
            return {
              status: 'fail' as const,
              message: `The chair's minimum seat height (${specs.minSeatHeight}${isInch ? 'in' : 'cm'}) is too high. Your feet might dangle, causing popliteal strain.`
            };
          }
          if (ideal.seatHeight > chairInCm.maxSeatHeight) {
            return {
              status: 'fail' as const,
              message: `The chair's maximum seat height (${specs.maxSeatHeight}${isInch ? 'in' : 'cm'}) is too low. Your knees will be bent at an acute angle, putting pressure on your lower back.`
            };
          }
          return null;
        }
      },
      {
        name: 'Seat Depth',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'The seat depth is correct, offering support without restricting blood flow.',
        ideal: ideal.seatDepth,
        model: `${specs.seatDepth} ${isInch ? 'in' : 'cm'}`,
        test: () => {
          const diff = chairInCm.seatDepth - ideal.seatDepth;
          if (diff > 4) {
            return {
              status: 'fail' as const,
              message: `Seat is too deep (difference of +${(isInch ? convertCmToIn(diff) : diff).toFixed(1)} ${isInch ? 'in' : 'cm'}). You won't be able to sit back and rest your spine without cutting off circulation behind your knees.`
            };
          }
          if (diff < -5) {
            return {
              status: 'warning' as const,
              message: `Seat is quite shallow (difference of ${(isInch ? convertCmToIn(diff) : diff).toFixed(1)} ${isInch ? 'in' : 'cm'}). It will not support your thighs properly, leading to increased pressure on your buttocks.`
            };
          }
          return null;
        }
      },
      {
        name: 'Seat Width',
        status: 'pass' as 'pass' | 'warning' | 'fail',
        message: 'The seat width provides adequate clearance for your hips.',
        ideal: ideal.seatWidth,
        model: `${specs.seatWidth} ${isInch ? 'in' : 'cm'}`,
        test: () => {
          if (chairInCm.seatWidth < ideal.seatWidth) {
            return {
              status: 'fail' as const,
              message: `The seat is too narrow. Your hips will press against the armrests or edges, causing restriction and discomfort.`
            };
          }
          return null;
        }
      }
    ];

    let overallPass = true;
    let overallWarning = false;

    const evaluatedChecks = checks.map(c => {
      const evaluation = c.test();
      if (evaluation) {
        if (evaluation.status === 'fail') overallPass = false;
        if (evaluation.status === 'warning') overallWarning = true;
        return { ...c, status: evaluation.status, message: evaluation.message };
      }
      return c;
    });

    const overallStatus: 'pass' | 'warning' | 'fail' = !overallPass ? 'fail' : overallWarning ? 'warning' : 'pass';

    return { evaluatedChecks, overallStatus };
  };

  const { evaluatedChecks, overallStatus } = getResults();

  return (
    <div className="w-full max-w-4xl space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Chair Model Compatibility Tester</h1>
        <p className="text-slate-400 text-sm mt-1">
          Input the dimensions of a commercially available chair model to check if it matches your ideal ergonomic settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Specs Input Panel */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-850 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Chair Specifications</h2>
          
          <div>
            <label htmlFor="chair-model" className="block text-xs font-medium text-slate-400 mb-1">Chair Model / Name</label>
            <input
              type="text"
              id="chair-model"
              value={specs.modelName}
              onChange={(e) => handleInputChange('modelName', e.target.value)}
              placeholder="e.g. Herman Miller Aeron (Size B)"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-sm focus:border-violet-500 focus:bg-slate-950 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="min-height" className="block text-xs font-medium text-slate-400 mb-1">Min Seat Height ({isInch ? 'in' : 'cm'})</label>
              <input
                type="number"
                id="min-height"
                step="any"
                value={specs.minSeatHeight || ''}
                onChange={(e) => handleInputChange('minSeatHeight', e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-sm focus:border-violet-500 focus:bg-slate-950 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="max-height" className="block text-xs font-medium text-slate-400 mb-1">Max Seat Height ({isInch ? 'in' : 'cm'})</label>
              <input
                type="number"
                id="max-height"
                step="any"
                value={specs.maxSeatHeight || ''}
                onChange={(e) => handleInputChange('maxSeatHeight', e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-sm focus:border-violet-500 focus:bg-slate-950 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="seat-depth" className="block text-xs font-medium text-slate-400 mb-1">Seat Depth ({isInch ? 'in' : 'cm'})</label>
              <input
                type="number"
                id="seat-depth"
                step="any"
                value={specs.seatDepth || ''}
                onChange={(e) => handleInputChange('seatDepth', e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-sm focus:border-violet-500 focus:bg-slate-950 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="seat-width" className="block text-xs font-medium text-slate-400 mb-1">Seat Width ({isInch ? 'in' : 'cm'})</label>
              <input
                type="number"
                id="seat-width"
                step="any"
                value={specs.seatWidth || ''}
                onChange={(e) => handleInputChange('seatWidth', e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-sm focus:border-violet-500 focus:bg-slate-950 transition-colors"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCompared(true)}
            className="w-full mt-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-violet-600/10 active:scale-[0.98]"
          >
            Run Compatibility Audit
          </button>
        </div>

        {/* Compatibility Auditing Results */}
        <div className="lg:col-span-3 space-y-4">
          {!compared ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[300px] bg-slate-950/10">
              <HelpCircle className="w-12 h-12 text-slate-650 animate-bounce mb-3" />
              <p className="text-slate-450 font-medium text-sm">Ready to compare</p>
              <p className="text-slate-500 text-xs mt-1 max-w-[280px]">
                Fill out the chair dimensions on the left and click "Run Compatibility Audit" to review fits.
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              {/* Main Indicator Panel */}
              <div 
                className={`p-4 rounded-xl flex items-start gap-3 border
                  ${overallStatus === 'pass' 
                    ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300' 
                    : overallStatus === 'warning'
                      ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                      : 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                  }`}
              >
                {overallStatus === 'pass' ? (
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400 mt-0.5" />
                ) : overallStatus === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 shrink-0 text-amber-400 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-sm">
                    {specs.modelName ? `Audit for: ${specs.modelName}` : 'Audit Result'}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {overallStatus === 'pass' && 'Outstanding! This chair matches all of your baseline ergonomic metrics and is safe to use.'}
                    {overallStatus === 'warning' && 'Caution: This chair is acceptable, but has marginal warnings that could lead to mild discomfort over long sessions.'}
                    {overallStatus === 'fail' && 'Warning: This chair is incompatible with your body profile. Long-term use may cause physical strain or injury.'}
                  </p>
                </div>
              </div>

              {/* Individual Audits */}
              <div className="divide-y divide-slate-850">
                {evaluatedChecks.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 md:max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full 
                          ${item.status === 'pass' 
                            ? 'bg-emerald-400' 
                            : item.status === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          }`} 
                        />
                        <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">{item.message}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs text-right shrink-0">
                      <div>
                        <span className="block text-slate-500 font-medium">Your Ideal</span>
                        <strong className="text-violet-400 font-bold">{isInch ? `${convertCmToIn(item.ideal)} in` : `${item.ideal} cm`}</strong>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-medium">Model Value</span>
                        <strong className="text-slate-350">{item.model}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
