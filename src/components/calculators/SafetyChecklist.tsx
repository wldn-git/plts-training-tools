import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle2, ShieldAlert, AlertTriangle, ListChecks, Info } from 'lucide-react';

const SAFETY_CATEGORIES = [
  {
    title: 'Keamanan Personel (PPE)',
    items: [
      'Memakai helm safety (Hard Hat)',
      'Memakai sepatu safety (Insulated)',
      'Memakai rompi reflektif (High-viz)',
      'Memakai sarung tangan tahan tegangan (Insulated Gloves)',
      'Menggunakan tali pengaman/harness (untuk kerja di ketinggian)'
    ]
  },
  {
    title: 'Keamanan Listrik DC',
    items: [
      'Gunakan tang MC4 yang tepat untuk crimping',
      'Pastikan tidak ada konektor MC4 yang terbuka di bawah hujan',
      'Jangan memutus konektor MC4 saat sedang berbeban (Arcing hazard)',
      'Labeling kabel DC (Positif & Negatif) jelas',
      'Pemasangan Surge Protection Device (SPD) DC terpasang'
    ]
  },
  {
    title: 'Pemasangan Struktur & Panel',
    items: [
      'Pastikan atap mampu menahan beban panel (Dead load)',
      'Bracket/Rel terpasang kencang ke struktur rangka atap',
      'Jarak antar panel (gap) minimal 20mm',
      'Tidak ada bayangan (*shading*) permanen pada panel',
      'Grounding frame panel surya terhubung'
    ]
  }
];

export function SafetyChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const totalItems = SAFETY_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedItems = Object.values(checkedItems).filter(v => v).length;
  const progress = (completedItems / totalItems) * 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Safety Checklist</h2>
          <p className="text-gray-600 mt-1">Daftar periksa keamanan instalasi PLTS di lapangan.</p>
        </div>
        <div className="text-right">
          <Badge variant={progress === 100 ? "default" : "secondary"} className={progress === 100 ? "bg-green-600" : ""}>
            Progress: {Math.round(progress)}%
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="h-3 bg-gray-100" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {SAFETY_CATEGORIES.map((cat) => (
            <Card key={cat.title}>
              <CardHeader className="bg-gray-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-blue-600" />
                  {cat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {cat.items.map((item) => (
                  <label 
                    key={item} 
                    className={`
                      flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                      ${checkedItems[item] ? 'bg-green-50 text-green-900' : 'hover:bg-gray-50 text-gray-700'}
                    `}
                  >
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={!!checkedItems[item]}
                      onChange={() => toggleItem(item)}
                    />
                    <span className="text-sm font-medium">{item}</span>
                    {checkedItems[item] && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <ShieldAlert className="h-6 w-6" />
                DANGER: Arc Flash Hazard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-red-700 space-y-3">
              <p>
                Sistem DC PLTS dapat menghasilkan busur api (*arc*) yang sangat panas jika diputus saat beban penuh. 
                <strong> JANGAN PERNAH</strong> mencabut konektor MC4 atau membuka DC disconnector tanpa memastikan inverter sudah dalam posisi OFF.
              </p>
              <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg border border-red-100">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold">Selalu gunakan tang amperemeter DC untuk memastikan tidak ada arus mengalir sebelum melakukan intervensi kabel.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Standard Operasional (SOP)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-4">
              <div className="border-l-2 border-blue-200 pl-3">
                <p className="font-bold text-gray-900">1. Persiapan</p>
                <p>Cek cuaca, pastikan tidak mendung gelap atau badai sebelum naik ke atap.</p>
              </div>
              <div className="border-l-2 border-blue-200 pl-3">
                <p className="font-bold text-gray-900">2. Pemasangan DC</p>
                <p>Selalu pasang kabel dari sisi panel ke arah inverter, pastikan breaker OFF.</p>
              </div>
              <div className="border-l-2 border-green-200 pl-3">
                <p className="font-bold text-gray-900">3. Commissioning</p>
                <p>Ukur tegangan Voc setiap string dan samakan dengan desain sebelum connect ke inverter.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
