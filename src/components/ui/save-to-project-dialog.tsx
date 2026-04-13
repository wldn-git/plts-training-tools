import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Project } from '../../lib/db';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from './select';
import { FolderKanban, PlusCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Partial project data from the calculator */
  projectData: Omit<Project, 'id' | 'name' | 'location' | 'status' | 'photos' | 'description' | 'createdAt'>;
  /** Label for what's being saved, e.g. "String Config 10 Panel" */
  sourceLabel: string;
}

export function SaveToProjectDialog({ open, onClose, projectData, sourceLabel }: Props) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('Lokasi Survey');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray());

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (mode === 'new') {
        await db.projects.add({
          ...projectData,
          name: projectName || sourceLabel,
          location,
          status: 'PLANNED',
          photos: [],
          createdAt: new Date()
        });
      } else if (selectedProjectId) {
        const id = parseInt(selectedProjectId);
        // Merge data into existing project (only non-zero fields)
        const updates: Partial<Project> = {};
        if (projectData.capacity) updates.capacity = projectData.capacity;
        if (projectData.numPanels) updates.numPanels = projectData.numPanels;
        if (projectData.investment) updates.investment = projectData.investment;
        if (projectData.roiYears) updates.roiYears = projectData.roiYears;
        if (projectData.annualSaving) updates.annualSaving = projectData.annualSaving;
        if (projectData.systemType) updates.systemType = projectData.systemType;
        await db.projects.update(id, updates);
      }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
        setProjectName('');
        setSelectedProjectId('');
        setMode('new');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-blue-600" />
            Simpan ke Portfolio
          </DialogTitle>
          <DialogDescription>
            Hasil dari <strong>{sourceLabel}</strong> akan disimpan ke proyek portfolio Anda.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <p className="font-bold text-green-700">
              {mode === 'new' ? 'Proyek baru berhasil dibuat!' : 'Data berhasil ditambahkan ke proyek!'}
            </p>
          </div>
        ) : (
          <>
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setMode('new')}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'new' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Proyek Baru
              </button>
              <button
                onClick={() => setMode('existing')}
                className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'existing' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FolderKanban className="h-4 w-4" />
                Proyek Ada
              </button>
            </div>

            <div className="space-y-4 py-2">
              {mode === 'new' ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Nama Proyek</Label>
                    <Input
                      placeholder={sourceLabel}
                      value={projectName}
                      onChange={e => setProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Lokasi</Label>
                    <Input
                      placeholder="Cth: Jl. Merdeka No. 5, Jakarta"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs text-gray-500">
                    <p className="font-bold text-gray-600 text-[10px] uppercase">Data yang akan disimpan:</p>
                    {projectData.capacity > 0 && <p>• Kapasitas: {projectData.capacity} kWp</p>}
                    {projectData.numPanels > 0 && <p>• Jumlah panel: {projectData.numPanels} unit</p>}
                    {projectData.investment > 0 && <p>• Investasi: Rp {projectData.investment.toLocaleString('id-ID')}</p>}
                    {projectData.roiYears > 0 && <p>• Payback: {projectData.roiYears} tahun</p>}
                    <p>• Tipe: {projectData.systemType}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label>Pilih Proyek yang Ada</Label>
                    {projects && projects.length > 0 ? (
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih proyek..." />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id!.toString()}>
                              {p.name} — {p.capacity} kWp
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm border rounded-lg">
                        Belum ada proyek tersimpan.
                        <button onClick={() => setMode('new')} className="block mx-auto mt-1 text-blue-600 text-xs underline">
                          Buat proyek baru →
                        </button>
                      </div>
                    )}
                  </div>
                  {selectedProjectId && (
                    <div className="bg-blue-50 rounded-lg p-3 space-y-1 text-xs text-blue-700">
                      <p className="font-bold text-[10px] uppercase">Data yang akan di-update:</p>
                      {projectData.capacity > 0 && <p>• Kapasitas → {projectData.capacity} kWp</p>}
                      {projectData.numPanels > 0 && <p>• Jumlah panel → {projectData.numPanels} unit</p>}
                      {projectData.investment > 0 && <p>• Investasi → Rp {projectData.investment.toLocaleString('id-ID')}</p>}
                      {projectData.roiYears > 0 && <p>• Payback → {projectData.roiYears} tahun</p>}
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Batal</Button>
              <Button
                className="bg-blue-600"
                onClick={handleSave}
                disabled={isSaving || (mode === 'existing' && !selectedProjectId)}
              >
                {isSaving ? 'Menyimpan...' : mode === 'new' ? 'Buat & Simpan' : 'Tambah ke Proyek'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
