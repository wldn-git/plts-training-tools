export interface BatterySizingInput {
  dailyLoad: number; // Wh
  autonomyDays: number;
  dod: number; // 0-100
  systemVoltage: number; // 12, 24, 48
  batteryVoltage: number; // 6, 12, 24, 48
  batteryCapacityAh: number;
}

export interface BatterySizingOutput {
  totalCapacityWh: number;
  totalCapacityAh: number;
  numSeries: number;
  numParallel: number;
  totalBatteries: number;
  actualDoD: number;
}

export function calculateBatterySizing(input: BatterySizingInput): BatterySizingOutput {
  const { dailyLoad, autonomyDays, dod, systemVoltage, batteryVoltage, batteryCapacityAh } = input;

  // Total energy needed
  const totalWh = (dailyLoad * autonomyDays) / (dod / 100);
  
  // Total Ah at system voltage
  const totalAh = totalWh / systemVoltage;
  
  // Sizing strings
  const numSeries = systemVoltage / batteryVoltage;
  const numParallel = Math.ceil(totalAh / batteryCapacityAh);
  
  const totalBatteries = Math.ceil(numSeries) * numParallel;
  
  const actualDoD = (dailyLoad * autonomyDays) / (numParallel * batteryCapacityAh * systemVoltage) * 100;

  return {
    totalCapacityWh: Math.round(totalWh),
    totalCapacityAh: Math.round(totalAh),
    numSeries: Math.ceil(numSeries),
    numParallel,
    totalBatteries,
    actualDoD: Math.round(actualDoD * 10) / 10
  };
}
