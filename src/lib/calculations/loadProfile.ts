export interface Appliance {
  id: string;
  name: string;
  power: number; // Watt
  quantity: number;
  hoursPerDay: number;
}

export interface LoadProfileOutput {
  totalDailyEnergy: number; // Wh
  totalMonthlyEnergy: number; // kWh
  peakPower: number; // Watt
  suggestedInverterSize: number; // Watt
}

export function calculateLoadProfile(appliances: Appliance[]): LoadProfileOutput {
  let totalDailyWh = 0;
  let peakW = 0;

  appliances.forEach(app => {
    const dailyWh = app.power * app.quantity * app.hoursPerDay;
    totalDailyWh += dailyWh;
    peakW += app.power * app.quantity;
  });

  return {
    totalDailyEnergy: Math.round(totalDailyWh),
    totalMonthlyEnergy: Math.round((totalDailyWh * 30) / 1000),
    peakPower: peakW,
    suggestedInverterSize: Math.round(peakW * 1.25) // 25% safety margin
  };
}
