import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculatePVSizing, type PVSizingInput, type PVSizingOutput } from '../../lib/calculations/pvSizing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Calculator as CalcIcon, Sun, Battery, 
  Ruler, Wallet, Save, FileText, ArrowLeft,
  ArrowRight, TrendingDown, Layers
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';

export function PVSizingCalculator() {
  const navigate = useNavigate();
  const [tagihan, setTagihan] = useState<number | ''>('');
  const [tarif, setTarif] = useState<number>(1699);
  const [selectedPanelId, setSelectedPanelId] = useState<string>('');
  const [hasil, setHasil] = useState<PVSizingOutput | null>(null);

  const solarPanels = useLiveQuery(() => db.solarPanels.toArray()) || [];

  // Set default panel if available
  useEffect(() => {
    if (solarPanels.length > 0 && !selectedPanelId) {
      setSelectedPanelId(solarPanels[0].id!.toString());
    }
  }, [solarPanels]);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tagihan) return;

    const panel = solarPanels.find(p => p.id?.toString() === selectedPanelId);
    if (!panel) return;

    const input: PVSizingInput = {
      billAmount: Number(tagihan),
      tariff: tarif,
      panelWp: panel.power,
      panelPrice: panel.price
    };

    const result = calculatePVSizing(input);
    setHasil(result);
  };

  // Re-calculate when tariff changes if bill already exists
  useEffect(() => {
    if (tagihan) handleCalculate();
  }, [tarif]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tools')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kalkulator PV Sizing</h2>
          <p className="text-gray-600">
            Estimasi kebutuhan sistem PLTS berdasarkan tagihan listrik bulanan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Card */}
        <Card className="lg:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CalcIcon size={20} />
              </div>
              <CardTitle className="text-lg">Parameter Input</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="tagihan">Rata-rata Tagihan Listrik / Bulan</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-medium">Rp</span>
                  <Input 
                    id="tagihan"
                    type="text" 
                    required
                    className="pl-10 font-medium"
                    placeholder="Contoh: 1.500.000"
                    value={tagihan ? tagihan.toLocaleString('id-ID') : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, '');
                      setTagihan(rawValue ? Number(rawValue) : '');
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tarif Dasar Listrik PLN (Rp/kWh)</Label>
                <Select 
                  value={tarif.toString()}
                  onValueChange={(val) => setTarif(Number(val))}
                >
                  <SelectTrigger className="w-full font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1699">Rp 1.699 (R2/R3/Bisnis)</SelectItem>
                    <SelectItem value="1444">Rp 1.444 (R1 - 1300/2200 VA)</SelectItem>
                    <SelectItem value="1352">Rp 1.352 (R1 - 900 VA Non-Subsidi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pilihan Panel Surya</Label>
                <Select 
                  value={selectedPanelId}
                  onValueChange={setSelectedPanelId}
                >
                  <SelectTrigger className="w-full font-medium">
                    <SelectValue placeholder="Pilih Panel" />
                  </SelectTrigger>
                  <SelectContent>
                    {solarPanels.map(panel => (
                      <SelectItem key={panel.id} value={panel.id!.toString()}>
                        {panel.brand} {panel.model} ({panel.power}Wp)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPanelId && (
                  <p className="text-[10px] text-gray-500 italic px-1">
                    Harga DB: Rp {solarPanels.find(p => p.id?.toString() === selectedPanelId)?.price.toLocaleString('id-ID')} / lembar
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-sm"
              >
                Hitung Kebutuhan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {!hasil ? (
            <Card className="h-full min-h-[400px] border-dashed flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="p-6 bg-gray-50 rounded-full mb-4">
                <CalcIcon size={48} className="text-gray-300" />
              </div>
              <CardTitle className="text-xl text-gray-500 mb-2">Belum Ada Hasil</CardTitle>
              <CardDescription className="max-w-xs mx-auto">
                Masukkan nominal tagihan listrik Anda di samping untuk melihat rekomendasi kapasitas PLTS.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Rekomendasi Sistem On-Grid</CardTitle>
                    <CardDescription>Berdasarkan kebutuhan energi harian Anda</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="hidden sm:flex border-green-200 text-green-700 hover:bg-green-50">
                    <FileText className="h-4 w-4 mr-2" /> Simpan PDF
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kapasitas */}
                    <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Sun size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Kapasitas Sistem</p>
                        <p className="text-2xl font-black text-gray-900">
                          {hasil.actualKwp.toLocaleString('id-ID')} <span className="text-lg text-gray-400 font-normal">kWp</span>
                        </p>
                      </div>
                    </div>

                    {/* Panel */}
                    <div className="p-4 border border-amber-100 bg-amber-50/50 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                        <Battery size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Panel Surya</p>
                        <p className="text-2xl font-black text-gray-900">
                          {hasil.numPanels} <span className="text-lg text-gray-400 font-normal">Modul</span>
                        </p>
                        <p className="text-[10px] text-amber-700 mt-1 font-medium italic">
                          Asumsi Panel {solarPanels.find(p => p.id?.toString() === selectedPanelId)?.power || 450} Wp
                        </p>
                      </div>
                    </div>

                    {/* Atap */}
                    <div className="p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow">
                      <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Ruler size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Kebutuhan Luas Atap</p>
                        <p className="text-2xl font-black text-gray-900">
                          {hasil.roofArea.toLocaleString('id-ID')} <span className="text-lg text-gray-400 font-normal">m²</span>
                        </p>
                      </div>
                    </div>

                    {/* Investasi */}
                    <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow relative overflow-hidden">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Wallet size={24} />
                      </div>
                      <div className="z-10">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Estimasi Investasi</p>
                        <p className="text-2xl font-black text-gray-900">
                          Rp {Math.round(hasil.estimatedCost).toLocaleString('id-ID')}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <div className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                            Rp {hasil.pricePerKwp.toLocaleString('id-ID')} / kWp
                          </div>
                          <div className="text-[9px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                             Sistem All-in
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Hemat / Bulan</p>
                        <p className="text-sm font-bold text-green-600">± Rp {Math.round(hasil.monthlySaving).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                      <Layers className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Biaya Panel Saja</p>
                        <p className="text-sm font-bold text-blue-600">
                          Rp {(hasil.numPanels * (solarPanels.find(p => p.id?.toString() === selectedPanelId)?.price || 0)).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end items-center gap-2">
                    <p className="text-[10px] text-gray-400 italic">Analisa ROI untuk hitungan payback period lebih detil</p>
                    <Button 
                      onClick={() => navigate('/calculators/roi', { 
                        state: { 
                          investment: hasil.estimatedCost,
                          capacity: hasil.actualKwp,
                          tariff: tarif
                        }
                      })}
                      variant="link" 
                      className="text-blue-600 text-xs font-bold group p-0 h-auto"
                    >
                      Analisa ROI <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  
                  <div className="mt-8 flex gap-3">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                      onClick={() => navigate('/projects', { state: { autoCapacity: hasil.actualKwp } })}
                    >
                      <Save className="h-4 w-4 mr-2" /> Simpan sebagai Proyek
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
