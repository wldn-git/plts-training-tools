import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogDescription, DialogFooter
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search, Info, Plus, Trash2, Edit2, Check, Download, Upload } from 'lucide-react';

export function ComponentDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'PANEL' | 'INVERTER' | 'BATTERY', data: any } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newType, setNewType] = useState<'PANEL' | 'INVERTER' | 'BATTERY'>('PANEL');
  const [formData, setFormData] = useState<any>({ brand: '', model: '', price: 0 });
  
  const panels = useLiveQuery(() => 
    db.solarPanels.toArray()
  );
  
  const inverters = useLiveQuery(() => 
    db.inverters.toArray()
  );
  
  const batteries = useLiveQuery(() => 
    db.batteries.toArray()
  );

  const filterData = (data: any[]) => {
    if (!data) return [];
    return data.filter(item => 
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        price: parseInt(formData.price) || 0,
      };

      if (newType === 'PANEL') {
        const payload = {
          ...dataToSave,
          power: parseInt(formData.power) || 450,
          tier: 1,
          voc: formData.voc || 49, vmp: formData.vmp || 41, isc: formData.isc || 13, 
          imp: formData.imp || 12, efficiency: formData.efficiency || 21, 
          warranty: 25, tempCoeff: -0.35, length: 2278, width: 1134
        };
        if (formData.id) await db.solarPanels.put(payload);
        else await db.solarPanels.add(payload);
      } else if (newType === 'INVERTER') {
        const payload = {
          ...dataToSave,
          power: parseInt(formData.power) || 5000,
          type: formData.type || 'ON_GRID',
          maxDcVoltage: 600, mpptRangeMin: 90, mpptRangeMax: 550, 
          maxDcCurrent: 15, numMppt: 2, efficiency: 97, warranty: 10
        };
        if (formData.id) await db.inverters.put(payload);
        else await db.inverters.add(payload);
      } else {
        const payload = {
          ...dataToSave,
          capacityAh: parseInt(formData.capacityAh) || 100,
          voltage: formData.voltage || 48, 
          type: formData.type || 'LIFEPO4', 
          capacityKwh: formData.capacityKwh || 4.8, 
          dod: 90, cycleLife: 6000, warranty: 10
        };
        if (formData.id) await db.batteries.put(payload);
        else await db.batteries.add(payload);
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({ brand: '', model: '', price: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (type: 'PANEL' | 'INVERTER' | 'BATTERY', item: any) => {
    setNewType(type);
    setFormData({ ...item });
    setEditingItem({ type, data: item });
    setIsDialogOpen(true);
  };

  const handleDelete = async (type: 'PANEL' | 'INVERTER' | 'BATTERY', id: number) => {
    const confirmKey = `${type}-${id}`;
    if (confirmDeleteId === confirmKey) {
      if (type === 'PANEL') await db.solarPanels.delete(id);
      else if (type === 'INVERTER') await db.inverters.delete(id);
      else await db.batteries.delete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(confirmKey);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };
  const handleExport = async () => {
    try {
      const exportData = {
        panels: await db.solarPanels.toArray(),
        inverters: await db.inverters.toArray(),
        batteries: await db.batteries.toArray(),
        projects: await db.projects.toArray(),
        calculations: await db.calculations.toArray(),
        quizAttempts: await db.quizAttempts.toArray(),
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_plts_tools_full_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (!window.confirm('Import akan menimpa seluruh data (Komponen, Riwayat, Proyek). Lanjutkan?')) return;

        await db.transaction('rw', [
          db.solarPanels, db.inverters, db.batteries, 
          db.projects, db.calculations, db.quizAttempts
        ], async () => {
          if (data.panels) { await db.solarPanels.clear(); await db.solarPanels.bulkAdd(data.panels); }
          if (data.inverters) { await db.inverters.clear(); await db.inverters.bulkAdd(data.inverters); }
          if (data.batteries) { await db.batteries.clear(); await db.batteries.bulkAdd(data.batteries); }
          if (data.projects) { await db.projects.clear(); await db.projects.bulkAdd(data.projects); }
          if (data.calculations) { await db.calculations.clear(); await db.calculations.bulkAdd(data.calculations); }
          if (data.quizAttempts) { await db.quizAttempts.clear(); await db.quizAttempts.bulkAdd(data.quizAttempts); }
        });
        alert('Data berhasil di-import sepenuhnya!');
      } catch (err) {
        console.error('Import failed:', err);
        alert('Gagal meng-import data. Format file tidak valid.');
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database Komponen</h1>
          <p className="text-gray-600">Manajemen data panel surya, inverter, dan baterai.</p>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="file" 
            id="import-db" 
            className="hidden" 
            accept=".json"
            onChange={handleImport}
          />
          <Button variant="outline" onClick={() => document.getElementById('import-db')?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600">
                <Plus className="h-4 w-4 mr-2" /> Tambah Komponen
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Data Baru</DialogTitle>
              <DialogDescription>Masukkan spesifikasi dasar komponen.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Jenis Komponen</Label>
                <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PANEL">Panel Surya</SelectItem>
                    <SelectItem value="INVERTER">Inverter</SelectItem>
                    <SelectItem value="BATTERY">Baterai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Harga (Rp)</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>{newType === 'BATTERY' ? 'Kapasitas (Ah)' : 'Power (Watt)'}</Label>
                  <Input type="number" onChange={e => setFormData({...formData, [newType === 'BATTERY' ? 'capacityAh' : 'power']: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave} className="bg-blue-600">Simpan Ke Database</Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Cari brand atau model..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="panels" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="panels">Panel Surya ({panels?.length || 0})</TabsTrigger>
          <TabsTrigger value="inverters">Inverter ({inverters?.length || 0})</TabsTrigger>
          <TabsTrigger value="batteries">Baterai ({batteries?.length || 0})</TabsTrigger>
        </TabsList>

        {/* PANELS TAB */}
        <TabsContent value="panels">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Power (Wp)</TableHead>
                  <TableHead>Voc/Vmp</TableHead>
                  <TableHead>Isc/Imp</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(panels || []).map((panel) => (
                  <TableRow key={panel.id}>
                    <TableCell>
                      <div className="font-medium text-blue-600">{panel.brand}</div>
                      <div className="text-xs text-gray-500">{panel.model}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{panel.power} Wp</TableCell>
                    <TableCell className="text-xs">
                      {panel.voc}V / {panel.vmp}V
                    </TableCell>
                    <TableCell className="text-xs">
                      {panel.isc}A / {panel.imp}A
                    </TableCell>
                    <TableCell>
                      <Badge variant={panel.tier === 1 ? "default" : "secondary"}>
                        Tier {panel.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {panel.price.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-blue-600" onClick={() => startEdit('PANEL', panel)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-7 w-7 transition-all ${confirmDeleteId === `PANEL-${panel.id}` ? 'text-white bg-red-600' : 'text-gray-400 hover:text-red-600'}`} 
                          onClick={() => handleDelete('PANEL', panel.id!)}
                        >
                          {confirmDeleteId === `PANEL-${panel.id}` ? <Check className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* INVERTERS TAB */}
        <TabsContent value="inverters">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>DC Range</TableHead>
                  <TableHead>MPPT</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(inverters || []).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div className="font-medium text-green-600">{inv.brand}</div>
                      <div className="text-xs text-gray-500">{inv.model}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{(inv.power/1000).toFixed(1)} kW</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {inv.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {inv.mpptRangeMin}-{inv.mpptRangeMax}V
                    </TableCell>
                    <TableCell className="text-center">{inv.numMppt}</TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {inv.price.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-green-600" onClick={() => startEdit('INVERTER', inv)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-7 w-7 transition-all ${confirmDeleteId === `INVERTER-${inv.id}` ? 'text-white bg-red-600' : 'text-gray-400 hover:text-red-600'}`} 
                          onClick={() => handleDelete('INVERTER', inv.id!)}
                        >
                          {confirmDeleteId === `INVERTER-${inv.id}` ? <Check className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* BATTERIES TAB */}
        <TabsContent value="batteries">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Voltage</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Cycle Life</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(batteries || []).map((bat) => (
                  <TableRow key={bat.id}>
                    <TableCell>
                      <div className="font-medium text-amber-600">{bat.brand}</div>
                      <div className="text-xs text-gray-500">{bat.model}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {bat.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{bat.voltage}V</TableCell>
                    <TableCell>{bat.capacityAh}Ah ({bat.capacityKwh}kWh)</TableCell>
                    <TableCell className="text-xs">{bat.cycleLife} cycles</TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {bat.price.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-amber-600" onClick={() => startEdit('BATTERY', bat)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-7 w-7 transition-all ${confirmDeleteId === `BATTERY-${bat.id}` ? 'text-white bg-red-600' : 'text-gray-400 hover:text-red-600'}`} 
                          onClick={() => handleDelete('BATTERY', bat.id!)}
                        >
                          {confirmDeleteId === `BATTERY-${bat.id}` ? <Check className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
        <Info className="h-5 w-5 text-blue-500 shrink-0" />
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Seluruh data ini tersimpan secara lokal di browser Anda (IndexedDB). 
          Anda dapat tetap mengakses dan mengubah data ini meskipun tidak ada koneksi internet.
        </p>
      </div>
    </div>
  );
}
