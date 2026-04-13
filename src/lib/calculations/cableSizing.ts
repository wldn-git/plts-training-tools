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
  
  // 1. Calculate Current
  const current = power / voltage;
  
  // 2. Resistance (Rho)
  // Copper: 0.0175 ohm.mm2/m
  // Aluminum: 0.028 ohm.mm2/m
  const rho = material === 'COPPER' ? 0.0175 : 0.028;
  
  // 3. Max allowable voltage drop in Volts
  const maxVdVolt = (maxVoltageDrop / 100) * voltage;
  
  // 4. Required Area (A = (2 * L * I * rho) / Vd)
  // Distance is multiplied by 2 for the return path
  const minArea = (2 * length * current * rho) / maxVdVolt;
  
  // 5. Find nearest higher standard size
  let standardArea = STANDARD_CABLE_SIZES[STANDARD_CABLE_SIZES.length - 1];
  for (const size of STANDARD_CABLE_SIZES) {
    if (size >= minArea) {
      standardArea = size;
      break;
    }
  }
  
  // 6. Actual voltage drop with standard size
  const resistance = (2 * length * rho) / standardArea;
  const actualVdVolt = current * resistance;
  const actualVdPercent = (actualVdVolt / voltage) * 100;

  return {
    current: Math.round(current * 100) / 100,
    voltageDropVolt: Math.round(maxVdVolt * 100) / 100,
    resistance: Math.round(resistance * 1000) / 1000,
    minArea: Math.round(minArea * 100) / 100,
    standardArea,
    actualVoltageDrop: Math.round(actualVdPercent * 100) / 100
  };
}
