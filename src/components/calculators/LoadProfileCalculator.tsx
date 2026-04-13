import { useState, useEffect } from 'react';
import { calculateLoadProfile, type Appliance, type LoadProfileOutput } from '../../lib/calculations/loadProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trash2, Plus, Zap, TrendingUp, Info, Save, FolderKanban } from 'lucide-react';
import { db } from '../../lib/db';
import { SaveToProjectDialog } from '../ui/save-to-project-dialog';

export function LoadProfileCalculator() {
  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: '1', name: 'Lampu LED', power: 10, quantity: 5, hoursPerDay: 12 },
    { id: '2', name: 'Kulkas', power: 100, quantity: 1, hoursPerDay: 24 },
    { id: '3', name: 'TV', power: 50, quantity: 1, hoursPerDay: 4 },
  ]);

  const [result, setResult] = useState<LoadProfileOutput | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    setResult(calculateLoadProfile(appliances));
  }, [appliances]);

  const saveProfile = async () => {
    if (!result) return;
    try {
      await db.calculations.add({
        toolType: 'LOAD_PROFILE',
        inputs: { appliances },
        outputs: result,
        savedName: `Profil Beban ${result.totalDailyEnergy.toFixed(0)} Wh`,
        createdAt: new Date()
      });
      alert('Profil beban berhasil disimpan ke Riwayat!');
    } catch (err) {
      console.error(err);
    }
  };

  const addAppliance = () => {
    const newApp: Appliance = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Peralatan Baru',
      power: 0,
      quantity: 1,
      hoursPerDay: 1
    };
    setAppliances([...appliances, newApp]);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    setAppliances(appliances.map(app => 
      app.id === id ? { ...app, [field]: value } : app
    ));
  };

  const removeAppliance = (id: string) => {
    setAppliances(appliances.filter(app => app.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analisa Profil Beban</h2>
        <p className="text-gray-600 mt-1">
          Input daftar peralatan elektronik untuk menghitung total kebutuhan energi harian.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daftar Peralatan</CardTitle>
              <Button onClick={addAppliance} size="sm" className="bg-blue-600">
                <Plus className="h-4 w-4 mr-1" /> Tambah
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Alat</TableHead>
                    <TableHead className="w-24">Watt</TableHead>
                    <TableHead className="w-20">Qty</TableHead>
                    <TableHead className="w-20">Jam/Hari</TableHead>
                    <TableHead className="w-24 text-right">Wh/Hari</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appliances.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Input 
                          value={app.name} 
                          onChange={(e) => updateAppliance(app.id, 'name', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={app.power} 
                          onChange={(e) => updateAppliance(app.id, 'power', parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={app.quantity} 
                          onChange={(e) => updateAppliance(app.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.5"
                          value={app.hoursPerDay} 
                          onChange={(e) => updateAppliance(app.id, 'hoursPerDay', parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {app.power * app.quantity * app.hoursPerDay}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeAppliance(app.id)}
                          className="h-8 w-8 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {appliances.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        Belum ada peralatan. Klik tambah untuk memulai.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {result && (
            <>
              <Card className="bg-blue-600 text-white border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-blue-200" />
                      <div>
                        <p className="text-xs text-blue-100 uppercase tracking-wider">Total Energi Harian</p>
                        <p className="text-3xl font-bold">{result.totalDailyEnergy} Wh</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-blue-500 flex justify-between">
                      <div>
                        <p className="text-[10px] text-blue-100 font-medium">EST. BULANAN</p>
                        <p className="font-bold">{result.totalMonthlyEnergy} kWh</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-blue-100 font-medium">PEAK LOAD</p>
                        <p className="font-bold">{result.peakPower} Watt</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Rekomendasi Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Estimasi Kapasitas Inverter</Label>
                    <div className="text-lg font-bold text-gray-900">{result.suggestedInverterSize} Watt</div>
                    <p className="text-[10px] text-gray-400">Termasuk safety margin 25%</p>
                  </div>

                  <div className="space-y-1 pt-2 border-t">
                    <Label className="text-xs text-gray-500">Estimasi Array Panel Surya</Label>
                    <div className="text-lg font-bold text-gray-900">
                      {Math.round(result.totalDailyEnergy / 3.5)} Wp
                    </div>
                    <p className="text-[10px] text-gray-400">Asumsi 3.5 jam penyinaran efektif</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg flex gap-2">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Profil beban adalah fondasi utama dalam merancang sistem PLTS. Pastikan input daya Watt benar sesuai plat nama peralatan.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={saveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Riwayat
                    </Button>
                    <Button className="flex-1 bg-blue-600" onClick={() => setShowSaveDialog(true)}>
                      <FolderKanban className="h-4 w-4 mr-2" />
                      Portfolio
                    </Button>
                  </div>

                  {result && showSaveDialog && (
                    <SaveToProjectDialog
                      open={showSaveDialog}
                      onClose={() => setShowSaveDialog(false)}
                      sourceLabel={`Profil Beban ${result.totalDailyEnergy.toFixed(0)} Wh/hari`}
                      projectData={{
                        systemType: 'ON_GRID',
                        capacity: Math.round(result.totalDailyEnergy / 3.5) / 1000,
                        numPanels: Math.round(Math.round(result.totalDailyEnergy / 3.5) / 520),
                        investment: 0,
                        roiYears: 0,
                        annualSaving: 0,
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
