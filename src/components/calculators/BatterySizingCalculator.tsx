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

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Desain DoD (Depth of Discharge)</Label>
                <span className="text-sm font-medium">{dod}%</span>
              </div>
              <Slider
                value={[dod]}
                onValueChange={(val: number[]) => setDod(val[0])}
                min={10}
                max={95}
                step={5}
              />
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
                  <CardContent className="pt-6 text-gray-900 border-2 border-green-500">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Kapasitas</p>
                        <p className="text-2xl font-bold">{result.totalCapacityAh} Ah</p>
                        <p className="text-xs text-gray-400">@ {systemVoltage}V nominal</p>
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Series</div>
                      <div className="text-xl font-bold">{result.numSeries}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Parallel</div>
                      <div className="text-xl font-bold">{result.numParallel}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Actual DoD</div>
                      <div className="text-xl font-bold">{result.actualDoD}%</div>
                    </div>
                  </div>

                  {/* Visual Diagram */}
                  <div className="border border-dashed p-6 rounded-xl flex flex-col items-center">
                    <div className="text-sm font-medium mb-4 text-center">Wiring Diagram (Series-Parallel)</div>
                    <div className="flex gap-4">
                      {Array.from({ length: result.numParallel }).map((_, p) => (
                        <div key={p} className="flex flex-col gap-2 p-3 bg-gray-100 rounded-lg">
                          {Array.from({ length: result.numSeries }).map((_, s) => (
                            <div key={s} className="w-12 h-16 bg-white border-2 border-blue-500 rounded relative shadow-sm flex items-center justify-center">
                              <div className="absolute -top-1 left-2 w-2 h-1 bg-blue-500"></div>
                              <div className="absolute -top-1 right-2 w-2 h-1 bg-red-500"></div>
                              <Battery className="h-6 w-6 text-blue-500" />
                            </div>
                          ))}
                          <div className="text-[10px] text-center font-bold text-gray-500">String {p + 1}</div>
                        </div>
                      ))}
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
