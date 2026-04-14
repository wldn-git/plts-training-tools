import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Sun, Zap, Battery, Shield, 
  Settings, PenTool, Lightbulb, TrendingUp,
  CheckCircle2, ArrowRight, HelpCircle 
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
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('plts_completed_modules');
    if (saved) setCompletedModules(JSON.parse(saved));
  }, []);

  const markAsComplete = (title: string) => {
    if (!completedModules.includes(title)) {
      const updated = [...completedModules, title];
      setCompletedModules(updated);
      localStorage.setItem('plts_completed_modules', JSON.stringify(updated));
    }
    setSelectedModule(null);
  };

  const progress = Math.round((completedModules.length / 8) * 100);

  const moduleContent: Record<string, any> = {
    'Pengenalan Sistem PLTS': {
      content: (
        <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
          <p>Sistem Pembangkit Listrik Tenaga Surya (PLTS) adalah teknologi yang mengubah energi foton dari cahaya matahari menjadi energi listrik menggunakan efek fotovoltaik.</p>
          <div className="bg-blue-50 p-6 rounded-2xl border-l-8 border-blue-600">
            <h4 className="font-black text-blue-900 mb-2">Prinsip Kerja Dasar:</h4>
            <ol className="list-decimal ml-5 space-y-3 text-blue-800 font-medium">
              <li>Matahari menyinari sel fotovoltaik (PV).</li>
              <li>Energi cahaya memicu aliran elektron di dalam sel.</li>
              <li>Arus Searah (DC) dihasilkan dan mengalir melalui kabel.</li>
              <li>Inverter mengubah DC menjadi Arus Bolak-balik (AC) untuk kebutuhan harian.</li>
            </ol>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-8 italic underline decoration-blue-400">Arus DC vs AC dalam PLTS</h3>
          <p>Penting untuk diingat bahwa Panel Surya dan Baterai selalu bekerja pada arus **DC**. Namun, karena jaringan grid PLN dan alat elektronik rumah tangga menggunakan **AC**, maka peran Inverter menjadi jantung dari setiap sistem PLTS.</p>
        </div>
      )
    },
    'On-Grid vs Off-Grid vs Hybrid': {
      content: (
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Memilih tipe sistem yang tepat adalah langkah paling krusial dalam survey lokasi. Berikut adalah ringkasan teknisnya:</p>
          <div className="space-y-4">
            <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100">
              <h4 className="font-black text-blue-900 border-b border-blue-200 pb-2 mb-3">1. Sistem On-Grid (Grid-Tied)</h4>
              <p className="text-sm">Sistem ini paling ekonomis. Tanpa baterai, kelebihan listrik "dijual" ke PLN melalui meteran EXIM. Jika PLN mati, PLTS juga mati sebagai fitur keamanan (Anti-Islanding).</p>
            </div>
            <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-100">
              <h4 className="font-black text-amber-900 border-b border-amber-200 pb-2 mb-3">2. Sistem Off-Grid (Stand-Alone)</h4>
              <p className="text-sm">Mandiri sepenuhnya. Membutuhkan bank baterai yang besar untuk mencukupi beban saat malam hari atau cuaca mendung (Autonomy Days). Cocok untuk daerah remote.</p>
            </div>
            <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100">
              <h4 className="font-black text-emerald-900 border-b border-emerald-200 pb-2 mb-3">3. Sistem Hybrid</h4>
              <p className="text-sm">Solusi terbaik. Bisa ekspor ke PLN namun punya baterai cadangan. Listrik aman meskipun jaringan PLN sedang gangguan.</p>
            </div>
          </div>
        </div>
      )
    },
    'Memahami Panel Surya (PV)': {
      content: (
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Setiap panel surya memiliki datasheet teknis. Berikut parameter yang wajib Anda kuasai sebagai installer:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0">
            <li className="p-4 bg-gray-50 rounded-xl border"><strong>Voc (Voltage Open Circuit):</strong> Tegangan maksimum saat tidak ada beban. PENTING untuk proteksi ke Inverter.</li>
            <li className="p-4 bg-gray-50 rounded-xl border"><strong>Vmp (Voltage Max Power):</strong> Tegangan ideal saat sistem bekerja menghasilkan daya tertinggi.</li>
            <li className="p-4 bg-gray-50 rounded-xl border"><strong>Isc (Short Circuit Current):</strong> Arus maksimum saat kabel (+/-) dihubung singkat.</li>
            <li className="p-4 bg-gray-50 rounded-xl border"><strong>Pmax (Watt Peak):</strong> Kapasitas daya nominal panel (misal: 450Wp, 550Wp).</li>
          </ul>
        </div>
      )
    },
    'Teknologi Baterai': {
      content: (
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>Saat ini ada dua raksasa teknologi baterai di dunia PLTS:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-red-50 rounded-2xl border">
              <h4 className="font-bold text-red-900 mb-2">Lead-Acid (Aki)</h4>
              <ul className="text-xs space-y-2 list-disc ml-4">
                <li>Harga murah (VRLA/Gel/OPzV).</li>
                <li>DoD terbatas (Saran 50%).</li>
                <li>Umur siklus pendek (2-5 tahun).</li>
                <li>Berat dan butuh ruang besar.</li>
              </ul>
            </div>
            <div className="p-5 bg-green-50 rounded-2xl border">
              <h4 className="font-bold text-green-900 mb-2">Lithium (LiFePO4)</h4>
              <ul className="text-xs space-y-2 list-disc ml-4">
                <li>Investasi awal mahal.</li>
                <li>DoD tinggi (Hingga 80%-90%).</li>
                <li>Umur siklus lama (10-15 tahun).</li>
                <li>Ringkas dan cerdas (Pakai BMS).</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    'Standar Proteksi & Grounding': {
      content: (
        <p>Keselamatan adalah prioritas #1. Sistem PLTS wajib dilengkapi dengan **SPD (Surge Protective Device)** untuk petir, **MCB DC** untuk pemutus arus, dan sistem **Grounding** dengan nilai resistansi di bawah 5 Ohm.</p>
      )
    },
    'Manajemen String & Inverter': {
      content: (
        <p>Gunakan kalkulator **String Config** kami untuk memastikan jumlah panel Anda tidak melampaui tegangan VOC maksimum Inverter pada suhu terdingin di lokasi.</p>
      )
    },
    'Troubleshooting Umum': {
      content: (
        <p>Masalah paling sering adalah **Shading** (bayangan) yang menutupi satu sel tapi merusak performa satu string. Pastikan tidak ada bayangan pohon atau bangunan di atas panel surya.</p>
      )
    },
    'Analisa Ekonomi PLTS': {
      content: (
        <p>PLTS bukan biaya, tapi investasi. Secara rata-rata di Indonesia, payback period (BEP) PLTS On-Grid berkisar antara **5 hingga 8 tahun**, dengan masa manfaat aset hingga 25 tahun.</p>
      )
    }
  };

  if (selectedModule) {
    const isCompleted = completedModules.includes(selectedModule.title);
    const content = moduleContent[selectedModule.title] || { content: <p>Sedang disusun...</p> };

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <button 
          onClick={() => setSelectedModule(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Kembali ke Menu
        </button>

        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className={`h-3 w-full ${selectedModule.bg.replace('bg-', 'bg-')}`}></div>
          <CardHeader className="bg-white p-8 md:p-12 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-200">{selectedModule.category}</Badge>
                  {isCompleted && <Badge className="bg-green-500 hover:bg-green-600">SELESAI</Badge>}
                </div>
                <CardTitle className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                  {selectedModule.title}
                </CardTitle>
              </div>
              <div className={`p-6 rounded-3xl ${selectedModule.bg} shadow-inner`}>
                <selectedModule.icon className={`h-12 w-12 ${selectedModule.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-white p-8 md:p-12 pt-0">
            <div className="prose prose-blue max-w-none min-h-[300px]">
              {content.content}
            </div>
            
            <div className="mt-12 pt-10 border-t flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50 -mx-12 -mb-12 p-12">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-500 font-medium tracking-tight">Klik tombol di samping untuk mencatat progres Anda.</p>
              </div>
              <button 
                onClick={() => markAsComplete(selectedModule.title)}
                className="w-full md:w-auto bg-blue-600 text-white px-12 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
              >
                {isCompleted ? 'Selesai & Keluar' : 'Tandai Selesai'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 italic">
            <BookOpen className="h-8 w-8 text-blue-600 not-italic" />
            Learning Center
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl font-medium">
            Tingkatkan skill teknis Anda. Pelajari setiap modul untuk membuka sertifikasi internal.
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border shadow-sm flex items-center gap-4 min-w-[240px]">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={150} strokeDashoffset={150 - (150 * progress) / 100} className="text-blue-600 transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{progress}%</div>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Progress</p>
            <p className="text-lg font-black text-gray-900">{completedModules.length} / 8 <span className="text-xs text-gray-400">Modul</span></p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {modules.map((category) => (
          <div key={category.category} className="space-y-6">
            <h2 className="text-sm font-black text-gray-400 flex items-center gap-3 uppercase tracking-[0.2em]">
              <span className="w-8 h-px bg-gray-200"></span>
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isCompleted = completedModules.includes(item.title);
                return (
                  <Card 
                    key={item.title} 
                    onClick={() => setSelectedModule(item)}
                    className={`
                      group border-2 transition-all cursor-pointer relative overflow-hidden rounded-3xl
                      ${isCompleted ? 'border-green-100 bg-green-50/20' : 'border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:-translate-y-1'}
                    `}
                  >
                    <div className={`absolute -top-4 -right-4 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-all`}>
                      <Icon className="h-32 w-32" />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl ${item.bg} shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <div className="flex gap-2">
                           {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-50" />}
                           <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-tighter">
                            {item.level}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-5">
                        <CardTitle className="text-xl font-black group-hover:text-blue-600 transition-colors tracking-tight">{item.title}</CardTitle>
                        <CardDescription className="mt-2 text-gray-500 font-medium leading-relaxed">
                          {item.desc}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <div className={`text-xs font-black flex items-center gap-2 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                        {isCompleted ? 'ULANGI MATERI' : 'PELAJARI MODUL'}
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Card className="bg-gray-900 text-white rounded-[2rem] overflow-hidden relative border-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32"></div>
        <CardContent className="p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/30">
              Uji Kompetensi
            </div>
            <h3 className="text-3xl md:text-5xl font-black leading-tight">Siap Menghadapi<br/>Tantangan?</h3>
            <p className="text-gray-400 max-w-md font-medium">Uji pemahaman Anda melalui kuis teknis kami dan dapatkan skor terbaik untuk sertifikasi internal PLTS Tools.</p>
          </div>
          <button 
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-4 bg-white text-gray-900 px-10 py-5 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-2xl active:scale-95 group"
          >
            BUKA BANK SOAL
            <Zap className="h-5 w-5 text-blue-600 group-hover:scale-150 transition-transform" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
