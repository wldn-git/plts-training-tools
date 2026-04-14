export interface PVSizingInput {
  billAmount: number;
  tariff: number;
  panelWp?: number;
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
    panelWp = 450, 
    psh = 4.0, 
    efficiency = 0.8 
  } = input;

  const monthlyEnergy = billAmount / tariff;
  const dailyEnergy = monthlyEnergy / 30;

  // Kalkulasi Kebutuhan Fisik
  const targetKwp = dailyEnergy / (psh * efficiency);
  const numPanels = Math.ceil((targetKwp * 1000) / panelWp);
  const actualKwp = (numPanels * panelWp) / 1000;
  
  // LOGIKA HARGA BERTINGKAT (ECONOMIES OF SCALE)
  let pricePerKwp = 15000000; // Harga default (< 5 kWp)
  
  if (actualKwp > 100) {
    pricePerKwp = 9000000;  // Kelas Pabrik Raksasa
  } else if (actualKwp > 50) {
    pricePerKwp = 10500000; // Kelas Gudang/Pabrik Menengah
  } else if (actualKwp > 10) {
    pricePerKwp = 12000000; // Kelas Ruko/Kantor Besar
  } else if (actualKwp > 5) {
    pricePerKwp = 13500000; // Kelas Rumah Mewah
  }

  const roofArea = numPanels * 2.2; 
  const estimatedCost = actualKwp * pricePerKwp;
  const monthlySaving = billAmount * 0.8; // Estimasi hemat 80% untuk On-Grid

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
