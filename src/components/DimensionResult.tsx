// src/components/DimensionResult.tsx
import React from 'react';
import { RefreshCw, Printer, Info, Check } from 'lucide-react';
import { calculateErgonomics, convertCmToIn } from '../logic/calcEngine';
import type { UserMeasurements } from '../logic/calcEngine';

interface DimensionResultProps {
  measurements: UserMeasurements;
  isInch: boolean;
  onReset: () => void;
}

export const DimensionResult: React.FC<DimensionResultProps> = ({
  measurements,
  isInch,
  onReset,
}) => {
  const results = calculateErgonomics(measurements);

  const formatVal = (cmVal: number) => {
    if (isInch) {
      return `${convertCmToIn(cmVal)} in`;
    }
    return `${cmVal} cm`;
  };

  const handlePrint = () => {
    window.print();
  };

  // Dynamic schematic scaling parameters (converting cm to SVG pixels: 1.6px per cm)
  const scale = 1.6;
  const floorY = 260;
  
  // Heights relative to floor (calculated in pixels)
  const seatHeightPx = results.seatHeight * scale;
  const seatDepthPx = results.seatDepth * scale;
  const deskHeightPx = results.deskHeight * scale;
  const backrestHeightPx = results.backrestHeight * scale;

  // Seat coordinates
  const seatY = floorY - seatHeightPx;
  const backrestTopY = seatY - backrestHeightPx;
  
  // Desk coordinates
  const deskY = floorY - deskHeightPx;

  return (
    <div className="w-full max-w-4xl space-y-8 animate-fadeIn">
      {/* Action Buttons (Non-printable) */}
      <div className="flex justify-between items-center no-print">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Recalculate Profile
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-violet-600/10 glow-btn"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF Report
        </button>
      </div>

      {/* Main Layout Card */}
      <div className="glass-panel print-card rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-stretch">
        
        {/* Dimensions Summary (Left Side) */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 print-title flex items-center gap-2">
              Your Ergonomic Profile
              <span className="no-print text-xs font-normal bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/50">
                Saved Locally
              </span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Optimal workstation setup calibrated to your body measurements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Seat Height */}
            <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-violet-500/30 transition-all">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Seat Height</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-violet-400">{formatVal(results.seatHeight)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Height from the floor to the seat surface. Knees should be bent at 90° with feet flat.
              </p>
            </div>

            {/* Seat Depth */}
            <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-violet-500/30 transition-all">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Seat Depth</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-violet-400">{formatVal(results.seatDepth)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Depth of seat pan. Leaves about 2-3 fingers space behind your knee crease to prevent pinching.
              </p>
            </div>

            {/* Desk Height */}
            <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-violet-500/30 transition-all">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Desk Height</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-emerald-400">{formatVal(results.deskHeight)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Desktop surface height. Allows shoulders to relax and elbows to bend at roughly 90°.
              </p>
            </div>

            {/* Seat Width */}
            <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-violet-500/30 transition-all">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Seat Width</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-violet-400">{formatVal(results.seatWidth)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Seat pan width. Provides comfortable lateral clearance without pinning your hips.
              </p>
            </div>

            {/* Backrest Height */}
            <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl flex flex-col justify-between hover:border-violet-500/30 transition-all sm:col-span-2">
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Backrest height</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-violet-400">{formatVal(results.backrestHeight)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Recommended mid-backrest support zone height. Should end just below the shoulder blades to optimize lumbar contour support.
              </p>
            </div>

          </div>
        </div>

        {/* Dynamic Vector Schematic Rendering (Right Side) */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl p-4 border border-slate-900/50 relative overflow-hidden min-h-[320px]">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span>Interactive Custom-Scale Mockup</span>
          </div>

          <svg viewBox="0 0 320 300" className="w-full h-full max-h-[300px]">
            {/* Floor Line */}
            <line x1="20" y1={floorY} x2="300" y2={floorY} stroke="#334155" strokeWidth="3" />
            
            {/* Chair Legs */}
            <line x1="80" y1={seatY} x2="70" y2={floorY} stroke="#475569" strokeWidth="4" />
            <line x1="110" y1={seatY} x2="120" y2={floorY} stroke="#475569" strokeWidth="4" />
            
            {/* Chair Seat Pan */}
            <rect 
              x="50" 
              y={seatY} 
              width={seatDepthPx} 
              height="6" 
              rx="3" 
              fill="#8b5cf6" 
              className="transition-all duration-500" 
            />

            {/* Backrest Support Bars */}
            <line x1="53" y1={seatY} x2="53" y2={backrestTopY} stroke="#475569" strokeWidth="4" />
            
            {/* Chair Backrest cushion */}
            <rect 
              x="45" 
              y={backrestTopY} 
              width="8" 
              height={backrestHeightPx} 
              rx="4" 
              fill="#8b5cf6" 
              className="transition-all duration-500" 
            />

            {/* Desk Legs */}
            <line x1="200" y1={deskY} x2="200" y2={floorY} stroke="#475569" strokeWidth="5" />
            <line x1="280" y1={deskY} x2="280" y2={floorY} stroke="#334155" strokeWidth="4" />
            
            {/* Desk Tabletop */}
            <rect 
              x="180" 
              y={deskY} 
              width="120" 
              height="8" 
              rx="2" 
              fill="#10b981" 
              className="transition-all duration-500" 
            />

            {/* Keyboard & Mouse schematic */}
            <rect x="195" y={deskY - 4} width="22" height="4" fill="#64748b" />
            <circle cx="230" cy={deskY - 2} r="2.5" fill="#64748b" />

            {/* Dimension Lines Overlay */}
            
            {/* Seat Height Dim */}
            <g className="opacity-80">
              <line x1="150" y1={seatY} x2="150" y2={floorY} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="150" cy={seatY} r="3" fill="#a78bfa" />
              <circle cx="150" cy={floorY} r="3" fill="#a78bfa" />
              <text x="142" y={seatY + (seatHeightPx / 2)} fill="#a78bfa" fontSize="9" fontWeight="bold" textAnchor="end">
                {formatVal(results.seatHeight)}
              </text>
            </g>

            {/* Desk Height Dim */}
            <g className="opacity-80">
              <line x1="165" y1={deskY} x2="165" y2={floorY} stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="165" cy={deskY} r="3" fill="#34d399" />
              <circle cx="165" cy={floorY} r="3" fill="#34d399" />
              <text x="173" y={deskY + (deskHeightPx / 2)} fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="start">
                {formatVal(results.deskHeight)}
              </text>
            </g>
          </svg>

          {/* Quick calibration feedback */}
          <div className="mt-2 text-center text-xs text-slate-500 border-t border-slate-900 w-full pt-4">
            Input reference measurements: Height: <strong className="text-slate-400">{isInch ? convertCmToIn(measurements.overallHeight) : measurements.overallHeight}{isInch ? 'in' : 'cm'}</strong> | Popliteal: <strong className="text-slate-400">{isInch ? convertCmToIn(measurements.poplitealHeight) : measurements.poplitealHeight}{isInch ? 'in' : 'cm'}</strong>
          </div>
        </div>

      </div>

      {/* Anthropometric Reference Table (Printable) */}
      <div className="bg-slate-950/20 border border-slate-900 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-violet-400" />
          Raw Input Reference Details
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-400">
            <thead>
              <tr className="border-b border-slate-900 text-left font-medium text-slate-500">
                <th className="pb-2">Measurement Field</th>
                <th className="pb-2">Value ({isInch ? 'Imperial' : 'Metric'})</th>
                <th className="pb-2">Value ({!isInch ? 'Imperial' : 'Metric'})</th>
                <th className="pb-2">Dynamic Ratio Calibration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              <tr>
                <td className="py-2">Popliteal Height</td>
                <td className="py-2 font-medium text-slate-350">{isInch ? `${convertCmToIn(measurements.poplitealHeight)} in` : `${measurements.poplitealHeight} cm`}</td>
                <td className="py-2">{!isInch ? `${convertCmToIn(measurements.poplitealHeight)} in` : `${measurements.poplitealHeight} cm`}</td>
                <td className="py-2 text-slate-500">{((measurements.poplitealHeight / measurements.overallHeight) * 100).toFixed(1)}% of height (Typical: 20-32%)</td>
              </tr>
              <tr>
                <td className="py-2">Buttock-to-Knee Length</td>
                <td className="py-2 font-medium text-slate-350">{isInch ? `${convertCmToIn(measurements.buttockToKnee)} in` : `${measurements.buttockToKnee} cm`}</td>
                <td className="py-2">{!isInch ? `${convertCmToIn(measurements.buttockToKnee)} in` : `${measurements.buttockToKnee} cm`}</td>
                <td className="py-2 text-slate-500">{((measurements.buttockToKnee / measurements.overallHeight) * 100).toFixed(1)}% of height (Typical: 24-38%)</td>
              </tr>
              <tr>
                <td className="py-2">Seated Elbow Height</td>
                <td className="py-2 font-medium text-slate-350">{isInch ? `${convertCmToIn(measurements.seatedElbowHeight)} in` : `${measurements.seatedElbowHeight} cm`}</td>
                <td className="py-2">{!isInch ? `${convertCmToIn(measurements.seatedElbowHeight)} in` : `${measurements.seatedElbowHeight} cm`}</td>
                <td className="py-2 text-slate-500">{((measurements.seatedElbowHeight / measurements.overallHeight) * 100).toFixed(1)}% of height (Typical: 10-24%)</td>
              </tr>
              <tr>
                <td className="py-2">Hip Width</td>
                <td className="py-2 font-medium text-slate-350">{isInch ? `${convertCmToIn(measurements.hipWidth)} in` : `${measurements.hipWidth} cm`}</td>
                <td className="py-2">{!isInch ? `${convertCmToIn(measurements.hipWidth)} in` : `${measurements.hipWidth} cm`}</td>
                <td className="py-2 text-slate-500">{((measurements.hipWidth / measurements.overallHeight) * 100).toFixed(1)}% of height (Typical: 16-32%)</td>
              </tr>
              <tr>
                <td className="py-2">Seated Shoulder Height</td>
                <td className="py-2 font-medium text-slate-350">{isInch ? `${convertCmToIn(measurements.seatedShoulderHeight)} in` : `${measurements.seatedShoulderHeight} cm`}</td>
                <td className="py-2">{!isInch ? `${convertCmToIn(measurements.seatedShoulderHeight)} in` : `${measurements.seatedShoulderHeight} cm`}</td>
                <td className="py-2 text-slate-500">{((measurements.seatedShoulderHeight / measurements.overallHeight) * 100).toFixed(1)}% of height (Typical: 30-48%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
