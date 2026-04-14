import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { calculateBatterySizing, type BatterySizingOutput } from '../../lib/calculations/batterySizing';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Battery, Zap, Calendar, Info, Save } from 'lucide-react';
import { SaveToProjectDialog } from '../ui/save-to-project-dialog';

export function BatterySizingCalculator() {
  const [dailyLoad, setDailyLoad] = useState(2000); // 2kWh
  const [autonomy, setAutonomy] = useState(1);
  const [dod, setDod] = useState(80);
  const [systemVoltage, setSystemVoltage] = useState(24);
  const [selectedBatteryId, setSelectedBatteryId] = useState<number | null>(null);
  const [result, setResult] = useState<BatterySizingOutput | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const batteries = useLiveQuery(() => db.batteries.toArray());
  const selectedBattery = batteries?.find(b => b.id === selectedBatteryId);

  useEffect(() => {
    if (selectedBattery) {
      const output = calculateBatterySizing({
        dailyLoad,
        autonomyDays: autonomy,
        dod,
        systemVoltage,
        batteryVoltage: selectedBattery.voltage,
        batteryCapacityAh: selectedBattery.capacityAh
      });
      setResult(output);
    }
  }, [dailyLoad, autonomy, dod, systemVoltage, selectedBattery]);

  const saveToPortfolio = async () => {
    setShowSaveDialog(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kalkulator Kapasitas Baterai</h2>
        <p className="text-gray-600 mt-1">
          Tentukan kebutuhan kapasitas penyimpanan energi untuk sistem Off-grid/Hybrid.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parameter Kebutuhan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Beban Harian (Wh)</Label>
              <Input 
                type="number" 
                value={dailyLoad}
                onChange={(e) => setDailyLoad(parseInt(e.target.value))}
              />
              <p className="text-[10px] text-gray-500 italic">Contoh: 2000Wh = 2kWh per hari</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Otonomi (Hari Tanpa Matahari)</Label>
                <span className="text-sm font-medium">{autonomy} Hari</span>
              </div>
              <Slider
                value={[autonomy]}
                onValueChange={(val: number[]) => setAutonomy(val[0])}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Tegangan Sistem (Nominal)</Label>
              <Select 
                value={systemVoltage.toString()}
                onValueChange={(val: string) => setSystemVoltage(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Volt (System Kecil)</SelectItem>
                  <SelectItem value="24">24 Volt (Standard)</SelectItem>
                  <SelectItem value="48">48 Volt (System Besar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pilih Model Baterai</Label>
              <Select 
                value={selectedBatteryId?.toString()}
                onValueChange={(val: string) => setSelectedBatteryId(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih baterai..." />
                </SelectTrigger>
                <SelectContent>
                  {batteries?.map(b => (
                    <SelectItem key={b.id} value={b.id!.toString()}>
                      {b.brand} {b.model} ({b.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBattery && (
              <div className="p-3 bg-blue-50 rounded-lg text-xs space-y-1">
                <div className="font-bold text-blue-800">Spesifikasi Baterai:</div>
                <div className="flex justify-between">
                  <span>Tegangan:</span> <span>{selectedBattery.voltage}V</span>
                </div>
                <div className="flex justify-between">
                  <span>Kapasitas:</span> <span>{selectedBattery.capacityAh}Ah ({selectedBattery.capacityKwh}kWh)</span>
                </div>
                <div className="flex justify-between">
                  <span>Saran DoD:</span> <span>{selectedBattery.dod}%</span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between">
                <Label className="flex items-center gap-1">
                  Desain DoD (Limit Aman)
                  <Info className="h-3 w-3 text-gray-400" />
                </Label>
                <span className="text-sm font-medium">{dod}%</span>
              </div>
              <Slider
                value={[dod]}
                onValueChange={(val: number[]) => setDod(val[0])}
                min={10}
                max={95}
                step={5}
              />
              <p className="text-[10px] text-gray-400 italic">
                Semakin rendah DoD, semakin awet baterai tapi butuh jumlah lebih banyak.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <Battery className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">Total Baterai Dibutuhkan</p>
                        <p className="text-3xl font-bold">{result.totalBatteries} Unit</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-gray-900 border-2 border-green-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kapasitas Minimum (Target)</p>
                        <p className="text-2xl font-bold">{result.totalCapacityAh} Ah</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Batas Aman {dod}% DoD</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Analisa Konfigurasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex flex-wrap justify-center gap-4 w-full">
                      {result.numSeries > 1 && (
                        <div className="flex-1 min-w-[120px] text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-bold">Susunan Seri</div>
                          <div className="text-xl font-black text-blue-600">{result.numSeries} Unit <span className="text-xs font-normal text-gray-400">/ String</span></div>
                        </div>
                      )}
                      {result.numParallel > 1 && (
                        <div className="flex-1 min-w-[120px] text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="text-gray-500 text-[10px] mb-1 uppercase tracking-wider font-bold">Jumlah Paralel</div>
                          <div className="text-xl font-black text-blue-600">{result.numParallel} String</div>
                        </div>
                      )}
                      
                      <div className={`flex-1 min-w-[140px] text-center p-4 rounded-xl border shadow-sm ${result.actualDoD > dod ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className={`text-[10px] mb-1 uppercase tracking-widest font-black ${result.actualDoD > dod ? 'text-red-600' : 'text-green-600'}`}>Beban Baterai (Actual DoD)</div>
                        <div className={`text-2xl font-black ${result.actualDoD > dod ? 'text-red-700' : 'text-green-700'}`}>{result.actualDoD}%</div>
                      </div>
                    </div>

                    {/* Human Readable Summary */}
                    <div className="bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-in zoom-in-95">
                      {result.numSeries > 1 && result.numParallel > 1 ? (
                        `Kombinasi: ${result.numSeries} Seri × ${result.numParallel} Paralel`
                      ) : result.numSeries > 1 ? (
                        `Hubungkan secara SERI (${result.numSeries} Unit)`
                      ) : result.numParallel > 1 ? (
                        `Hubungkan secara PARALEL (${result.numParallel} Unit)`
                      ) : (
                        `Pakai 1 Unit Baterai (Tunggal)`
                      )}
                    </div>
                  </div>

                  {/* Visual Diagram */}
                  <div className="border border-dashed p-8 rounded-xl bg-gray-50/50">
                    <div className="text-sm font-bold mb-6 text-center text-gray-700 uppercase tracking-widest">Skematik Pengawatan (Wiring)</div>
                    
                    <div className="relative flex flex-wrap justify-center gap-12 pt-10 pb-6">
                      {/* Negative Busbar Line */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-blue-500 rounded-full">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-600">BUSBAR NEGATIF (-)</div>
                      </div>

                      {Array.from({ length: result.numParallel }).map((_, p) => (
                        <div key={p} className="relative flex flex-col gap-4">
                          {Array.from({ length: result.numSeries }).map((_, s) => (
                            <div key={s} className="relative group">
                              <div className={`
                                w-24 h-32 bg-white border-2 rounded-xl relative shadow-md flex flex-col items-center justify-center transition-all
                                ${result.actualDoD > dod ? 'border-red-300 shadow-red-100' : 'border-blue-500 shadow-blue-100'}
                              `}>
                                {/* Terminals */}
                                <div className="absolute -top-2 left-5 w-5 h-4 bg-blue-600 rounded-sm shadow-sm flex items-center justify-center text-[8px] text-white font-bold">-</div>
                                <div className="absolute -top-2 right-5 w-5 h-4 bg-red-600 rounded-sm shadow-sm flex items-center justify-center text-[8px] text-white font-bold">+</div>
                                
                                <Battery className={`h-12 w-12 ${result.actualDoD > dod ? 'text-red-400' : 'text-blue-500'}`} />
                                <div className="text-[10px] font-bold mt-2 text-gray-400">UNIT {s + 1}</div>

                                {/* Connection to Negative Busbar (only for the first/top terminal in string) */}
                                {s === 0 && (
                                  <div className="absolute -top-10 left-7.5 w-0.5 h-10 bg-blue-500">
                                    <div className="absolute top-0 w-1.5 h-1.5 bg-blue-500 rounded-full -translate-x-1/2 left-1/2"></div>
                                  </div>
                                )}

                                {/* Connection to Positive Busbar (only for the last/bottom terminal in string) */}
                                {s === result.numSeries - 1 && (
                                  <>
                                    {/* Wire that goes from top terminal to bottom busbar */}
                                    <div className="absolute -top-2 right-7.5 w-0.5 h-[calc(100%+40px)] bg-red-500 -z-10 translate-y-0"></div>
                                    <div className="absolute -bottom-10 right-7.5 w-0.5 h-10 bg-red-500">
                                       <div className="absolute bottom-0 w-1.5 h-1.5 bg-red-500 rounded-full -translate-x-1/2 left-1/2"></div>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Series Connection Wire (Jumper) */}
                              {s < result.numSeries - 1 && (
                                <div className="h-6 relative">
                                  {/* Wire from + of current to - of next */}
                                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <path 
                                      d="M 68 -8 L 68 8 L 26 8 L 26 24" 
                                      fill="none" 
                                      stroke="#94a3b8" 
                                      strokeWidth="2"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  <div className="text-[8px] absolute left-1/2 -translate-x-1/2 top-1 font-bold text-gray-400 uppercase italic">Seri</div>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="mt-8 text-center">
                            <div className="text-[10px] font-black text-gray-900 leading-none">STRING {p + 1}</div>
                            <div className="text-[8px] text-gray-400 font-medium">({result.numSeries} Seri)</div>
                          </div>
                        </div>
                      ))}

                      {/* Positive Busbar Line */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-red-500 rounded-full">
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-600">BUSBAR POSITIF (+)</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <Calendar className="h-5 w-5 text-amber-600 mt-1" />
                    <p className="text-sm text-amber-800">
                      <strong>Life Span:</strong> Dengan DoD {result.actualDoD}%, baterai ini diperkirakan akan bertahan sekitar <strong>{selectedBattery?.cycleLife ? Math.round(selectedBattery.cycleLife / 365) : '??'} tahun</strong> pemakaian harian.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={saveToPortfolio}
                      className="flex-1 bg-blue-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Simpan sebagai Proyek Portfolio
                    </Button>
                  </div>

                  {result && selectedBattery && showSaveDialog && (
                    <SaveToProjectDialog
                      open={showSaveDialog}
                      onClose={() => setShowSaveDialog(false)}
                      sourceLabel={`Baterai ${selectedBattery.brand} ${result.totalBatteries} unit`}
                      projectData={{
                        systemType: 'OFF_GRID',
                        capacity: (dailyLoad / 1000) * autonomy,
                        numPanels: 0,
                        investment: result.totalBatteries * (selectedBattery.price || 0),
                        roiYears: 0,
                        annualSaving: 0,
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-64 flex items-center justify-center border-dashed">
              <div className="text-center text-gray-400">
                <Info className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>Pilih model baterai untuk melihat analisa</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
