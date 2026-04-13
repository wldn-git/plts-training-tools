import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { calculateMountingLayout, type MountingOutput } from '../../lib/calculations/mounting';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Layout, Maximize, Ruler, Info, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export function MountingCalculator() {
  const [panelId, setPanelId] = useState<number | null>(null);
  const [numPanels, setNumPanels] = useState(6);
  const [columns, setColumns] = useState(3);
  const [orientation, setOrientation] = useState<'PORTRAIT' | 'LANDSCAPE'>('PORTRAIT');
  const [gap, setGap] = useState(20); // 20mm standard mid-clamp
  
  const [result, setResult] = useState<MountingOutput | null>(null);

  const panels = useLiveQuery(() => db.solarPanels.toArray());
  const selectedPanel = panels?.find(p => p.id === panelId);

  // Default dimensions if no panel selected
  const pL = selectedPanel?.length || 2279;
  const pW = selectedPanel?.width || 1134;

  useEffect(() => {
    const output = calculateMountingLayout({
      numPanels,
      panelLength: pL,
      panelWidth: pW,
      orientation,
      columns: Math.min(columns, numPanels),
      gapX: gap,
      gapY: gap
    });
    setResult(output);
  }, [numPanels, columns, orientation, gap, pL, pW]);

  const [saved, setSaved] = useState(false);

  const saveLayout = async () => {
    if (!result) return;
    try {
      await db.calculations.add({
        toolType: 'MOUNTING',
        inputs: { numPanels, columns, orientation, gap, panelId },
        outputs: result,
        savedName: `Layout ${numPanels} Panel - ${result.totalArea}m²`,
        createdAt: new Date()
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Layout Mounting & Area</h2>
        <p className="text-gray-600 mt-1">
          Estimasi luas atap atau lahan yang dibutuhkan untuk susunan panel surya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Konfigurasi Array</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Model Panel</Label>
              <Select 
                value={panelId?.toString()}
                onValueChange={(val) => setPanelId(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih panel..." />
                </SelectTrigger>
                <SelectContent>
                  {panels?.map(p => (
                    <SelectItem key={p.id} value={p.id!.toString()}>
                      {p.brand} {p.model} ({p.power}Wp)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah Panel</Label>
              <Input 
                type="number" 
                value={numPanels}
                onChange={(e) => setNumPanels(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Jumlah Kolom</Label>
                <span className="text-sm font-medium">{columns} Kolom</span>
              </div>
              <Slider
                value={[columns]}
                onValueChange={(val) => setColumns(val[0])}
                min={1}
                max={Math.max(numPanels, 1)}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Orientasi</Label>
              <Select 
                value={orientation}
                onValueChange={(val: 'PORTRAIT' | 'LANDSCAPE') => setOrientation(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PORTRAIT">Tegak (Portrait)</SelectItem>
                  <SelectItem value="LANDSCAPE">Mendatar (Landscape)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Jarak Antar Panel (mm)</Label>
                <span className="text-sm font-medium">{gap} mm</span>
              </div>
              <Slider
                value={[gap]}
                onValueChange={(val) => setGap(val[0])}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-[10px] text-gray-500 italic">Umumnya 20mm untuk mid-clamp.</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {result && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-indigo-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <Maximize className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-100">Total Luas Dibutuhkan</p>
                        <p className="text-3xl font-bold">{result.totalArea} m²</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-gray-900 border-2 border-indigo-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                        <Ruler className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Dimensi Array</p>
                        <p className="text-xl font-bold">
                          {(result.totalWidth/1000).toFixed(2)}m x {(result.totalLength/1000).toFixed(2)}m
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layout className="h-4 w-4 text-indigo-600" />
                    Visualisasi Tata Letak ({result.rows} Baris x {columns} Kolom)
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg overflow-auto">
                  <div 
                    className="grid gap-1 bg-white p-4 shadow-sm border border-gray-200"
                    style={{ 
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` 
                    }}
                  >
                    {Array.from({ length: numPanels }).map((_, i) => (
                      <div 
                        key={i}
                        className={`
                          ${orientation === 'PORTRAIT' ? 'w-10 h-16' : 'w-16 h-10'} 
                          bg-gradient-to-br from-blue-900 to-indigo-800 
                          border border-blue-400 rounded-sm flex items-center justify-center
                          relative overflow-hidden
                        `}
                      >
                        {/* Grid lines on panel */}
                        <div className="absolute inset-0 opacity-20 grid grid-cols-4 grid-rows-6">
                          {Array.from({ length: 24 }).map((_, j) => (
                            <div key={j} className="border-[0.5px] border-white"></div>
                          ))}
                        </div>
                        <span className="text-[8px] text-blue-100 font-bold z-10">{i + 1}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-8 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border border-gray-400"></div>
                      <span>Jarak Antar Panel: {gap}mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-3 bg-indigo-200"></div>
                      <span>Total Lebar: {(result.totalWidth/1000).toFixed(2)}m</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <strong>Penting:</strong> Selalu beri ruang bebas (*clearance*) minimal 50cm - 100cm di sekeliling 
                  array panel surya untuk akses pemeliharaan, pembersihan, dan jalur kabel. 
                  Pastikan juga sirkulasi udara di bawah panel terjaga untuk mencegah panas berlebih (*overheating*).
                </div>
              </div>

              <Button
                onClick={saveLayout}
                className={`w-full ${saved ? 'bg-green-600' : 'bg-indigo-600'} transition-colors`}
              >
                {saved ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Layout Tersimpan!</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Simpan Layout ke Riwayat</>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
