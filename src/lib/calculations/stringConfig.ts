import type { SolarPanel, Inverter } from '../db';

export interface StringConfigInput {
  numPanels: number;
  panel: SolarPanel;
  inverter: Inverter;
}

export interface StringConfiguration {
  series: number;
  parallel: number;
  totalStrings: number;
  totalVoc: number;
  totalVmp: number;
  stringCurrent: number;
  isValid: boolean;
  warnings: string[];
  errors: string[];
  efficiency: number; // 0-100 score
}

export function calculateStringConfig(input: StringConfigInput): StringConfiguration[] {
  const { numPanels, panel, inverter } = input;
  const configurations: StringConfiguration[] = [];

  // Try all possible series configurations
  for (let series = 1; series <= numPanels; series++) {
    const parallel = Math.floor(numPanels / series);
    
    // Must use all panels exactly
    if (series * parallel !== numPanels) continue;
    
    // Can't exceed number of MPPT inputs
    if (parallel > inverter.numMppt) continue;
    
    const config: StringConfiguration = {
      series,
      parallel,
      totalStrings: parallel,
      totalVoc: panel.voc * series,
      totalVmp: panel.vmp * series,
      stringCurrent: panel.isc,
      isValid: true,
      warnings: [],
      errors: [],
      efficiency: 100
    };

    // ============ VALIDATION CHECKS ============
    
    // 1. Open Circuit Voltage Check
    if (config.totalVoc > inverter.maxDcVoltage) {
      config.errors.push(
        `Voc ${config.totalVoc.toFixed(1)}V melebihi max ${inverter.maxDcVoltage}V`
      );
      config.isValid = false;
    }
    
    // Warning if too close to limit (>95%)
    if (config.totalVoc > inverter.maxDcVoltage * 0.95 && config.isValid) {
      config.warnings.push(
        `Voc mendekati limit (${((config.totalVoc / inverter.maxDcVoltage) * 100).toFixed(1)}%)`
      );
      config.efficiency -= 10;
    }

    // 2. MPPT Range Check
    if (config.totalVmp < inverter.mpptRangeMin) {
      config.errors.push(
        `Vmp ${config.totalVmp.toFixed(1)}V di bawah MPPT range (${inverter.mpptRangeMin}V)`
      );
      config.isValid = false;
    }

    if (config.totalVmp > inverter.mpptRangeMax) {
      config.errors.push(
        `Vmp ${config.totalVmp.toFixed(1)}V melebihi MPPT range (${inverter.mpptRangeMax}V)`
      );
      config.isValid = false;
    }

    // Optimal MPPT zone: middle 50% of range
    if (config.isValid) {
      const mpptMiddle = (inverter.mpptRangeMin + inverter.mpptRangeMax) / 2;
      const mpptRange = inverter.mpptRangeMax - inverter.mpptRangeMin;
      const distanceFromMiddle = Math.abs(config.totalVmp - mpptMiddle);
      
      if (distanceFromMiddle > mpptRange * 0.25) {
        config.warnings.push('Vmp tidak di zona optimal MPPT');
        config.efficiency -= 5;
      }
    }

    // 3. Current Check
    if (config.stringCurrent > inverter.maxDcCurrent) {
      config.errors.push(
        `String current ${config.stringCurrent.toFixed(1)}A melebihi max ${inverter.maxDcCurrent}A`
      );
      config.isValid = false;
    }

    // 4. String Length Check
    if (series < 4) {
      config.warnings.push('String terlalu pendek - rentan voltage drop');
      config.efficiency -= 10;
    }

    if (series > 20) {
      config.warnings.push('String terlalu panjang - susah maintenance');
      config.efficiency -= 5;
    }

    // 5. Parallel String Check
    if (parallel > 3) {
      config.warnings.push(
        'Terlalu banyak string parallel - pertimbangkan inverter lebih besar'
      );
      config.efficiency -= 5;
    }

    // 6. Temperature Coefficient Consideration
    // At -10°C, Voc increases by ~10V per 10 panels
    const tempCorrectedVoc = config.totalVoc * (1 + (0.1 * Math.abs(panel.tempCoeff) * 10 / 100));
    if (tempCorrectedVoc > inverter.maxDcVoltage * 0.9) {
      config.warnings.push(
        `Warning: Di suhu rendah (-10°C), Voc bisa mencapai ${tempCorrectedVoc.toFixed(1)}V`
      );
      config.efficiency -= 15;
    }

    configurations.push(config);
  }

  // Sort by efficiency score (highest first)
  return configurations.sort((a, b) => b.efficiency - a.efficiency);
}
