import { useState, useEffect } from 'react';
import { calculateCableSizing, type CableSizingOutput } from '../../lib/calculations/cableSizing';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { db } from '../../lib/db';
import { Ruler, Zap, Info, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

export function CableSizingCalculator() {
  const [power, setPower] = useState(1000);
  const [voltage, setVoltage] = useState(230);
  const [length, setLength] = useState(10);
  const [maxDrop, setMaxDrop] = useState(3);
  const [material, setMaterial] = useState<'COPPER' | 'ALUMINUM'>('COPPER');
  const [result, setResult] = useState<CableSizingOutput | null>(null);

  useEffect(() => {
    const output = calculateCableSizing({
      power,
      voltage,
      length,
      maxVoltageDrop: maxDrop,
      material
    });
    setResult(output);
  }, [power, voltage, length, maxDrop, material]);

  const saveToPortfolio = async () => {
    if (!result) return;
    try {
      await db.calculations.add({
        toolType: 'CABLE_SIZING',
        inputs: { power, voltage, length, maxDrop, material },
        outputs: result,
        savedName: `Kabel ${result.standardArea}mm² - ${material}`,
        createdAt: new Date()
      });
      alert('Hasil sizing kabel berhasil disimpan ke Riwayat!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kalkulator Ukuran Kabel</h2>
        <p className="text-gray-600 mt-1">
          Cegah kebakaran dan kehilangan energi dengan menentukan ukuran kabel yang tepat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parameter Kabel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Daya Beban (Watt)</Label>
              <Input 
                type="number" 
                value={power}
                onChange={(e) => setPower(parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tegangan Kerja (Volt)</Label>
              <Select 
                value={voltage.toString()}
                onValueChange={(val: string) => setVoltage(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12V (DC low voltage)</SelectItem>
                  <SelectItem value="24">24V (DC system)</SelectItem>
                  <SelectItem value="48">48V (Stationary DC)</SelectItem>
                  <SelectItem value="230">230V (AC Single Phase)</SelectItem>
                  <SelectItem value="400">400V (AC Three Phase)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Panjang Kabel (Meter)</Label>
                <span className="text-sm font-medium">{length} m</span>
              </div>
              <Slider
                value={[length]}
                onValueChange={(val: number[]) => setLength(val[0])}
                min={1}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Material Kabel</Label>
              <Select 
                value={material}
                onValueChange={(val: 'COPPER' | 'ALUMINUM') => setMaterial(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COPPER">Tembaga (Copper)</SelectItem>
                  <SelectItem value="ALUMINUM">Aluminium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Max Voltage Drop (%)</Label>
                <span className="text-sm font-medium">{maxDrop}%</span>
              </div>
              <Slider
                value={[maxDrop * 10]}
                onValueChange={(val: number[]) => setMaxDrop(val[0] / 10)}
                min={5}
                max={100}
                step={5}
              />
              <p className="text-[10px] text-gray-500 italic">Saran: &lt; 3% untuk sistem efisien</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {result && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-orange-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <Ruler className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-100">Ukuran Kabel Standard</p>
                        <p className="text-3xl font-bold">{result.standardArea} mm²</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-gray-900 border-2 border-orange-200">
                    <div className="flex items-center gap-4">
                      <div className="bg-orange-50 p-3 rounded-full">
                        <Zap className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Arus Operasi</p>
                        <p className="text-2xl font-bold">{result.current} Ampere</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Rincian Teknis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Min. Luas</div>
                      <div className="font-bold">{result.minArea} mm²</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">V-Drop (V)</div>
                      <div className="font-bold">{(result.actualVoltageDrop * voltage / 100).toFixed(2)}V</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">V-Drop (%)</div>
                      <div className={`font-bold ${result.actualVoltageDrop > maxDrop ? 'text-red-600' : 'text-green-600'}`}>
                        {result.actualVoltageDrop}%
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Resistansi</div>
                      <div className="font-bold">{result.resistance} Ω</div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {result.actualVoltageDrop <= maxDrop ? (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        Ukuran {result.standardArea}mm² aman untuk panjang {length}m dengan rugi tegangan {result.actualVoltageDrop}%.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Bahkan dengan ukuran terbesar, rugi tegangan masih melebihi batas. Pendekkan jarak kabel or naikkan tegangan sistem.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg flex gap-3">
                    <Info className="h-5 w-5 text-gray-400 shrink-0" />
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <strong>Catatan Safety:</strong> Perhitungan ini didasarkan pada rugi tegangan (*Voltage Drop*). 
                      Pastikan juga ukuran kabel memenuhi kapasitas hantar arus (**KHA**) sesuai tabel PUIL/IEC 
                      untuk mencegah panas berlebih pada kabel (*current carrying capacity*).
                    </div>
                  </div>

                  <Button onClick={saveToPortfolio} variant="outline" className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Hasil ke Riwayat
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
