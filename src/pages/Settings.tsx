import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { 
  User, Moon, Database, Shield, Globe,
  CheckCircle2, Save 
} from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState('preferensi');
  const [currency, setCurrency] = useState('idr');
  const [unit, setUnit] = useState('mm');
  const [darkMode, setDarkMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetConfirm, setIsResetConfirm] = useState(false);

  // Load saved settings
  const savedSettings = useLiveQuery(() => db.settings.toArray());

  useEffect(() => {
    if (savedSettings && savedSettings.length > 0) {
      const settingsMap = Object.fromEntries(savedSettings.map(s => [s.key, s.value]));
      if (settingsMap['currency']) setCurrency(settingsMap['currency']);
      if (settingsMap['unit']) setUnit(settingsMap['unit']);
      if (settingsMap['darkMode']) setDarkMode(settingsMap['darkMode'] === 'true');
    }
  }, [savedSettings]);

  const handleSave = async () => {
    await db.settings.bulkPut([
      { key: 'currency', value: currency },
      { key: 'unit', value: unit },
      { key: 'darkMode', value: String(darkMode) },
    ]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Apply dark mode immediately when toggled
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleReset = async () => {
    if (!isResetConfirm) {
      setIsResetConfirm(true);
      setTimeout(() => setIsResetConfirm(false), 4000);
      return;
    }
    await db.projects.clear();
    await db.calculations.clear();
    await db.quizAttempts.clear();
    await db.settings.clear();
    setCurrency('idr');
    setUnit('mm');
    setDarkMode(false);
    setIsResetConfirm(false);
    alert('Semua data berhasil direset!');
  };

  const navItems = [
    { id: 'preferensi', label: 'Preferensi Unit', icon: User },
    { id: 'tampilan', label: 'Tampilan (Theme)', icon: Moon },
    { id: 'database', label: 'Keamanan & Data', icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600">Konfigurasi preferensi aplikasi dan database lokal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </button>
            );
          })}
        </aside>

        <div className="md:col-span-2 space-y-6">

          {/* PREFERENSI TAB */}
          {activeTab === 'preferensi' && (
            <Card>
              <CardHeader>
                <CardTitle>Preferensi Unit</CardTitle>
                <CardDescription>Sesuaikan satuan unit yang digunakan dalam kalkulasi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mata Uang (Currency)</Label>
                    <p className="text-xs text-gray-500">IDR (Rupiah) atau USD.</p>
                  </div>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idr">IDR</SelectItem>
                      <SelectItem value="usd">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="space-y-0.5">
                    <Label>Satuan Dimensi</Label>
                    <p className="text-xs text-gray-500">Milimeter (mm) atau Meter (m).</p>
                  </div>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleSave}
                    className={`w-full ${isSaved ? 'bg-green-600' : 'bg-blue-600'} transition-colors`}
                  >
                    {isSaved ? (
                      <><CheckCircle2 className="h-4 w-4 mr-2" /> Tersimpan!</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" /> Simpan Preferensi</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAMPILAN TAB */}
          {activeTab === 'tampilan' && (
            <Card>
              <CardHeader>
                <CardTitle>Tampilan (Theme)</CardTitle>
                <CardDescription>Ubah mode tampilan aplikasi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode Gelap (Dark Mode)</Label>
                    <p className="text-xs text-gray-500">Ganti ke tampilan gelap untuk kondisi cahaya rendah.</p>
                  </div>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                  <Moon className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Toggle di atas langsung berlaku. Klik <strong>Simpan</strong> agar tetap aktif setelah browser ditutup.
                  </p>
                </div>

                <Button 
                  onClick={handleSave}
                  className={`w-full ${isSaved ? 'bg-green-600' : 'bg-blue-600'} transition-colors`}
                >
                  {isSaved ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Tersimpan!</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Simpan Preferensi</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* DATABASE TAB */}
          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle>Keamanan & Database</CardTitle>
                <CardDescription>Kelola penyimpanan data lokal di browser Anda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Penyimpanan Lokal (IndexedDB)</p>
                      <p className="text-xs text-green-600">Semua data aman di perangkat Anda</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">AKTIF</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  {[
                    { label: 'Proyek', query: () => db.projects.count() },
                    { label: 'Kalkulasi', query: () => db.calculations.count() },
                    { label: 'Quiz', query: () => db.quizAttempts.count() },
                    { label: 'Komponen', query: () => db.solarPanels.count() },
                  ].map((item) => (
                    <DataCountCard key={item.label} label={item.label} queryFn={item.query} />
                  ))}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button
                    variant="outline"
                    className={`w-full border-red-200 transition-colors ${
                      isResetConfirm 
                        ? 'bg-red-600 text-white hover:bg-red-700 border-red-600' 
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                    onClick={handleReset}
                  >
                    {isResetConfirm ? '⚠️ Klik lagi untuk konfirmasi reset!' : 'Reset Semua Data (Factory Reset)'}
                  </Button>
                  <p className="text-[10px] text-gray-400 text-center italic">
                    * Tindakan ini akan menghapus semua proyek, kuis, dan setting secara permanen.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center pt-6 opacity-40 space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
              <Globe className="h-4 w-4" />
              PLTS TRAINING TOOLS v1.0.0
            </div>
            <p className="text-[10px] text-gray-400">© 2026 Antigravity. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for showing DB record counts
function DataCountCard({ label, queryFn }: { label: string; queryFn: () => Promise<number> }) {
  const [count, setCount] = useState<number | null>(null);
  
  useEffect(() => {
    queryFn().then(setCount);
  }, []);

  return (
    <div className="p-3 bg-gray-50 rounded-lg text-center">
      <div className="text-2xl font-black text-gray-800">{count ?? '—'}</div>
      <div className="text-[10px] text-gray-400 uppercase font-medium">{label}</div>
    </div>
  );
}
