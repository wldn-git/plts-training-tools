import { 
  BookOpen, Sun, Zap, Battery, Shield, 
  Settings, PenTool, Lightbulb, TrendingUp 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const modules = [
  {
    category: 'Dasar-Dasar',
    items: [
      {
        title: 'Pengenalan Sistem PLTS',
        desc: 'Memahami cara kerja konversi energi matahari menjadi listrik AC/DC.',
        icon: Sun,
        level: 'Pemula',
        color: 'text-amber-500',
        bg: 'bg-amber-50'
      },
      {
        title: 'On-Grid vs Off-Grid vs Hybrid',
        desc: 'Perbedaan mendasar, kelebihan, dan skenario penggunaan terbaik.',
        icon: Zap,
        level: 'Pemula',
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      }
    ]
  },
  {
    category: 'Komponen & Spesifikasi',
    items: [
      {
        title: 'Memahami Panel Surya (PV)',
        desc: 'Membaca datasheet: Voc, Isc, Vmp, Imp, dan koefisien suhu.',
        icon: Lightbulb,
        level: 'Menengah',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50'
      },
      {
        title: 'Teknologi Baterai',
        desc: 'Perbandingan Lead-Acid vs Lithium (LiFePO4) dan manajemen DoD.',
        icon: Battery,
        level: 'Menengah',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50'
      }
    ]
  },
  {
    category: 'Instalasi & Safety',
    items: [
      {
        title: 'Standar Proteksi & Grounding',
        desc: 'Pentingnya SPD, Fuse, dan sistem pentanahan untuk keamanan aset.',
        icon: Shield,
        level: 'Lanjutan',
        color: 'text-red-500',
        bg: 'bg-red-50'
      },
      {
        title: 'Manajemen String & Inverter',
        desc: 'Cara menghitung string agar sesuai dengan range MPPT Inverter.',
        icon: Settings,
        level: 'Lanjutan',
        color: 'text-purple-500',
        bg: 'bg-purple-50'
      }
    ]
  },
  {
    category: 'Pemeliharaan',
    items: [
      {
        title: 'Troubleshooting Umum',
        desc: 'Identifikasi masalah: Degradasi, shading, dan kegagalan isolasi.',
        icon: PenTool,
        level: 'Menengah',
        color: 'text-orange-500',
        bg: 'bg-orange-50'
      },
      {
        title: 'Analisa Ekonomi PLTS',
        desc: 'Cara menghitung LCOE (Levelized Cost of Energy) dan penghematan.',
        icon: TrendingUp,
        level: 'Lanjutan',
        color: 'text-indigo-500',
        bg: 'bg-indigo-50'
      }
    ]
  }
];

export function LearningMaterials() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Learning Center
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Perdalam pengetahuan teknis Anda tentang PLTS melalui modul edukasi interaktif kami. 
            Mulai dari dasar hingga tingkat lanjut.
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-blue-600 uppercase">Status Belajar</p>
            <p className="text-sm font-black text-blue-900">0 / 8 Modul Selesai</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 flex items-center justify-center text-[10px] font-bold">
            0%
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {modules.map((category) => (
          <div key={category.category} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="hover:shadow-xl transition-all cursor-pointer group border-gray-100 border-2 overflow-hidden relative">
                    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform`}>
                      <Icon className="h-20 w-20" />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl ${item.bg}`}>
                          <Icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <Badge variant="secondary" className="font-bold text-[10px] uppercase">
                          {item.level}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{item.title}</CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {item.desc}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <button className="text-sm font-bold text-blue-600 flex items-center gap-2 group-hover:gap-3 transition-all">
                        Pelajari Modul
                        <span className="text-lg">→</span>
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Quiz CTA */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none shadow-2xl">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">Siap Menguji Kemampuan?</h3>
            <p className="text-blue-100">Setelah membaca materi, tantang diri Anda dengan quiz interaktif kami.</p>
          </div>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap">
            Buka Bank Soal
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
