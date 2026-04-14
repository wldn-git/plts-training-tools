export interface PVSizingInput {
  billAmount: number;
  tariff: number;
  panelWp: number;
  panelPrice: number;
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
}

export function calculatePVSizing(input: PVSizingInput): PVSizingOutput {
  const { 
    billAmount, 
    tariff, 
    panelWp, 
    panelPrice,
    psh = 4.0, 
    efficiency = 0.8 
  } = input;

  const monthlyEnergy = billAmount / tariff;
  const dailyEnergy = monthlyEnergy / 30;

  // 1. Hitung Kapasitas Target (kWp)
  const targetKwp = dailyEnergy / (psh * efficiency);
  
  // 2. Hitung Jumlah Panel berdasarkan Wp pilihan
  const numPanels = Math.ceil((targetKwp * 1000) / panelWp);
  const actualKwp = (numPanels * panelWp) / 1000;
  
  // 3. LOGIKA BIAYA NYATA (HARGA PANEL + OVERHEAD SISTEM)
  // Overhead (Inverter, Mounting, Kabel, Jasa) biasanya berkurang seiring besarnya sistem
  let bosMultiplier = 1.3; // Default 130% tambahan dari harga panel untuk infrastruktur
  
  if (actualKwp > 50) bosMultiplier = 0.8; 
  else if (actualKwp > 10) bosMultiplier = 1.0;
  else if (actualKwp > 3) bosMultiplier = 1.2;

  // Biaya Panel Total
  const panelTotalCost = numPanels * panelPrice;
  // Biaya Infrastruktur (Estimasi)
  const bosCost = panelTotalCost * bosMultiplier;
  
  // Total Investasi
  const estimatedCost = panelTotalCost + bosCost;
  const pricePerKwp = estimatedCost / actualKwp;

  const roofArea = numPanels * 2.2; // Rata-rata 2.2m2 per panel large
  const monthlySaving = billAmount * 0.85; // On-grid dengan ekspor kWh (estimasi konservatif)

  return {
    monthlyEnergy,
    dailyEnergy,
    targetKwp,
    numPanels,
    actualKwp,
    roofArea,
    estimatedCost,
    monthlySaving,
    pricePerKwp
  };
}
