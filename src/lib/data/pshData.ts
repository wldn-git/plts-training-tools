export interface PSHProvince {
  province: string;
  avgPsh: number;
  lat: number;
  lng: number;
  cities: { name: string; psh: number }[];
}

export const pshData: PSHProvince[] = [
  {
    province: 'Jawa Barat',
    avgPsh: 4.8,
    lat: -6.9175,
    lng: 107.6191,
    cities: [
      { name: 'Bandung', psh: 4.8 },
      { name: 'Bekasi', psh: 4.7 },
      { name: 'Bogor', psh: 4.6 },
      { name: 'Cirebon', psh: 5.0 }
    ]
  },
  {
    province: 'Jawa Timur',
    avgPsh: 5.2,
    lat: -7.2575,
    lng: 112.7521,
    cities: [
      { name: 'Surabaya', psh: 5.2 },
      { name: 'Malang', psh: 5.0 },
      { name: 'Banyuwangi', psh: 5.4 }
    ]
  },
  {
    province: 'Bali',
    avgPsh: 5.5,
    lat: -8.3405,
    lng: 115.0920,
    cities: [
      { name: 'Denpasar', psh: 5.5 },
      { name: 'Singaraja', psh: 5.6 }
    ]
  },
  {
    province: 'Nusa Tenggara Timur',
    avgPsh: 5.8,
    lat: -8.6573,
    lng: 121.0794,
    cities: [
      { name: 'Kupang', psh: 6.0 },
      { name: 'Maumere', psh: 5.7 }
    ]
  },
  {
    province: 'Sulawesi Selatan',
    avgPsh: 5.4,
    lat: -5.1476,
    lng: 119.4327,
    cities: [
      { name: 'Makassar', psh: 5.4 },
      { name: 'Parepare', psh: 5.5 }
    ]
  },
  {
    province: 'Jakarta',
    avgPsh: 4.5,
    lat: -6.2088,
    lng: 106.8456,
    cities: [
      { name: 'Jakarta Pusat', psh: 4.5 },
      { name: 'Jakarta Utara', psh: 4.6 }
    ]
  }
];
