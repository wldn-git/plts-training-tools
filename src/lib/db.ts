// src/lib/db.ts

import Dexie, { type Table } from 'dexie';

// ==================== TypeScript Interfaces ====================

export interface SolarPanel {
  id?: number;
  brand: string;
  model: string;
  power: number;         // Watt (e.g., 520)
  voc: number;           // Open Circuit Voltage (e.g., 49.5)
  vmp: number;           // Max Power Voltage (e.g., 41.8)
  isc: number;           // Short Circuit Current (e.g., 13.9)
  imp: number;           // Max Power Current (e.g., 12.44)
  efficiency: number;    // % (e.g., 21.5)
  tier: 1 | 2 | 3;       // Tier 1 = best quality
  price: number;         // Rupiah
  warranty: number;      // Years
  tempCoeff: number;     // %/°C (e.g., -0.35)
  length: number;        // mm (e.g., 2278)
  width: number;         // mm (e.g., 1134)
}

export interface Inverter {
  id?: number;
  brand: string;
  model: string;
  type: 'ON_GRID' | 'OFF_GRID' | 'HYBRID';
  power: number;         // Watt
  maxDcVoltage: number;  // Volt (e.g., 550)
  mpptRangeMin: number;  // Volt (e.g., 90)
  mpptRangeMax: number;  // Volt (e.g., 520)
  maxDcCurrent: number;  // Ampere per MPPT (e.g., 15)
  numMppt: number;       // Number of MPPT trackers
  efficiency: number;    // %
  price: number;         // Rupiah
  warranty: number;      // Years
}

export interface Battery {
  id?: number;
  brand: string;
  model: string;
  type: 'LEAD_ACID' | 'LIFEPO4' | 'LI_ION';
  voltage: 6 | 12 | 24 | 48; // Volt
  capacityAh: number;    // Ampere-hour
  capacityKwh: number;   // kWh
  dod: number;           // Depth of Discharge %
  cycleLife: number;     // Number of cycles
  price: number;         // Rupiah
  warranty: number;      // Years
}

export interface Project {
  id?: number;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  systemType: 'ON_GRID' | 'OFF_GRID' | 'HYBRID';
  capacity: number;      // kWp
  numPanels: number;
  numBatteries?: number;
  batteryCapacity?: number; // Total kWh
  investment: number;    // Rupiah
  roiYears: number;
  annualSaving: number;  // Rupiah
  installDate?: Date;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  photos: string[];      // Base64 or blob URLs
  description?: string;
  testimonial?: string;
  createdAt: Date;
}

export interface Calculation {
  id?: number;
  toolType: 'STRING_CONFIG' | 'CABLE_SIZING' | 'ROI' | 'BATTERY' | 'MOUNTING' | 'PERFORMANCE' | 'SHADING' | 'QUOTE' | 'LOAD_PROFILE' | 'TROUBLESHOOTING';
  inputs: any;           // JSON object
  outputs: any;          // JSON object
  savedName?: string;    // User-given name
  createdAt: Date;
}

export interface QuizQuestion {
  id?: number;
  category: 'TEORI' | 'INSTALASI' | 'SAFETY' | 'TROUBLESHOOTING' | 'BISNIS';
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface QuizAttempt {
  id?: number;
  score: number;         // 0-100
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;     // seconds
  answers: { questionId: number; userAnswer: string; correct: boolean }[];
  passed: boolean;       // score >= 80
  createdAt: Date;
}

export interface Settings {
  key: string;
  value: any;
}

// ==================== Dexie Database ====================

class PLTSDatabase extends Dexie {
  solarPanels!: Table<SolarPanel, number>;
  inverters!: Table<Inverter, number>;
  batteries!: Table<Battery, number>;
  projects!: Table<Project, number>;
  calculations!: Table<Calculation, number>;
  quizQuestions!: Table<QuizQuestion, number>;
  quizAttempts!: Table<QuizAttempt, number>;
  settings!: Table<Settings, string>;

