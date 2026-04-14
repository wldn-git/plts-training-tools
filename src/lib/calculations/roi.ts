export interface ROIInput {
  investment: number;
  systemCapacity: number; // kWp
  psh: number; // Peak Sun Hours
  tarif: number; // Rp per kWh
  escalationRate: number; // % per year
  degradationRate: number; // % per year
  selfConsumptionRatio: number; // %
  exportCredit: number; // % of import tariff (default 65)
  years: number;
  systemType: 'ON_GRID' | 'OFF_GRID' | 'HYBRID';
  batteryCost?: number; // Biaya penggantian baterai
  batteryLifespan?: number; // Tahun (misal 8 tahun)
}

export interface YearlyData {
  year: number;
  tarif: number;
  production: number; // kWh
  annualSaving: number;
  cumulative: number;
  net: number;
}

export interface ROIOutput {
  paybackPeriod: number;
  totalSavings: number;
  roi: number; // % return on investment
  yearlyData: YearlyData[];
}

export function calculateROI(input: ROIInput): ROIOutput {
  const yearlyData: YearlyData[] = [];
  let cumulative = 0;
  let paybackPeriod = input.years;

  const {
    systemType,
    batteryCost = 0,
    batteryLifespan = 8,
    selfConsumptionRatio,
    exportCredit
  } = input;

  for (let year = 1; year <= input.years; year++) {
    // Tarif dengan escalasi
    const tarif = input.tarif * Math.pow(1 + input.escalationRate / 100, year - 1);
    
    // Produksi dengan degradasi panel
    const production = input.systemCapacity * input.psh * 365 * 
                      Math.pow(1 - input.degradationRate / 100, year - 1);
    
    // Saving calculation
    let annualSaving = 0;

    if (systemType === 'OFF_GRID') {
      // Off-grid menghemat 100% produksi (sebagai pengganti biaya PLN)
      annualSaving = production * tarif;
    } else {
      // On-grid atau Hybrid (saat on-grid)
      const selfConsumed = production * (selfConsumptionRatio / 100);
      const exported = production * (1 - selfConsumptionRatio / 100);
      const exportTarif = tarif * (exportCredit / 100);
      annualSaving = (selfConsumed * tarif) + (exported * exportTarif);
    }

    // Maintenance Cost: Ganti Baterai (jika ada komponen baterai)
    if (systemType !== 'ON_GRID' && year > 1 && (year - 1) % batteryLifespan === 0) {
      annualSaving -= batteryCost;
    }
    
    cumulative += annualSaving;
    const net = cumulative - input.investment;
    
    // Find payback period (interpolate for decimal years)
    if (net >= 0 && paybackPeriod === input.years) {
      const prevNet = cumulative - annualSaving - input.investment;
      paybackPeriod = year - 1 + Math.abs(prevNet) / annualSaving;
    }
    
    yearlyData.push({
      year,
      tarif: Math.round(tarif),
      production: Math.round(production),
      annualSaving: Math.round(annualSaving),
      cumulative: Math.round(cumulative),
      net: Math.round(net)
    });
  }
  
  const totalSavings = cumulative;
  const roi = ((totalSavings - input.investment) / input.investment) * 100;
  
  return {
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    totalSavings: Math.round(totalSavings),
    roi: Math.round(roi),
    yearlyData
  };
}
