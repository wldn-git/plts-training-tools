import { 
  Zap, TrendingUp, Battery, Ruler, Layout, 
  Map, Quote, ListChecks, FileText, Wrench, Wallet 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Link } from 'react-router-dom';

const tools = [
  {
    title: 'String Configuration',
    description: 'Cek kecocokan Inverter dan Panel.',
    icon: Zap,
    path: '/calculators/string-config',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  {
    title: 'PV Sizing (Bill)',
    description: 'Estimasi PLTS dari tagihan listrik bulanan.',
    icon: Wallet,
    path: '/calculators/pv-sizing',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50'
  },
  {
    title: 'Kalkulator ROI',
    description: 'Hitung penghematan dan payback period.',
    icon: TrendingUp,
    path: '/calculators/roi',
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  {
    title: 'Sizing Baterai',
    description: 'Kapasitas baterai untuk Off-grid/Hybrid.',
    icon: Battery,
    path: '/calculators/battery-sizing',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50'
  },
  {
    title: 'Ukuran Kabel',
    description: 'Tentukan luas penampang kabel yang aman.',
    icon: Ruler,
    path: '/calculators/cable-sizing',
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  {
    title: 'Layout Mounting',
    description: 'Estimasi luas atap dan susunan panel.',
    icon: Layout,
    path: '/calculators/mounting',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  {
    title: 'Peta PSH',
    description: 'Cek radiasi matahari di wilayah Indonesia.',
    icon: Map,
    path: '/calculators/psh',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50'
  },
  {
    title: 'Quote Generator',
    description: 'Buat penawaran harga cepat (BoM).',
    icon: Quote,
    path: '/calculators/quote',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50'
  },
  {
    title: 'Safety Checklist',
    description: 'Daftar periksa keamanan instalasi.',
    icon: ListChecks,
    path: '/calculators/safety',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50'
  },
  {
    title: 'Profil Beban',
    description: 'Analisa kebutuhan energi harian.',
    icon: FileText,
    path: '/calculators/load-profile',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  },
  {
    title: 'Troubleshooting',
    description: 'Panduan menangani masalah sistem.',
    icon: Wrench,
    path: '/calculators/troubleshooting',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50'
  }
];

export function Calculators() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Toolbox</h1>
        <p className="text-gray-600">
          Kumpulan alat bantu survey, kalkulasi, dan dokumentasi untuk installer PLTS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link key={index} to={tool.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-transparent hover:border-gray-200">
                <CardHeader>
                  <div className={`w-12 h-12 ${tool.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
