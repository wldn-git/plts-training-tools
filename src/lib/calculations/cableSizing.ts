export interface CableSizingInput {
  power: number; // Watt
  voltage: number; // Volt
  length: number; // meters (one way)
  maxVoltageDrop: number; // %
  material: 'COPPER' | 'ALUMINUM';
}

export interface CableSizingOutput {
  current: number; // Ampere
  voltageDropVolt: number;
  resistance: number;
  minArea: number; // mm2
  standardArea: number; // mm2 (next available standard size)
  actualVoltageDrop: number;
}

const STANDARD_CABLE_SIZES = [
  0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300
];

export function calculateCableSizing(input: CableSizingInput): CableSizingOutput {
  const { power, voltage, length, maxVoltageDrop, material } = input;
  
  const safePower = Math.max(0, power || 0);
  const safeVoltage = voltage > 0 ? voltage : 230;
  const safeLength = Math.max(0.1, length || 1);
  const safeMaxDrop = maxVoltageDrop > 0 ? maxVoltageDrop : 3;

  // 1. Calculate Current
  const current = safePower / safeVoltage;
  
  // 2. Resistance (Rho)
  const rho = material === 'COPPER' ? 0.0175 : 0.028;
  
  // 3. Max allowable voltage drop in Volts
  const maxVdVolt = (safeMaxDrop / 100) * safeVoltage;
  
  // 4. Required Area (A = (2 * L * I * rho) / Vd)
  const minArea = maxVdVolt > 0 ? (2 * safeLength * current * rho) / maxVdVolt : 0;
  
  // 5. Find nearest higher standard size
  let standardArea = STANDARD_CABLE_SIZES[STANDARD_CABLE_SIZES.length - 1];
  for (const size of STANDARD_CABLE_SIZES) {
    if (size >= minArea) {
      standardArea = size;
      break;
    }
  }
  
  // 6. Actual voltage drop with standard size
  const resistance = (2 * safeLength * rho) / standardArea;
  const actualVdVolt = current * resistance;
  const actualVdPercent = (actualVdVolt / safeVoltage) * 100;

  return {
    current: Math.round(current * 100) / 100,
    voltageDropVolt: Math.round(maxVdVolt * 100) / 100,
    resistance: Math.round(resistance * 1000) / 1000,
    minArea: Math.round(minArea * 100) / 100,
    standardArea,
    actualVoltageDrop: Math.round(actualVdPercent * 100) / 100
  };
}
