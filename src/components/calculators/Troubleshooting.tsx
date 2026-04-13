import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Wrench, AlertCircle, CheckCircle2, Info, ArrowDownRight } from 'lucide-react';

const TROUBLE_DATA = [
  {
    issue: 'Inverter Tidak Menyala (Layar Mati)',
    causes: ['DC Isolator belum ON', 'Polaritas kabel PV terbalik', 'Tegangan string di bawah batas start-up'],
    solution: 'Cek voltase DC string dengan multimeter, pastikan > tegangan start-up inverter (tiap model berbeda).',
    severity: 'HIGH'
  },
  {
    issue: 'Produksi Energi Rendah (Low Yield)',
    causes: ['Panel kotor/berdebu', 'Terjadi shading (bayangan)', 'Gradient panel kurang miring'],
    solution: 'Bersihkan panel dengan air bersih. Cek apakah ada pohon atau bangunan baru yang menutupi panel.',
    severity: 'MEDIUM'
  },
  {
    issue: 'Error "Insulation Resistance Low"',
    causes: ['Kabel DC mengelupas dan menyentuh frame', 'Konektor MC4 kemasukan air', 'Unit inverter lembab'],
    solution: 'Cek resistansi isolasi setiap string. Cari kabel yang tergores atau konektor yang tidak kedap air.',
    severity: 'HIGH'
  },
  {
    issue: 'Grid Out of Range (AC Error)',
    causes: ['Tegangan PLN terlalu tinggi (>253V)', 'Frekuensi PLN tidak stabil', 'Kabel AC terlalu kecil'],
    solution: 'Ukur tegangan AC di terminal inverter. Jika >253V secara konsisten, laporkan ke PLN atau gunakan stabilizer.',
    severity: 'MEDIUM'
  }
];

export function Troubleshooting() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = TROUBLE_DATA.filter(t => 
    t.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.solution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Troubleshooting Guide</h2>
        <p className="text-gray-600 mt-1">Panduan praktis menangani masalah umum pada sistem PLTS.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Cari gejala atau masalah..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item, i) => (
          <Card key={i} className="hover:border-blue-200 transition-colors shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge variant={item.severity === 'HIGH' ? 'destructive' : 'secondary'}>
                  {item.severity} Priority
                </Badge>
                <div className="bg-blue-50 p-2 rounded-full">
                  <Wrench className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">{item.issue}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Penyebab Umum:</div>
                <div className="space-y-1">
                  {item.causes.map((c, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <AlertCircle className="h-3 w-3 text-red-400" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 text-green-800 font-bold text-xs mb-2">
                  <CheckCircle2 className="h-3 w-3" />
                  SOLUSI DIREKOMENDASIKAN:
                </div>
                <p className="text-sm text-green-700 leading-relaxed italic">
                  "{item.solution}"
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-900 text-white overflow-hidden">
        <CardContent className="p-0">
          <div className="p-8 md:flex items-center justify-between gap-8">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                Masih butuh bantuan?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Jika masalah belum teratasi setelah mengikuti panduan ini, jangan lakukan pembongkaran paksa. 
                Hubungi teknisi bersertifikat atau *After Sales Service* dari brand inverter Anda.
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 mt-6 md:mt-0 whitespace-nowrap">
              Hubungi Technical Support <ArrowDownRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
