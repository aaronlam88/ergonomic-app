// src/components/MeasurementForm.tsx
import React, { useState } from 'react';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { validateMeasurement, convertCmToIn, convertInToCm } from '../logic/calcEngine';
import type { UserMeasurements } from '../logic/calcEngine';
import { ProgressTracker } from './ProgressTracker';

// Validation schemas using Zod
const baseSchema = z.object({
  overallHeight: z.number().min(90, 'Height must be at least 90cm (35").').max(230, 'Height must be under 230cm (90").'),
  gender: z.enum(['male', 'female', 'other']),
  poplitealHeight: z.number().min(20, 'Popliteal height must be at least 20cm (8").').max(80, 'Popliteal height must be under 80cm (31").'),
  buttockToKnee: z.number().min(20, 'Buttock-to-knee length must be at least 20cm (8").').max(90, 'Buttock-to-knee length must be under 90cm (35").'),
  seatedElbowHeight: z.number().min(10, 'Seated elbow height must be at least 10cm (4").').max(50, 'Seated elbow height must be under 50cm (20").'),
  hipWidth: z.number().min(15, 'Hip width must be at least 15cm (6").').max(70, 'Hip width must be under 70cm (27").'),
  seatedShoulderHeight: z.number().min(20, 'Seated shoulder height must be at least 20cm (8").').max(90, 'Seated shoulder height must be under 90cm (35").'),
});

const STEP_LABELS = [
  'Calibration',
  'Popliteal Height',
  'Seat Depth',
  'Elbow Height',
  'Hip Width',
  'Shoulder Height'
];

