import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { calculateStringConfig, type StringConfiguration } from '../../lib/calculations/stringConfig';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2, XCircle, AlertTriangle, Save, Plus, LayoutGrid, Maximize2 } from 'lucide-react';
import { SaveToProjectDialog } from '../ui/save-to-project-dialog';

export function StringConfigCalculator() {
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [selectedInverterId, setSelectedInverterId] = useState<number | null>(null);
  const [numPanels, setNumPanels] = useState(10);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [configurations, setConfigurations] = useState<StringConfiguration[]>([]);

  // Load data from IndexedDB
  const panels = useLiveQuery(() => db.solarPanels.toArray());
  const inverters = useLiveQuery(() => db.inverters.toArray());

  const selectedPanel = panels?.find(p => p.id === selectedPanelId);
  const selectedInverter = inverters?.find(i => i.id === selectedInverterId);

  const handleCalculate = () => {
    if (!selectedPanel || !selectedInverter) {
      alert('Pilih panel dan inverter terlebih dahulu');
      return;
    }

    const results = calculateStringConfig({
      numPanels,
      panel: selectedPanel,
      inverter: selectedInverter
    });

    setConfigurations(results);
  };

  const handleSave = async (config: StringConfiguration) => {
    await db.calculations.add({
      toolType: 'STRING_CONFIG',
      inputs: {
        numPanels,
        panelId: selectedPanelId,
        inverterId: selectedInverterId
      },
      outputs: config,
      createdAt: new Date()
    });

    alert('Konfigurasi berhasil disimpan ke Riwayat!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kalkulator Konfigurasi String</h2>
        <p className="text-gray-600 mt-1">
          Hitung konfigurasi string panel yang optimal untuk sistem PLTS Anda
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Input Parameter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Panel Selection */}
          <div className="space-y-2">
            <Label>Panel Surya</Label>
            <Select 
              value={selectedPanelId?.toString()} 
              onValueChange={(val: string) => setSelectedPanelId(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih panel..." />
              </SelectTrigger>
              <SelectContent>
                {panels?.map(panel => (
                  <SelectItem key={panel.id} value={panel.id!.toString()}>
                    {panel.brand} {panel.model} ({panel.power}W)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show panel specs */}
          {selectedPanel && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-600">Voc:</span>{' '}
                <span className="font-medium">{selectedPanel.voc}V</span>
              </div>
              <div>
                <span className="text-gray-600">Vmp:</span>{' '}
                <span className="font-medium">{selectedPanel.vmp}V</span>
              </div>
              <div>
                <span className="text-gray-600">Isc:</span>{' '}
                <span className="font-medium">{selectedPanel.isc}A</span>
              </div>
              <div>
                <span className="text-gray-600">Imp:</span>{' '}
                <span className="font-medium">{selectedPanel.imp}A</span>
              </div>
            </div>
          )}

          {/* Inverter Selection */}
          <div className="space-y-2">
            <Label>Inverter</Label>
            <Select 
              value={selectedInverterId?.toString()} 
              onValueChange={(val: string) => setSelectedInverterId(parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih inverter..." />
              </SelectTrigger>
              <SelectContent>
                {inverters?.map(inv => (
                  <SelectItem key={inv.id} value={inv.id!.toString()}>
                    {inv.brand} {inv.model} ({inv.power}W) - {inv.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show inverter specs */}
          {selectedInverter && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-600">Max DC:</span>{' '}
                <span className="font-medium">{selectedInverter.maxDcVoltage}V</span>
              </div>
              <div>
                <span className="text-gray-600">MPPT:</span>{' '}
                <span className="font-medium">
                  {selectedInverter.mpptRangeMin}-{selectedInverter.mpptRangeMax}V
                </span>
              </div>
              <div>
                <span className="text-gray-600">Max Current:</span>{' '}
                <span className="font-medium">{selectedInverter.maxDcCurrent}A</span>
              </div>
            </div>
          )}

          {/* Number of Panels */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Jumlah Panel</Label>
              <span className="text-sm font-medium">{numPanels} panel</span>
            </div>
            <Slider
              value={[numPanels]}
              onValueChange={(val: number[]) => setNumPanels(val[0])}
              min={2}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <Button onClick={handleCalculate} className="w-full" size="lg">
            Hitung Konfigurasi
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {configurations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Hasil: {configurations.length} konfigurasi ditemukan
          </h3>

          {configurations.slice(0, 5).map((config, index) => (
            <Card 
              key={index}
              className={config.isValid ? 'border-green-200' : 'border-red-200'}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {config.series} series × {config.parallel} parallel
                      {index === 0 && config.isValid && (
                        <Badge className="bg-green-500">Direkomendasikan</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {config.totalStrings} string total
                    </CardDescription>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {config.efficiency}%
                    </div>
                    <div className="text-xs text-gray-500">Skor Efisiensi</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Technical Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Total Voc</div>
                    <div className="font-semibold">{config.totalVoc.toFixed(1)}V</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Total Vmp</div>
                    <div className="font-semibold">{config.totalVmp.toFixed(1)}V</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-600">Arus String</div>
                    <div className="font-semibold">{config.stringCurrent.toFixed(1)}A</div>
                  </div>
                </div>

                {/* Validation Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {config.isValid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-600">Kompatibel</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-600">Tidak Kompatibel</span>
                      </>
                    )}
                  </div>

                  {/* Errors */}
                  {config.errors.map((error, i) => (
                    <Alert key={i} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}

                  {/* Warnings */}
                  {config.warnings.map((warning, i) => (
                    <Alert key={i}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>

                {/* Physical Mounting Layout */}
                <div className="border rounded-2xl p-6 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold flex items-center gap-2 text-gray-700">
                      <LayoutGrid className="h-4 w-4 text-blue-600" />
                      LAYOUT MOUNTING (ESTIMASI FISIK)
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-white">
                      Tot: {config.totalPanels} Panel
                    </Badge>
                  </div>
                  
                  <div className="space-y-6">
                    {Array.from({ length: config.parallel }).map((_, stringIdx) => (
                      <div key={stringIdx} className="space-y-2">
                        <div className="text-[10px] font-black text-blue-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          STRING {stringIdx + 1}
                        </div>
                        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200">
                          {Array.from({ length: config.series }).map((_, panelIdx) => (
                            <div 
                              key={panelIdx}
                              className={`
                                w-10 h-16 rounded border-2 relative flex items-center justify-center transition-all
                                ${config.isValid 
                                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                  : 'bg-red-50 border-red-200'
                                }
                              `}
                            >
                              <div className="absolute top-1 inset-x-2 h-px bg-blue-200/50"></div>
                              <div className="absolute top-2 inset-x-2 h-px bg-blue-200/50"></div>
                              <div className="absolute bottom-2 inset-x-2 h-px bg-blue-200/50"></div>
                              <span className="text-[8px] font-black text-blue-400">{panelIdx + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center text-[10px] font-bold text-gray-500">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-3 w-3" />
                      AREA DIBUTUHKAN: ±{(config.totalPanels * 2.2).toFixed(1)} m²
                    </div>
                    <div className="italic text-gray-400">*Susunan dapat berubah di lapangan</div>
                  </div>
                </div>

                {/* Save Button */}
                {config.isValid && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSave(config)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Riwayat
                    </Button>
                    <Button 
                      onClick={() => setShowSaveDialog(true)}
                      className="flex-1 bg-blue-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Portfolio
                    </Button>
                  </div>
                )}

                {selectedPanel && showSaveDialog && (
                  <SaveToProjectDialog
                    open={showSaveDialog}
                    onClose={() => setShowSaveDialog(false)}
                    sourceLabel={`String ${numPanels} Panel × ${selectedPanel.power}Wp`}
                    projectData={{
                      systemType: selectedInverter?.type ?? 'ON_GRID',
                      capacity: (numPanels * selectedPanel.power) / 1000,
                      numPanels: numPanels,
                      investment: 0,
                      roiYears: 0,
                      annualSaving: 0,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
