// src/logic/calcEngine.ts

export interface UserMeasurements {
  overallHeight: number; // overall height (used for sanity calibration)
  gender: 'male' | 'female' | 'other';
  poplitealHeight: number; // floor to crease behind knee
  buttockToKnee: number;
  seatedElbowHeight: number;
  hipWidth: number;
  seatedShoulderHeight: number;
}

export interface ErgonomicResults {
  seatHeight: number;
  seatDepth: number;
  deskHeight: number;
  seatWidth: number;
  backrestHeight: number;
}

export const convertCmToIn = (cm: number): number => {
  return parseFloat((cm / 2.54).toFixed(1));
};

export const convertInToCm = (inches: number): number => {
  return parseFloat((inches * 2.54).toFixed(1));
};

// Core ergonomic formulas (in cm by default)
export const calculateErgonomics = (m: UserMeasurements): ErgonomicResults => {
  return {
    seatHeight: parseFloat((m.poplitealHeight - 2).toFixed(1)), // -2cm for shoe/posture buffer
    seatDepth: parseFloat((m.buttockToKnee - 6).toFixed(1)),   // -6cm for popliteal clearance
    deskHeight: parseFloat((m.poplitealHeight - 2 + m.seatedElbowHeight).toFixed(1)),
    seatWidth: parseFloat((m.hipWidth + 5).toFixed(1)),        // +5cm for clearance
    backrestHeight: parseFloat((m.seatedShoulderHeight * 0.6).toFixed(1))
  };
};

export interface ValidationRange {
  min: number; // in cm
  max: number; // in cm
  label: string;
  desc: string;
}

// Realistic ranges for human dimensions (cm)
export const REALISTIC_RANGES: Record<keyof Omit<UserMeasurements, 'gender'>, (height: number) => ValidationRange> = {
  overallHeight: () => ({
    min: 90,
    max: 230,
    label: "Overall Height",
    desc: "Your total height standing flat on the floor."
  }),
  poplitealHeight: (height) => ({
    min: Math.round(height * 0.20),
    max: Math.round(height * 0.32),
    label: "Popliteal Height",
    desc: "Floor to the crease behind your knee (feet flat on floor)."
  }),
  buttockToKnee: (height) => ({
    min: Math.round(height * 0.24),
    max: Math.round(height * 0.38),
    label: "Buttock-to-Knee Length",
    desc: "Back of buttocks to the front of the kneecap."
  }),
  seatedElbowHeight: (height) => ({
    min: Math.round(height * 0.10),
    max: Math.round(height * 0.24),
    label: "Seated Elbow Height",
    desc: "Seat surface to the underside of your elbow (elbow bent at 90°)."
  }),
  hipWidth: (height) => ({
    min: Math.round(height * 0.16),
    max: Math.round(height * 0.32),
    label: "Hip Width",
    desc: "Maximum width across your hips when seated."
  }),
  seatedShoulderHeight: (height) => ({
    min: Math.round(height * 0.30),
    max: Math.round(height * 0.48),
    label: "Seated Shoulder Height",
    desc: "Seat surface to the top of your shoulder."
  })
};

// Generic sanity check function from roadmap
// const isRealistic = (val, total) => val > (total * 0.2) && val < (total * 0.6);
export const isRealisticRoadmap = (val: number, total: number): boolean => {
  return val > total * 0.2 && val < total * 0.6;
};

// Precise validator based on statistical body ratios
export const validateMeasurement = (
  field: keyof Omit<UserMeasurements, 'gender'>,
  val: number,
  height: number
): { isValid: boolean; range: ValidationRange } => {
  const range = REALISTIC_RANGES[field](height);
  const isValid = val >= range.min && val <= range.max;
  return { isValid, range };
};
