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

  const safeDod = dod > 0 ? dod : 80;
  const safeSysVolt = systemVoltage > 0 ? systemVoltage : 24;
  const safeBatVolt = batteryVoltage > 0 ? batteryVoltage : 12;
  const safeAh = batteryCapacityAh > 0 ? batteryCapacityAh : 100;
  const safeDailyLoad = Math.max(0, dailyLoad || 0);
  const safeAutonomy = Math.max(1, autonomyDays || 1);

  // Total energy needed
  const totalWh = (safeDailyLoad * safeAutonomy) / (safeDod / 100);
  
  // Total Ah at system voltage
  const totalAh = totalWh / safeSysVolt;
  
  // Sizing strings
  const numSeries = Math.max(1, Math.ceil(safeSysVolt / safeBatVolt));
  const numParallel = Math.max(1, Math.ceil(totalAh / safeAh));
  
  const totalBatteries = numSeries * numParallel;
  
  const totalCapacityKwhSystem = (numParallel * safeAh * safeSysVolt);
  const actualDoD = totalCapacityKwhSystem > 0 
    ? ((safeDailyLoad * safeAutonomy) / totalCapacityKwhSystem) * 100 
    : 0;

  return {
    totalCapacityWh: isFinite(totalWh) ? Math.round(totalWh) : 0,
    totalCapacityAh: isFinite(totalAh) ? Math.round(totalAh) : 0,
    numSeries,
    numParallel,
    totalBatteries,
    actualDoD: Math.round(actualDoD * 10) / 10
  };
}