  constructor() {
    super('PLTSTrainingTools');
    
    this.version(1).stores({
      solarPanels: '++id, brand, model, power, tier, price',
      inverters: '++id, brand, model, type, power, price',
      batteries: '++id, brand, model, type, voltage, price',
      projects: '++id, name, systemType, status, createdAt',
      calculations: '++id, toolType, createdAt',
      quizQuestions: '++id, category, difficulty',
      quizAttempts: '++id, score, createdAt',
      settings: 'key'
    });
  }
}

export const db = new PLTSDatabase();

// ==================== Seed Data ====================

export async function initializeDatabase() {
  const panelCount = await db.solarPanels.count();
  
  if (panelCount === 0) {
    // Seed solar panels
    await db.solarPanels.bulkAdd([
      {
        brand: 'Longi',
        model: 'LR5-54HIH-520M',
        power: 520,
        voc: 49.5,
        vmp: 41.8,
        isc: 13.9,
        imp: 12.44,
        efficiency: 21.5,
        tier: 1,
        price: 2080000,
        warranty: 25,
        tempCoeff: -0.35,
        length: 2278,
        width: 1134
      },
      {
        brand: 'JA Solar',
        model: 'JAM54S31-505/MR',
        power: 505,
        voc: 48.8,
        vmp: 41.2,
        isc: 13.65,
        imp: 12.26,
        efficiency: 21.2,
        tier: 1,
        price: 2020000,
        warranty: 25,
        tempCoeff: -0.34,
        length: 2278,
        width: 1134
      },
      {
        brand: 'Trina Solar',
        model: 'TSM-DE18M(II)-500W',
        power: 500,
        voc: 48.2,
        vmp: 40.6,
        isc: 13.75,
        imp: 12.31,
        efficiency: 20.9,
        tier: 1,
        price: 2000000,
        warranty: 25,
        tempCoeff: -0.36,
        length: 2278,
        width: 1134
      },
      {
        brand: 'Jinko Solar',
        model: 'JKM545M-72HL4-V',
        power: 545,
        voc: 50.2,
        vmp: 42.3,
        isc: 14.05,
        imp: 12.89,
        efficiency: 21.8,
        tier: 1,
        price: 2180000,
        warranty: 25,
        tempCoeff: -0.35,
        length: 2278,
        width: 1134
      },
      {
        brand: 'Canadian Solar',
        model: 'CS3W-450MS',
        power: 450,
        voc: 41.8,
        vmp: 34.5,
        isc: 14.2,
        imp: 13.05,
        efficiency: 20.5,
        tier: 1,
        price: 1800000,
        warranty: 25,
        tempCoeff: -0.37,
        length: 2108,
        width: 1048
      },
      {
        brand: 'Risen Energy',
        model: 'RSM120-8-535BMDG',
        power: 535,
        voc: 49.8,
        vmp: 41.9,
        isc: 13.88,
        imp: 12.77,
        efficiency: 21.4,
        tier: 2,
        price: 1875000,
        warranty: 25,
        tempCoeff: -0.35,
        length: 2278,
        width: 1134
      },
      {
        brand: 'Astronergy',
        model: 'CHSM72M(DG)/F-HC-490W',
        power: 490,
        voc: 48.5,
        vmp: 40.8,
        isc: 13.45,
        imp: 12.01,
        efficiency: 20.8,
        tier: 2,
        price: 1715000,
        warranty: 25,
        tempCoeff: -0.36,
        length: 2278,
        width: 1134
      },
      {
        brand: 'DAH Solar',
        model: 'DHM72X16-FG-530W',
        power: 530,
        voc: 49.6,
        vmp: 41.7,
        isc: 13.92,
        imp: 12.71,
        efficiency: 21.3,
        tier: 2,
        price: 1855000,
        warranty: 25,
        tempCoeff: -0.35,
        length: 2278,
        width: 1134
      },
      {
        brand: 'ZNShine',
        model: 'ZXM6-LD72-450/V',
        power: 450,
        voc: 41.5,
        vmp: 34.2,
        isc: 14.35,
        imp: 13.16,
        efficiency: 20.4,
        tier: 2,
        price: 1575000,
        warranty: 25,
        tempCoeff: -0.38,
        length: 2094,
        width: 1038
      },
      {
        brand: 'Ulica Solar',
        model: 'UL-460M-144H',
        power: 460,
        voc: 42.1,
        vmp: 34.8,
        isc: 14.28,
        imp: 13.22,
        efficiency: 20.6,
        tier: 3,
        price: 1380000,
        warranty: 25,
        tempCoeff: -0.37,
        length: 2108,
        width: 1048
      },
      {
        brand: 'Luxen Solar',
        model: 'LX500-144M-DG',
        power: 500,
        voc: 48.0,
        vmp: 40.5,
        isc: 13.8,
        imp: 12.35,
        efficiency: 20.7,
        tier: 3,
        price: 1500000,
        warranty: 25,
        tempCoeff: -0.36,
        length: 2278,
        width: 1134
      },
      {
        brand: 'Eging PV',
        model: 'EG-M182H-BF-540W',
        power: 540,
        voc: 50.0,
        vmp: 42.1,
        isc: 13.95,
        imp: 12.83,
        efficiency: 21.2,
        tier: 3,
        price: 1890000,
        warranty: 25,
        tempCoeff: -0.35,
        length: 2278,
        width: 1134
      },
      {
        brand: 'Seraphim',
        model: 'SRP-530-BMB-DG',
        power: 530,
        voc: 49.4,
        vmp: 41.6,
        isc: 13.87,
        imp: 12.74,
        efficiency: 21.1,
        tier: 2,
        price: 1855000,
        warranty: 25,
        tempCoeff: -0.35,
        length: 2278,
        width: 1134
      },
      {
        brand: 'GCL',
        model: 'GCL-M10/72HDH-540W',
        power: 540,
        voc: 50.1,
        vmp: 42.2,
        isc: 13.93,
        imp: 12.80,
        efficiency: 21.3,
        tier: 2,
        price: 1890000,
        warranty: 25,
        tempCoeff: -0.35,
        length: 2278,
        width: 1134
      },
      {
        brand: 'Hanwha Q-Cells',
        model: 'Q.PEAK DUO ML-G10+ 505',
        power: 505,
        voc: 48.9,
        vmp: 41.3,
        isc: 13.62,
        imp: 12.23,
        efficiency: 21.4,
        tier: 1,
        price: 2020000,
        warranty: 25,
        tempCoeff: -0.34,
        length: 2278,
        width: 1134
      }
    ]);

    // Seed inverters
    await db.inverters.bulkAdd([
      {
        brand: 'Huawei',
        model: 'SUN2000-3KTL-L1',
        type: 'ON_GRID',
        power: 3000,
        maxDcVoltage: 600,
        mpptRangeMin: 90,
        mpptRangeMax: 560,
        maxDcCurrent: 16,
        numMppt: 2,
        efficiency: 97.6,
        price: 4200000,
        warranty: 10
      },
      {
        brand: 'Huawei',
        model: 'SUN2000-5KTL-L1',
        type: 'ON_GRID',
        power: 5000,
        maxDcVoltage: 600,
        mpptRangeMin: 90,
        mpptRangeMax: 560,
        maxDcCurrent: 16,
        numMppt: 2,
        efficiency: 97.8,
        price: 5800000,
        warranty: 10
      },
      {
        brand: 'Growatt',
        model: 'MIN 2500TL-XE',
        type: 'ON_GRID',
        power: 2500,
        maxDcVoltage: 550,
        mpptRangeMin: 50,
        mpptRangeMax: 520,
        maxDcCurrent: 13,
        numMppt: 2,
        efficiency: 97.4,
        price: 3500000,
        warranty: 10
      },
      {
        brand: 'Sungrow',
        model: 'SG3.0RT',
        type: 'ON_GRID',
        power: 3000,
        maxDcVoltage: 600,
        mpptRangeMin: 40,
        mpptRangeMax: 560,
        maxDcCurrent: 16,
        numMppt: 2,
        efficiency: 97.7,
        price: 4000000,
        warranty: 10
      },
      {
        brand: 'Goodwe',
        model: 'GW5000-NS',
        type: 'ON_GRID',
        power: 5000,
        maxDcVoltage: 600,
        mpptRangeMin: 50,
        mpptRangeMax: 550,
        maxDcCurrent: 14,
        numMppt: 2,
        efficiency: 97.5,
        price: 5500000,
        warranty: 10
      },
      {
        brand: 'Growatt',
        model: 'SPF 3000TL HVM',
        type: 'HYBRID',
        power: 3000,
        maxDcVoltage: 500,
        mpptRangeMin: 100,
        mpptRangeMax: 450,
        maxDcCurrent: 25,
        numMppt: 1,
        efficiency: 97.0,
        price: 8500000,
        warranty: 10
      },
      {
        brand: 'Huawei',
        model: 'SUN2000-5KTL-M1',
        type: 'HYBRID',
        power: 5000,
        maxDcVoltage: 600,
        mpptRangeMin: 200,
        mpptRangeMax: 560,
        maxDcCurrent: 16,
        numMppt: 2,
        efficiency: 97.5,
        price: 10500000,
        warranty: 10
      },
      {
        brand: 'Voltronic',
        model: 'Axpert MKS 3K-24',
        type: 'OFF_GRID',
        power: 3000,
        maxDcVoltage: 145,
        mpptRangeMin: 30,
        mpptRangeMax: 115,
        maxDcCurrent: 80,
        numMppt: 1,
        efficiency: 93.0,
        price: 5000000,
        warranty: 5
      },
      {
        brand: 'Must Solar',
        model: 'PH18-3K MPK',
        type: 'OFF_GRID',
        power: 3000,
        maxDcVoltage: 450,
        mpptRangeMin: 120,
        mpptRangeMax: 430,
        maxDcCurrent: 25,
        numMppt: 1,
        efficiency: 95.0,
        price: 4800000,
        warranty: 5
      },
      {
        brand: 'Deye',
        model: 'SUN-5K-SG04LP3-EU',
        type: 'HYBRID',
        power: 5000,
        maxDcVoltage: 550,
        mpptRangeMin: 125,
        mpptRangeMax: 500,
        maxDcCurrent: 18,
        numMppt: 2,
        efficiency: 97.3,
        price: 9800000,
        warranty: 10
      }
    ]);

    // Seed batteries
    await db.batteries.bulkAdd([
      {
        brand: 'Pylontech',
        model: 'US3000C',
        type: 'LIFEPO4',
        voltage: 48,
        capacityAh: 74,
        capacityKwh: 3.55,
        dod: 90,
        cycleLife: 6000,
        price: 12000000,
        warranty: 10
      },
      {
        brand: 'BYD',
        model: 'Battery-Box Premium LVS 4.0',
        type: 'LIFEPO4',
        voltage: 48,
        capacityAh: 83,
        capacityKwh: 4.0,
        dod: 90,
        cycleLife: 6000,
        price: 13500000,
        warranty: 10
      },
      {
        brand: 'Trojan',
        model: 'T-105 RE',
        type: 'LEAD_ACID',
        voltage: 6,
        capacityAh: 225,
        capacityKwh: 1.35,
        dod: 50,
        cycleLife: 1500,
        price: 2200000,
        warranty: 5
      },
      {
        brand: 'Crown',
        model: 'CR-430',
        type: 'LEAD_ACID',
        voltage: 6,
        capacityAh: 430,
        capacityKwh: 2.58,
        dod: 50,
        cycleLife: 1200,
        price: 3500000,
        warranty: 3
      },
      {
        brand: 'Felicity',
        model: 'FL-4850F',
        type: 'LIFEPO4',
        voltage: 48,
        capacityAh: 100,
        capacityKwh: 4.8,
        dod: 90,
        cycleLife: 6000,
        price: 15000000,
        warranty: 10
      }
    ]);

    // Seed quiz questions (Comprehensive set)
    await db.quizQuestions.bulkAdd([
      // ===== TEORI =====
      {
        category: 'TEORI', difficulty: 'MEDIUM',
        question: 'Berapa efisiensi konversi tipikal untuk panel surya monocrystalline Tier 1?',
        optionA: '12-15%', optionB: '15-18%', optionC: '18-22%', optionD: '22-26%',
        correctAnswer: 'C',
        explanation: 'Panel monocrystalline Tier 1 modern memiliki efisiensi 18-22%, dengan beberapa model premium mencapai hingga 22-23%.'
      },
      {
        category: 'TEORI', difficulty: 'EASY',
        question: 'Apa kepanjangan dari MPPT?',
        optionA: 'Maximum Power Point Tracking', optionB: 'Minimum Power Pan Tracking',
        optionC: 'Maximum Photovoltaic Panel Test', optionD: 'Micro Power Point Technology',
        correctAnswer: 'A',
        explanation: 'MPPT (Maximum Power Point Tracking) adalah algoritma yang digunakan inverter/charger untuk mengekstrak daya maksimum dari panel surya.'
      },
      {
        category: 'TEORI', difficulty: 'MEDIUM',
        question: 'Apa yang terjadi pada output panel surya ketika suhu panel meningkat?',
        optionA: 'Tegangan naik, arus turun', optionB: 'Tegangan turun, arus sedikit naik',
        optionC: 'Keduanya naik', optionD: 'Tidak ada perubahan',
        correctAnswer: 'B',
        explanation: 'Saat suhu naik, tegangan (Voc dan Vmp) turun signifikan (~0.35%/°C) sementara arus (Isc) sedikit naik. Net efeknya adalah penurunan daya.'
      },
      {
        category: 'TEORI', difficulty: 'HARD',
        question: 'Sistem PLTS 5 kWp dengan PSH 4.5 jam/hari dan degradasi 0.5%/tahun. Berapa estimasi produksi tahun ke-10?',
        optionA: '77.5 kWh/hari', optionB: '21.4 kWh/hari', optionC: '20.3 kWh/hari', optionD: '18.9 kWh/hari',
        correctAnswer: 'C',
        explanation: 'Produksi awal = 5 x 4.5 = 22.5 kWh/hari. Tahun ke-10 = 22.5 x (1-0.005)^9 ≈ 22.5 x 0.956 ≈ 21.5 → dengan sistem losses ~5% ≈ 20.3 kWh/hari.'
      },
      {
        category: 'TEORI', difficulty: 'EASY',
        question: 'Apa perbedaan utama sistem PLTS On-Grid dan Off-Grid?',
        optionA: 'On-Grid lebih mahal selalu', optionB: 'Off-grid terhubung ke PLN',
        optionC: 'On-Grid terhubung ke jaringan PLN, Off-Grid berdiri sendiri', optionD: 'On-Grid wajib pakai baterai',
        correctAnswer: 'C',
        explanation: 'On-Grid terhubung ke jaringan PLN (bisa ekspor-impor), tidak butuh baterai. Off-Grid berdiri sendiri, wajib menggunakan baterai sebagai penyimpan energi.'
      },
      {
        category: 'TEORI', difficulty: 'MEDIUM',
        question: 'Apa yang dimaksud dengan DoD (Depth of Discharge) pada baterai?',
        optionA: 'Sisa kapasitas baterai', optionB: 'Persentase kapasitas yang telah dikosongkan dari total kapasitas',
        optionC: 'Kecepatan pengisian baterai', optionD: 'Tegangan maksimum baterai',
        correctAnswer: 'B',
        explanation: 'DoD menunjukkan seberapa banyak energi yang sudah diambil dari baterai. Semakin rendah DoD yang digunakan, semakin awet umur siklus baterai tersebut.'
      },
      {
        category: 'TEORI', difficulty: 'MEDIUM',
        question: 'Teknologi baterai mana yang memiliki jumlah siklus hidup (cycle life) paling lama?',
        optionA: 'Aki Basah (Lead Acid)', optionB: 'Baterai Gel / VRLA',
        optionC: 'Lithium Ferro Phosphate (LiFePO4)', optionD: 'Aki Kering MF',
        correctAnswer: 'C',
        explanation: 'LiFePO4 (Lithium) saat ini unggul dengan siklus hidup mencapai 6000+ kali, jauh di atas Lead Acid yang hanya sekitar 500-1500 kali.'
      },

      // ===== INSTALASI =====
      {
        category: 'INSTALASI', difficulty: 'EASY',
        question: 'Apa yang dimaksud dengan Voc pada spesifikasi panel surya?',
        optionA: 'Voltage saat operating condition', optionB: 'Open circuit voltage (tegangan tanpa beban)',
        optionC: 'Voltage optimal untuk MPPT', optionD: 'Voltage saat overcurrent',
        correctAnswer: 'B',
        explanation: 'Voc (Open Circuit Voltage) adalah tegangan maksimum saat tidak ada beban. Penting untuk sizing inverter agar tidak melampaui Max DC Input.'
      },
      {
        category: 'INSTALASI', difficulty: 'MEDIUM',
        question: 'Berapa batas maksimum voltage drop yang diperbolehkan pada sisi DC sistem PLTS?',
        optionA: '1%', optionB: '3%', optionC: '5%', optionD: '10%',
        correctAnswer: 'B',
        explanation: 'Standar industri membatasi voltage drop sisi DC maksimum 3% dan sisi AC maksimum 2% untuk menjaga efisiensi sistem.'
      },
      {
        category: 'INSTALASI', difficulty: 'MEDIUM',
        question: 'Konfigurasi string manakah yang disebut "hybrid" pada sistem PLTS?',
        optionA: 'Semua panel parallel', optionB: 'Semua panel series',
        optionC: 'Beberapa panel series lalu dihubung parallel', optionD: 'Hanya 1 panel per string',
        correctAnswer: 'C',
        explanation: 'Konfigurasi Series-Parallel (hybrid) adalah beberapa panel dihubungkan series dulu (untuk menaikkan tegangan) kemudian string-string tersebut dihubung parallel.'
      },
      {
        category: 'INSTALASI', difficulty: 'HARD',
        question: 'Panel 520Wp (Voc=49.5V, Vmp=41.8V) dipasang 8 series. Inverter memiliki Max DC 500V. Apakah konfigurasi ini AMAN?',
        optionA: 'Ya, 8x49.5=396V jauh di bawah 500V', optionB: 'Tidak, karena suhu dingin Voc bisa naik ~112.5% = 446V, masih aman',
        optionC: 'Tidak, harus dihitung pada suhu dingin minimum', optionD: 'Ya, selama Vmp 8x41.8=334.4V di bawah 500V',
        correctAnswer: 'B',
        explanation: 'Voc suhu rendah (misal -10°C, delta 35°C) = 49.5 x [1 + (35 x 0.003)] = 49.5 x 1.105 = 54.7V per panel. 8 x 54.7 = 437.6V < 500V → AMAN. Selalu hitung Voc pada suhu terdingin lokasi.'
      },
      {
        category: 'INSTALASI', difficulty: 'EASY',
        question: 'Jenis kabel apa yang wajib digunakan pada sisi DC panel surya?',
        optionA: 'Kabel NYM biasa', optionB: 'Kabel NYAF standar',
        optionC: 'Kabel khusus solar DC double-insulated (TUV/UL)', optionD: 'Semua jenis kabel boleh',
        correctAnswer: 'C',
        explanation: 'Kabel wajib khusus solar (double insulation, rated 1000V DC, UV resistant) karena terpapar panas, UV, dan tegangan DC tinggi secara terus-menerus.'
      },

      // ===== SAFETY =====
      {
        category: 'SAFETY', difficulty: 'MEDIUM',
        question: 'Mengapa DC lebih berbahaya dari AC pada tegangan yang sama?',
        optionA: 'DC memiliki arus lebih besar', optionB: 'DC tidak ada zero crossing, otot tidak bisa lepas',
        optionC: 'DC voltage lebih tinggi', optionD: 'DC lebih mudah short circuit',
        correctAnswer: 'B',
        explanation: 'DC tidak memiliki zero crossing seperti AC, sehingga otot terus berkontraksi (freezing effect) dan korban tidak bisa melepaskan diri.'
      },
      {
        category: 'SAFETY', difficulty: 'EASY',
        question: 'APD (Alat Pelindung Diri) apa yang WAJIB dipakai saat bekerja di atap untuk instalasi panel?',
        optionA: 'Hanya helm safety', optionB: 'Helm, harness, dan sepatu safety',
        optionC: 'Sarung tangan saja', optionD: 'Tidak perlu APD khusus',
        correctAnswer: 'B',
        explanation: 'Bekerja di ketinggian wajib: Helm (benturan), Full Body Harness + lanyard (anti-jatuh), Sepatu safety bersolal anti-slip, dan Kacamata safety.'
      },
      {
        category: 'SAFETY', difficulty: 'MEDIUM',
        question: 'Kapan satu-satunya waktu yang aman untuk bekerja dan menghasilkan arus 0 ampere dari string panel?',
        optionA: 'Saat cloudly/mendung', optionB: 'Saat inverter dimatikan',
        optionC: 'Tidak pernah, panel selalu menghasilkan tegangan saat ada cahaya', optionD: 'Saat DC breaker off',
        correctAnswer: 'C',
        explanation: 'Panel surya akan terus menghasilkan tegangan dan arus KAPANPUN ada cahaya mengenai permukaannya. Matikan DC breaker tidak menghilangkan hazard pada sisi panel ke breaker.'
      },
      {
        category: 'SAFETY', difficulty: 'HARD',
        question: 'Berapa nilai Insulation Resistance minimum yang diterima untuk sistem PLTS sesuai IEC 62446?',
        optionA: '≥100 kΩ', optionB: '≥1 MΩ',
        optionC: '≥50 kΩ per volt tegangan sistem', optionD: '≥1 MΩ atau ≥100 Ω/V (mana yang lebih besar)',
        correctAnswer: 'D',
        explanation: 'IEC 62446 mensyaratkan IR ≥ 1 MΩ untuk sistem <100V atau ≥ 100Ω/V x Voc sistem untuk tegangan lebih tinggi. Tes dilakukan antar string dan ke ground.'
      },
      {
        category: 'SAFETY', difficulty: 'EASY',
        question: 'Di mana posisi GROUNDING/pembumian yang benar pada sistem PLTS?',
        optionA: 'Hanya di panel surya', optionB: 'Hanya di inverter',
        optionC: 'Panel, mounting, inverter, dan panel distribusi AC', optionD: 'Tidak perlu grounding',
        correctAnswer: 'C',
        explanation: 'Grounding wajib dipasang di seluruh komponen metalik: frame panel, struktur mounting, body inverter, hingga panel distribusi AC untuk proteksi petir dan kebocoran arus.'
      },

      // ===== TROUBLESHOOTING =====
      {
        category: 'TROUBLESHOOTING', difficulty: 'EASY',
        question: 'Panel surya output 30% lebih rendah dari normal. Penyebab paling umum?',
        optionA: 'Inverter rusak', optionB: 'Panel kotor/berdebu',
        optionC: 'Kabel putus', optionD: 'Grounding tidak proper',
        correctAnswer: 'B',
        explanation: 'Debu dan kotoran adalah penyebab #1 penurunan gradual. Pembersihan rutin dapat mengembalikan performa hingga 98% output nominal.'
      },
      {
        category: 'TROUBLESHOOTING', difficulty: 'MEDIUM',
        question: 'Inverter menampilkan error "Grid Overvoltage". Apa yang menyebabkan ini?',
        optionA: 'Panel terlalu banyak', optionB: 'Tegangan jaringan PLN terlalu tinggi melebihi batas yang bisa diterima inverter',
        optionC: 'Kabel DC bermasalah', optionD: 'Baterai penuh',
        correctAnswer: 'B',
        explanation: 'Grid Overvoltage terjadi ketika tegangan jaringan PLN melebihi batas setting inverter (umumnya >253V untuk 230V nominal). Inverter disconnect otomatis sebagai proteksi.'
      },
      {
        category: 'TROUBLESHOOTING', difficulty: 'MEDIUM',
        question: 'Insulation Resistance pada string panel menunjukkan nilai 80kΩ. Apa kesimpulannya?',
        optionA: 'Normal, tidak perlu tindakan', optionB: 'Nilai kritis, isolasi kabel atau panel kemungkinan rusak',
        optionC: 'Nilai sangat bagus', optionD: 'Perlu ganti inverter',
        correctAnswer: 'B',
        explanation: 'IR 80kΩ jauh di bawah standar minimum 1 MΩ. Ini indikasi kerusakan isolasi kabel DC, koneksi basah, atau panel pecah yang wajib ditemukan dan diperbaiki segera.'
      },
      {
        category: 'TROUBLESHOOTING', difficulty: 'HARD',
        question: 'Satu string dari 3 string pada inverter menghasilkan arus 30% lebih rendah. Langkah diagnosa pertama?',
        optionA: 'Langsung ganti panel', optionB: 'Reset inverter',
        optionC: 'Ukur Voc dan Isc setiap panel dalam string tersebut untuk menemukan panel bermasalah',
        optionD: 'Tambah string baru',
        correctAnswer: 'C',
        explanation: 'Diagnosa sistematis: ukur Voc dan Isc panel satu-per-satu dalam string. Panel rusak akan menunjukkan nilai menyimpang. Ini lebih efisien daripada langsung mengganti semua panel.'
      },
      {
        category: 'TROUBLESHOOTING', difficulty: 'EASY',
        question: 'Inverter menampilkan "PV Isolation Low". Apa yang harus dilakukan?',
        optionA: 'Abaikan, itu normal', optionB: 'Matikan sistem dan cek isolasi kabel DC dengan insulation tester',
        optionC: 'Restart inverter saja', optionD: 'Tambah grounding',
        correctAnswer: 'B',
        explanation: 'PV Isolation Low adalah alarm kritis. Matikan sistem segera, ukur IR kabel DC ke ground. Jika <1MΩ, temukan titik kebocoran sebelum sistem dioperasikan kembali.'
      },

      // ===== BISNIS =====
      {
        category: 'BISNIS', difficulty: 'MEDIUM',
        question: 'Berapa payback period tipikal PLTS on-grid residential 2.5 kWp di Indonesia (2026)?',
        optionA: '3-4 tahun', optionB: '4-6 tahun', optionC: '6-9 tahun', optionD: '10-12 tahun',
        correctAnswer: 'C',
        explanation: 'Dengan harga sistem Rp 12-14 juta/kWp dan tarif PLN Rp 1,444/kWh, ROI tipikal adalah 6-9 tahun untuk residential.'
      },
      {
        category: 'BISNIS', difficulty: 'EASY',
        question: 'Apa yang dimaksud dengan skema Net Metering dalam regulasi PLTS On-Grid di Indonesia?',
        optionA: 'Sistem jual beli listrik ke PLN dengan harga pasar', 
        optionB: 'Ekspor surplus listrik ke PLN dikreditkan sebagai pengurang tagihan dengan multiplier tertentu',
        optionC: 'PLN membeli listrik dari pelanggan dengan harga penuh', 
        optionD: 'Sistem baterai cadangan dari PLN',
        correctAnswer: 'B',
        explanation: 'Net Metering: surplus ekspor ke PLN dikreditkan sebagai pengurang tagihan dengan faktor ekspor-impor (sesuai Permen ESDM, saat ini 1:0.65 - tiap 1 kWh ekspor = kredit 0.65 kWh).'
      },
      {
        category: 'BISNIS', difficulty: 'MEDIUM',
        question: 'Klien meminta proposal untuk sistem 10 kWp on-grid. Berapa estimasi biaya investasi awal yang paling realistis (2026)?',
        optionA: 'Rp 50-80 juta', optionB: 'Rp 100-150 juta', optionC: 'Rp 150-200 juta', optionD: 'Rp200-300 juta',
        correctAnswer: 'B',
        explanation: 'Harga pasar PLTS on-grid 2026 berkisar Rp 10-15 juta/kWp sudah termasuk panel, inverter, mounting, kabel, dan jasa. Untuk 10 kWp: Rp 100-150 juta.'
      },
      {
        category: 'BISNIS', difficulty: 'HARD',
        question: 'Kapasitas PLTS yang tepat untuk pelanggan dengan tagihan PLN rata-rata Rp 800.000/bulan, tarif R2 Rp 1.444/kWh, dan atap selatan 30m²?',
        optionA: '1 kWp', optionB: '2 kWp', optionC: '3 kWp', optionD: '5 kWp',
        correctAnswer: 'B',
        explanation: 'Konsumsi: 800.000/1.444 ≈ 554 kWh/bulan. Target 70-80% dari solar: ±400 kWh/bulan. Kapasitas = 400/(4.5 PSH x 30 hari) ≈ 2.96 kWp. Tapi 30m² hanya muat ≈ 8-10 panel (±4-5 kWp), pilih 2 kWp sesuai anggaran.'
      },
      {
        category: 'BISNIS', difficulty: 'EASY',
        question: 'Dokumen apa yang wajib disiapkan sebelum instalasi PLTS On-Grid untuk perumahan di Indonesia?',
        optionA: 'Hanya kontrak dengan pelanggan', 
        optionB: 'Permohonan ke PLN (SPPHP) dan Sertifikat Laik Fungsi SLF',
        optionC: 'Hanya izin dari RT/RW setempat', 
        optionD: 'Tidak perlu dokumen apapun',
        correctAnswer: 'B',
        explanation: 'Wajib: (1) Mengajukan SPPHP ke PLN untuk persetujuan ekspor, (2) Memiliki gambar single-line diagram, (3) SLF untuk instalasi listrik. Tanpa persetujuan PLN, ekspor ke grid tidak legal.'
      },
    ]);

    console.log('✅ Database berhasil di-seed dengan data awal');
  }
}
