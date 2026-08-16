export interface PVSizingInput {
  billAmount: number;
  tariff: number;
  panelWp: number;
  panelPrice: number;
  systemType: 'ON_GRID' | 'OFF_GRID' | 'HYBRID';
  batteryVoltage?: number;
  batteryPrice?: number;
  batteryAh?: number;
  psh?: number;
  efficiency?: number;
}

export interface PVSizingOutput {
  monthlyEnergy: number;
  dailyEnergy: number;
  targetKwp: number;
  numPanels: number;
  actualKwp: number;
  roofArea: number;
  estimatedCost: number;
  monthlySaving: number;
  pricePerKwp: number;
  batteryRequiredKwh?: number;
  numBatteries?: number;
}

export function calculatePVSizing(input: PVSizingInput): PVSizingOutput {
  const { 
    billAmount, 
    tariff, 
    panelWp, 
    panelPrice,
    systemType,
    batteryVoltage = 48,
    batteryPrice = 0,
    batteryAh = 100,
    psh = 4.0, 
    efficiency = 0.8 
  } = input;

  const safeTariff = tariff > 0 ? tariff : 1699;
  const safePanelWp = panelWp > 0 ? panelWp : 450;
  const safePanelPrice = panelPrice >= 0 ? panelPrice : 0;
  const safePsh = psh > 0 ? psh : 4.0;
  const safeEfficiency = efficiency > 0 ? efficiency : 0.8;

  const monthlyEnergy = billAmount / safeTariff;
  const dailyEnergy = monthlyEnergy / 30;

  // 1. Hitung Kapasitas Target (kWp)
  // Untuk Off-grid biasanya butuh kapasitas lebih besar karena murni dari surya
  const safetyFactor = systemType === 'OFF_GRID' ? 1.4 : 1.2;
  const targetKwp = (dailyEnergy * safetyFactor) / (safePsh * safeEfficiency);
  
  // 2. Hitung Jumlah Panel berdasarkan Wp pilihan
  const numPanels = Math.ceil((targetKwp * 1000) / safePanelWp);
  const actualKwp = (numPanels * safePanelWp) / 1000;
  
  // 3. LOGIKA BIAYA NYATA (HARGA PANEL + OVERHEAD SISTEM)
  let bosMultiplier = 1.3; 
  if (systemType === 'OFF_GRID') bosMultiplier = 1.6; // Inverter Off-grid & Charger lebih mahal
  else if (systemType === 'HYBRID') bosMultiplier = 1.8; // Hybrid Inverter paling mahal
  
  if (actualKwp > 50) bosMultiplier -= 0.4; 
  else if (actualKwp > 10) bosMultiplier -= 0.2;

  // Biaya Panel Total
  const panelTotalCost = numPanels * safePanelPrice;
  // Biaya Infrastruktur Inverter, Mounting, Jasa (Estimasi)
  const bosCost = panelTotalCost * bosMultiplier;
  
  // 4. Kalkulasi Baterai (jika bukan On-grid)
  let batteryRequiredKwh = 0;
  let numBatteries = 0;
  let totalBatteryCost = 0;

  if (systemType !== 'ON_GRID') {
    // Estimasi backup 1 hari
    batteryRequiredKwh = dailyEnergy * 1.2; // 20% Buffer
    const safeBatteryVolt = batteryVoltage && batteryVoltage > 0 ? batteryVoltage : 48;
    const safeBatteryAh = batteryAh && batteryAh > 0 ? batteryAh : 100;
    const kwhPerBattery = (safeBatteryVolt * safeBatteryAh) / 1000;
    numBatteries = kwhPerBattery > 0 ? Math.ceil(batteryRequiredKwh / kwhPerBattery) : 0;
    totalBatteryCost = numBatteries * (batteryPrice || 0);
  }

  // Total Investasi
  const estimatedCost = panelTotalCost + bosCost + totalBatteryCost;
  const pricePerKwp = actualKwp > 0 ? estimatedCost / actualKwp : 0;

  const roofArea = numPanels * 2.2; 
  const monthlySaving = systemType === 'ON_GRID' ? billAmount * 0.85 : billAmount; // Off-grid hemat 100% tagihan

  return {
    monthlyEnergy,
    dailyEnergy,
    targetKwp,
    numPanels,
    actualKwp,
    roofArea,
    estimatedCost,
    monthlySaving,
    pricePerKwp,
    batteryRequiredKwh: systemType !== 'ON_GRID' ? batteryRequiredKwh : undefined,
    numBatteries: systemType !== 'ON_GRID' ? numBatteries : undefined
  };
}