interface MeasurementFormProps {
  onComplete: (measurements: UserMeasurements, isInch: boolean) => void;
  initialData?: UserMeasurements | null;
  initialUnitIsInch?: boolean;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  onComplete,
  initialData,
  initialUnitIsInch = false
}) => {
  const [isInch, setIsInch] = useState(initialUnitIsInch);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Local state for all fields
  const [formData, setFormData] = useState<UserMeasurements>(() => {
    if (initialData) return initialData;
    return {
      overallHeight: 170, // Default 170cm (~67in)
      gender: 'other',
      poplitealHeight: 44, // Default 44cm
      buttockToKnee: 54,  // Default 54cm
      seatedElbowHeight: 24, // Default 24cm
      hipWidth: 38,       // Default 38cm
      seatedShoulderHeight: 58, // Default 58cm
    };
  });

  // Local state for current step text inputs (to support typing decimals before conversion)
  const getInitialInputValue = (field: keyof UserMeasurements) => {
    const val = initialData ? initialData[field] : formData[field];
    if (typeof val === 'number') {
      return isInch ? convertCmToIn(val).toString() : val.toString();
    }
    return val.toString();
  };

  const [inputValue, setInputValue] = useState<string>(() => getInitialInputValue('overallHeight'));
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Synchronize inputs when changing steps or unit
  const syncInputValue = (stepIndex: number, unitIsInch: boolean) => {
    const field = getFieldForStep(stepIndex);
    const valueInCm = formData[field as keyof UserMeasurements];
    if (field === 'gender') {
      setInputValue(formData.gender);
    } else {
      const numericVal = valueInCm as number;
      const formattedVal = unitIsInch ? convertCmToIn(numericVal) : numericVal;
      setInputValue(formattedVal.toString());
    }
    setError(null);
  };

  // Switch unit
  const handleUnitToggle = (toInch: boolean) => {
    if (toInch === isInch) return;
    setIsInch(toInch);
    
    // Convert current typed value to keep sync
    const field = getFieldForStep(currentStep);
    if (field !== 'gender') {
      const currentVal = parseFloat(inputValue);
      if (!isNaN(currentVal)) {
        const converted = toInch ? convertCmToIn(currentVal * 2.54) : convertInToCm(currentVal);
        setInputValue(converted.toString());
      }
    }
  };

  const getFieldForStep = (step: number): keyof UserMeasurements => {
    switch (step) {
      case 0: return 'overallHeight';
      case 1: return 'poplitealHeight';
      case 2: return 'buttockToKnee';
      case 3: return 'seatedElbowHeight';
      case 4: return 'hipWidth';
      case 5: return 'seatedShoulderHeight';
      default: return 'overallHeight';
    }
  };

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 0: return 'Profile Calibration';
      case 1: return 'Popliteal Height';
      case 2: return 'Buttock-to-Knee Length';
      case 3: return 'Seated Elbow Height';
      case 4: return 'Hip Width';
      case 5: return 'Seated Shoulder Height';
      default: return '';
    }
  };

  const getStepDescription = (step: number): string => {
    switch (step) {
      case 0: return 'We use your overall height to calibrate dynamic sanity checks on all subsequent measurements.';
      case 1: return 'Measure from the floor up to the crease behind your knee. Wear your typical working shoes.';
      case 2: return 'Measure horizontally from the back of your buttocks to the front of your kneecap while sitting upright.';
      case 3: return 'With your elbow bent at 90°, measure vertically from the seat cushion up to the bottom crease of your elbow.';
      case 4: return 'Measure the widest distance across your hips when sitting comfortably.';
      case 5: return 'Measure vertically from the seat cushion up to the top outer edge of your shoulder.';
      default: return '';
    }
  };

  // Return SVG guides
  const renderSVGGuide = (step: number) => {
    const isFieldActive = (field: string) => {
      const activeField = getFieldForStep(step);
      return activeField === field;
    };

    if (step === 4) {
      // Front View for Hip Width
      return (
        <svg viewBox="0 0 300 300" className="w-full h-full max-h-[260px] md:max-h-[300px]">
          {/* Background Grid/Circles */}
          <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          <circle cx="150" cy="150" r="90" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          
          {/* Chair Seat */}
          <line x1="80" y1="210" x2="220" y2="210" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
          <line x1="90" y1="210" x2="90" y2="270" stroke="#334155" strokeWidth="4" />
          <line x1="210" y1="210" x2="210" y2="270" stroke="#334155" strokeWidth="4" />

          {/* Seated Figure - Front View */}
          {/* Head */}
          <circle cx="150" cy="65" r="22" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
          {/* Neck */}
          <line x1="150" y1="87" x2="150" y2="98" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          {/* Shoulders / Torso */}
          <rect x="110" y="98" width="80" height="85" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
          {/* Arms */}
          <path d="M 108 102 C 95 120, 95 170, 110 190" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <path d="M 192 102 C 205 120, 205 170, 190 190" fill="none" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          
          {/* Hips / Thighs */}
          <rect x="114" y="183" width="72" height="30" rx="8" fill="#1e293b" stroke={isFieldActive('hipWidth') ? '#a78bfa' : '#64748b'} strokeWidth={isFieldActive('hipWidth') ? 4 : 3} />

          {/* Legs */}
          <rect x="118" y="213" width="22" height="60" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <rect x="160" y="213" width="22" height="60" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />

          {/* Dynamic Hip Width Dimension Arrow */}
          {isFieldActive('hipWidth') && (
            <g className="animate-pulse">
              <line x1="114" y1="198" x2="186" y2="198" stroke="#c084fc" strokeWidth="3" strokeDasharray="4 2" />
              <polygon points="114,198 122,194 122,202" fill="#c084fc" />
              <polygon points="186,198 178,194 178,202" fill="#c084fc" />
              {/* Highlight circles on hip edges */}
              <circle cx="114" cy="198" r="4" fill="#a78bfa" />
              <circle cx="186" cy="198" r="4" fill="#a78bfa" />
              {/* Text label */}
              <rect x="130" y="183" width="40" height="15" rx="3" fill="#6b21a8" />
              <text x="150" y="194" fill="#f3f4f6" fontSize="10" fontWeight="bold" textAnchor="middle">HIP WIDTH</text>
            </g>
          )}
        </svg>
      );
    }

    // Side View for all other steps
    return (
      <svg viewBox="0 0 300 300" className="w-full h-full max-h-[260px] md:max-h-[300px]">
        {/* Background Grid */}
        <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        <circle cx="150" cy="150" r="90" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

        {/* Floor Line */}
        <line x1="50" y1="270" x2="250" y2="270" stroke="#334155" strokeWidth="3" />

        {/* Chair Backrest */}
        <line x1="105" y1="120" x2="105" y2="200" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
        {/* Chair Seat */}
        <line x1="95" y1="200" x2="190" y2="200" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
        {/* Chair Base Cylinder */}
        <line x1="135" y1="200" x2="135" y2="270" stroke="#334155" strokeWidth="4" />

        {/* Seated Figure - Side View */}
        {/* Foot */}
        <path d="M 185 270 L 210 270" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
        {/* Lower Leg */}
        <line 
          x1="185" y1="200" x2="185" y2="270" 
          stroke={isFieldActive('poplitealHeight') ? '#a78bfa' : '#64748b'} 
          strokeWidth={isFieldActive('poplitealHeight') ? 5 : 3} 
          strokeLinecap="round" 
        />
        {/* Thigh (Buttock to Knee) */}
        <line 
          x1="115" y1="200" x2="185" y2="200" 
          stroke={isFieldActive('buttockToKnee') ? '#a78bfa' : '#64748b'} 
          strokeWidth={isFieldActive('buttockToKnee') ? 5 : 3} 
          strokeLinecap="round" 
        />
        {/* Spine/Torso */}
        <line 
          x1="115" y1="110" x2="115" y2="200" 
          stroke={isFieldActive('seatedShoulderHeight') ? '#a78bfa' : '#64748b'} 
          strokeWidth={isFieldActive('seatedShoulderHeight') ? 5 : 3} 
          strokeLinecap="round" 
        />
        {/* Upper Arm */}
        <line 
          x1="115" y1="120" x2="115" y2="170" 
          stroke="#475569" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
        {/* Forearm */}
        <line 
          x1="115" y1="170" x2="160" y2="170" 
          stroke={isFieldActive('seatedElbowHeight') ? '#a78bfa' : '#64748b'} 
          strokeWidth={isFieldActive('seatedElbowHeight') ? 5 : 3} 
          strokeLinecap="round" 
        />
        {/* Head */}
        <circle cx="115" cy="80" r="18" fill="#1e293b" stroke="#64748b" strokeWidth="3" />

        {/* Dynamic Overlay Arrow for Overall Height */}
        {isFieldActive('overallHeight') && (
          <g className="animate-pulse">
            <line x1="230" y1="60" x2="230" y2="270" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="4 2" />
            <polygon points="230,60 226,68 234,68" fill="#c084fc" />
            <polygon points="230,270 226,262 234,262" fill="#c084fc" />
            
            {/* Top reference line */}
            <line x1="115" y1="60" x2="245" y2="60" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="200" y="150" width="60" height="15" rx="3" fill="#6b21a8" />
            <text x="230" y="161" fill="#f3f4f6" fontSize="9" fontWeight="bold" textAnchor="middle">HEIGHT</text>
          </g>
        )}

        {/* Dynamic Overlay Arrow for Popliteal Height */}
        {isFieldActive('poplitealHeight') && (
          <g className="animate-pulse">
            {/* Dimension line next to lower leg */}
            <line x1="205" y1="200" x2="205" y2="270" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="4 2" />
            <polygon points="205,200 201,208 209,208" fill="#c084fc" />
            <polygon points="205,270 201,262 209,262" fill="#c084fc" />
            
            {/* Reference horizontal lines */}
            <line x1="185" y1="200" x2="215" y2="200" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Indicator Circle */}
            <circle cx="185" cy="200" r="4" fill="#a78bfa" />
            <circle cx="185" cy="270" r="4" fill="#a78bfa" />

            <rect x="200" y="225" width="55" height="15" rx="3" fill="#6b21a8" />
            <text x="227" y="236" fill="#f3f4f6" fontSize="8" fontWeight="bold" textAnchor="middle">POPLITEAL</text>
          </g>
        )}

        {/* Dynamic Overlay Arrow for Buttock-to-Knee */}
        {isFieldActive('buttockToKnee') && (
          <g className="animate-pulse">
            {/* Dimension line above thigh */}
            <line x1="115" y1="225" x2="185" y2="225" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="4 2" />
            <polygon points="115,225 123,221 123,229" fill="#c084fc" />
            <polygon points="185,225 177,221 177,229" fill="#c084fc" />
            
            {/* Reference vertical lines */}
            <line x1="115" y1="200" x2="115" y2="235" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="185" y1="200" x2="185" y2="235" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Indicator Circle */}
            <circle cx="115" cy="200" r="4" fill="#a78bfa" />
            <circle cx="185" cy="200" r="4" fill="#a78bfa" />

            <rect x="128" y="235" width="44" height="15" rx="3" fill="#6b21a8" />
            <text x="150" y="246" fill="#f3f4f6" fontSize="8" fontWeight="bold" textAnchor="middle">DEPTH</text>
          </g>
        )}

        {/* Dynamic Overlay Arrow for Seated Elbow Height */}
        {isFieldActive('seatedElbowHeight') && (
          <g className="animate-pulse">
            {/* Dimension line from seat up to elbow */}
            <line x1="135" y1="170" x2="135" y2="200" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="4 2" />
            <polygon points="135,170 131,178 139,178" fill="#c084fc" />
            <polygon points="135,200 131,192 139,192" fill="#c084fc" />
            
            {/* Reference horizontal lines */}
            <line x1="115" y1="170" x2="145" y2="170" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Indicator Circle */}
            <circle cx="115" cy="170" r="4" fill="#a78bfa" />
            <circle cx="115" cy="200" r="4" fill="#a78bfa" />

            <rect x="142" y="177" width="55" height="15" rx="3" fill="#6b21a8" />
            <text x="169" y="188" fill="#f3f4f6" fontSize="8" fontWeight="bold" textAnchor="middle">ELBOW HT</text>
          </g>
        )}

        {/* Dynamic Overlay Arrow for Seated Shoulder Height */}
        {isFieldActive('seatedShoulderHeight') && (
          <g className="animate-pulse">
            {/* Dimension line from seat up to shoulder */}
            <line x1="75" y1="110" x2="75" y2="200" stroke="#c084fc" strokeWidth="2.5" strokeDasharray="4 2" />
            <polygon points="75,110 71,118 79,118" fill="#c084fc" />
            <polygon points="75,200 71,192 79,192" fill="#c084fc" />
            
            {/* Reference horizontal lines */}
            <line x1="70" y1="110" x2="115" y2="110" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="70" y1="200" x2="115" y2="200" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            
            {/* Indicator Circle */}
            <circle cx="115" cy="110" r="4" fill="#a78bfa" />
            <circle cx="115" cy="200" r="4" fill="#a78bfa" />

            <rect x="35" y="145" width="60" height="15" rx="3" fill="#6b21a8" />
            <text x="65" y="156" fill="#f3f4f6" fontSize="8" fontWeight="bold" textAnchor="middle">SHOULDER</text>
          </g>
        )}
      </svg>
    );
  };

  const handleNext = () => {
    // Parse numeric inputs based on current unit
    const field = getFieldForStep(currentStep);
    
    if (field === 'gender') {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      syncInputValue(nextStep, isInch);
      return;
    }

    const rawVal = parseFloat(inputValue);
    if (isNaN(rawVal) || rawVal <= 0) {
      setError('Please enter a valid positive number.');
      return;
    }

    // Convert input to cm if in inches
    const valInCm = isInch ? convertInToCm(rawVal) : rawVal;

    // Validate using Zod schemas dynamically for this field
    try {
      baseSchema.shape[field].parse(valInCm);

      // Perform sanity checks based on user height
      if (currentStep > 0) {
        const { isValid, range } = validateMeasurement(field, valInCm, formData.overallHeight);
        
        // Save the updated field in cm
        const updatedData = { ...formData, [field]: valInCm };
        setFormData(updatedData);
        
        if (!isValid) {
          // Warning: show warning before proceeding or let user overwrite
          setError(`Warning: Outside realistic range (${isInch ? convertCmToIn(range.min) : range.min} - ${isInch ? convertCmToIn(range.max) : range.max} ${isInch ? 'in' : 'cm'}). Please confirm your measurement.`);
          // If we already warn once, we allow user to click next again. We do this by checking if the error is already a warning.
          if (error && error.includes('Warning:')) {
            proceedToNextStep(updatedData);
          }
          return;
        }
      }

      const updatedData = { ...formData, [field]: valInCm };
      setFormData(updatedData);
      proceedToNextStep(updatedData);

    } catch (e: any) {
      if (e instanceof z.ZodError) {
        setError(e.issues[0].message);
      } else {
        setError('Invalid input.');
      }
    }
  };

  const proceedToNextStep = (updatedData: UserMeasurements) => {
    if (currentStep === 5) {
      // Complete!
      onComplete(updatedData, isInch);
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // We need to pass updatedData to sync the next field's input box
      const nextField = getFieldForStep(nextStep);
      const nextValCm = updatedData[nextField as keyof UserMeasurements];
      if (nextField === 'gender') {
        setInputValue(updatedData.gender);
      } else {
        const numericVal = nextValCm as number;
        const formattedVal = isInch ? convertCmToIn(numericVal) : numericVal;
        setInputValue(formattedVal.toString());
      }
      setError(null);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      syncInputValue(prevStep, isInch);
    }
  };

  const handleGenderChange = (gender: 'male' | 'female' | 'other') => {
    setFormData(prev => ({ ...prev, gender }));
    setInputValue(gender);
    setError(null);
  };

  const activeField = getFieldForStep(currentStep);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Progress tracker */}
      <div className="bg-slate-900/30 border border-slate-850/60 p-5 rounded-2xl no-print">
        <ProgressTracker
          currentStep={currentStep}
          stepsCount={6}
          stepLabels={STEP_LABELS}
        />
      </div>

      {/* Wizard Card */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch w-full transition-all duration-300">
        
        {/* Visual Guide Left Side */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl p-4 border border-slate-900/50 min-h-[280px]">
          {renderSVGGuide(currentStep)}
          
          {/* Toggle units (metric/imperial) inside guide for quick action */}
          {currentStep !== 0 && activeField !== 'gender' && (
            <div className="mt-4 flex gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-[11px] font-medium tracking-wide">
              <button
                type="button"
                onClick={() => handleUnitToggle(false)}
                className={`px-3 py-1 rounded transition-all duration-200 ${!isInch ? 'bg-violet-600/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                METRIC (CM)
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle(true)}
                className={`px-3 py-1 rounded transition-all duration-200 ${isInch ? 'bg-violet-600/80 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                IMPERIAL (IN)
              </button>
            </div>
          )}
        </div>

        {/* Input Form Right Side */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-wider text-violet-400 uppercase bg-violet-950/50 px-2.5 py-1 rounded border border-violet-900/30">
                STEP {currentStep}
              </span>
              {currentStep > 0 && (
                <span className="text-xs text-slate-500 font-medium">
                  Calibrated to {isInch ? convertCmToIn(formData.overallHeight) : formData.overallHeight} {isInch ? 'in' : 'cm'}
                </span>
              )}
            </div>
            
            <h2 className="text-xl md:text-2xl font-semibold text-slate-100 mb-2">
              {getStepTitle(currentStep)}
            </h2>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {getStepDescription(currentStep)}
            </p>

            {/* Form input fields */}
            <div className="space-y-4">
              {currentStep === 0 ? (
                // Step 0: Gender and Height calibration
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Biological Sex / Model Reference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['male', 'female', 'other'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleGenderChange(g)}
                          className={`py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-all duration-200
                            ${formData.gender === g
                              ? 'bg-violet-500/20 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/10'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="height-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Overall Height ({isInch ? 'inches' : 'cm'})
                      </label>
                      <div className="flex bg-slate-900 p-0.5 rounded-md border border-slate-800 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleUnitToggle(false)}
                          className={`px-2 py-0.5 rounded ${!isInch ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
                        >
                          CM
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUnitToggle(true)}
                          className={`px-2 py-0.5 rounded ${isInch ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
                        >
                          IN
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      id="height-input"
                      step="any"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(null);
                      }}
                      placeholder="Enter height"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 text-base focus:border-violet-500 focus:bg-slate-950 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                // Step 1-5: Anthropometric inputs
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="measurement-input" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Measurement ({isInch ? 'inches' : 'cm'})
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTooltip(!showTooltip)}
                      className="text-slate-500 hover:text-slate-350 transition-colors"
                      title="Help"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {showTooltip && (
                    <div className="bg-slate-900 border border-slate-800 text-xs text-slate-300 p-3 rounded-lg mb-3 leading-normal animate-fadeIn">
                      <p className="font-semibold text-violet-400 mb-1">How to measure correctly:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Sit upright on a flat surface, with knees bent at 90 degrees.</li>
                        <li>Keep feet flat on the floor.</li>
                        <li>Use a firm tape measure for precision.</li>
                        <li>If you're in between sizes, round to the nearest decimal.</li>
                      </ul>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="number"
                      id="measurement-input"
                      step="any"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(null);
                      }}
                      placeholder={`Enter value in ${isInch ? 'inches' : 'cm'}`}
                      className={`w-full bg-slate-950/80 border rounded-lg py-2.5 px-4 text-slate-200 text-base focus:bg-slate-950 focus:border-violet-500 transition-colors
                        ${error 
                          ? error.includes('Warning:') 
                            ? 'border-amber-600/60 focus:border-amber-500' 
                            : 'border-rose-600/60 focus:border-rose-500' 
                          : 'border-slate-800'
                        }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Validation Feedback & Alert boxes */}
            {error && (
              <div 
                className={`mt-4 p-3 rounded-lg flex items-start gap-2.5 text-xs animate-fadeIn
                  ${error.includes('Warning:') 
                    ? 'bg-amber-950/40 border border-amber-900/30 text-amber-300' 
                    : 'bg-rose-950/40 border border-rose-900/30 text-rose-300'
                  }`}
              >
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-500" />
                <span className="leading-normal">{error}</span>
              </div>
            )}
          </div>

          {/* Buttons / Actions */}
          <div className="flex items-center gap-3 mt-8">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all glow-btn"
            >
              {currentStep === 5 ? (
                <>
                  Calculate Profile
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  {error && error.includes('Warning:') ? 'Confirm & Continue' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
