import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, type Project } from '../lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Plus, Briefcase, MapPin, Zap, 
  Calendar, ArrowRight, Search, X,
  TrendingUp, DollarSign, Trash2, Edit2, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PLANNED:     { label: 'Direncanakan', color: 'bg-blue-500' },
  IN_PROGRESS: { label: 'Dalam Proses', color: 'bg-amber-500' },
  COMPLETED:   { label: 'Selesai',      color: 'bg-green-500' },
};

const RELEVANT_TOOLS = [
  { title: 'Kalkulator ROI', desc: 'Hitung investasi, penghematan & payback period', path: '/calculators/roi', color: 'text-green-600', bg: 'bg-green-50' },
  { title: 'String Config', desc: 'Tentukan jumlah panel dan konfigurasi string', path: '/calculators/string-config', color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Sizing Baterai', desc: 'Hitung kapasitas baterai Off-grid/Hybrid', path: '/calculators/battery-sizing', color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Profil Beban', desc: 'Analisa kebutuhan energi harian pelanggan', path: '/calculators/load-profile', color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Layout Mounting', desc: 'Estimasi luas atap dan tata letak panel', path: '/calculators/mounting', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export function ProjectPortfolio() {
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Project>>({});
  const [showNewModal, setShowNewModal] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    location: '',
    systemType: 'ON_GRID',
    status: 'PLANNED',
    capacity: 0,
    numPanels: 0,
    investment: 0,
    roiYears: 0,
    annualSaving: 0,
    createdAt: new Date()
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && location.state.autoCapacity) {
      setNewProject(prev => ({
        ...prev,
        capacity: location.state.autoCapacity || 0,
        investment: location.state.investment || 0,
        roiYears: location.state.roiYears || 0,
        numPanels: location.state.numPanels || 0,
        annualSaving: location.state.annualSaving || 0,
        systemType: location.state.systemType || 'ON_GRID'
      }));
      setShowSaveForm(true);
      // Clear state after reading to prevent modal reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray());

  const filtered = projects?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleDelete = async (id: number) => {
    if (confirm('Hapus proyek ini dari portfolio?')) {
      await db.projects.delete(id);
      setSelectedProject(null);
    }
  };

  const handleEdit = (project: Project) => {
    setEditData({
      name: project.name,
      location: project.location,
      status: project.status,
      description: project.description,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProject?.id) return;
    await db.projects.update(selectedProject.id, editData);
    const updated = await db.projects.get(selectedProject.id);
    if (updated) setSelectedProject(updated);
    setIsEditing(false);
  };

  const handleCreateProject = async () => {
    if (!newProject.name) return;
    
    await db.projects.add({
      ...newProject,
      createdAt: new Date(),
    } as Project);
    
    setShowSaveForm(false);
    setNewProject({
      name: '',
      location: '',
      systemType: 'ON_GRID',
      status: 'PLANNED',
      capacity: 0,
      investment: 0,
      createdAt: new Date()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Project</h1>
          <p className="text-gray-600">Daftar implementasi dan rencana sistem PLTS Anda.</p>
        </div>
        <Button className="bg-blue-600" onClick={() => setShowNewModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Proyek Baru
          </Button>
      </div>

      {/* Proyek Baru Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mulai Proyek Baru</h2>
                <p className="text-sm text-gray-500">Pilih kalkulator untuk memulai perencanaan</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {RELEVANT_TOOLS.map(tool => (
                <Link key={tool.path} to={tool.path} onClick={() => setShowNewModal(false)}>
                  <div className="flex items-center gap-4 p-3 rounded-xl border hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer">
                    <div className={`${tool.bg} p-2.5 rounded-xl`}>
                      <Zap className={`h-5 w-5 ${tool.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700">{tool.title}</p>
                      <p className="text-xs text-gray-400">{tool.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center">Simpan ke Portfolio setelah selesai kalkulasi →</p>
          </div>
        </div>
      )}
 
      {/* Save Project Form Modal (Triggered from Calculators) */}
      {showSaveForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Simpan Proyek Baru</CardTitle>
                  <CardDescription>Lengkapi detail proyek dari hasil kalkulasi</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSaveForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Proyek</Label>
                <Input 
                  placeholder="Contoh: PLTS Atap Bp. Budi"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Lokasi</Label>
                <Input 
                  placeholder="Contoh: Jakarta Selatan"
                  value={newProject.location}
                  onChange={e => setNewProject({...newProject, location: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Kapasitas</p>
                  <p className="text-lg font-bold text-blue-900">{newProject.capacity} kWp</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-[10px] text-green-600 font-bold uppercase">Investasi</p>
                  <p className="text-lg font-bold text-green-900">
                    {newProject.investment ? formatCurrency(newProject.investment as number) : '—'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tipe Sistem</Label>
                <Select 
                  value={newProject.systemType} 
                  onValueChange={(v: any) => setNewProject({...newProject, systemType: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_GRID">On-Grid</SelectItem>
                    <SelectItem value="OFF_GRID">Off-Grid</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
 
              <div className="pt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowSaveForm(false)}>Batal</Button>
                <Button 
                  className="flex-1 bg-blue-600 font-bold" 
                  onClick={handleCreateProject}
                  disabled={!newProject.name}
                >
                  Simpan Proyek
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari nama proyek atau lokasi..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={`grid gap-6 ${selectedProject ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {/* Project Cards */}
        <div className={`${selectedProject ? 'lg:col-span-1' : 'col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
          {filtered === undefined ? (
            <div className="col-span-full py-20 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat data proyek...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((project) => {
              const status = STATUS_MAP[project.status] ?? STATUS_MAP.PLANNED;
              const isSelected = selectedProject?.id === project.id;
              return (
                <Card
                  key={project.id}
                  onClick={() => { setSelectedProject(project); setIsEditing(false); }}
                  className={`group cursor-pointer transition-all overflow-hidden border-2 ${
                    isSelected
                      ? 'border-blue-500 shadow-lg shadow-blue-100'
                      : 'border-transparent hover:shadow-lg hover:border-gray-200'
                  } shadow-md`}
                >
                  <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 relative flex items-center justify-center">
                    <Briefcase className="h-12 w-12 text-blue-200" />
                    <div className="absolute top-3 right-3">
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <MapPin className="h-3 w-3" /> {project.location}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 py-2 border-y border-gray-50">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Kapasitas</p>
                        <div className="flex items-center gap-1 font-bold text-gray-700 text-sm">
                          <Zap className="h-3 w-3 text-amber-500" />
                          {project.capacity} kWp
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase font-bold">ROI</p>
                        <div className="font-bold text-gray-700 text-sm font-mono">
                          {project.roiYears > 0 ? `${project.roiYears} Thn` : '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-400 gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString('id-ID')}
                      </div>
                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                        Lihat Rincian <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="h-10 w-10 text-gray-300" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Belum ada proyek tersimpan.</p>
                <p className="text-xs text-gray-400">Gunakan kalkulator untuk merencanakan sistem dan simpan di sini.</p>
              </div>
              <Link to="/calculators">
                <Button variant="outline" className="mt-2">Mulai Kalkulasi Pertama</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedProject && (
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-none shadow-xl sticky top-6">
              <div className={`h-1.5 ${STATUS_MAP[selectedProject.status]?.color ?? 'bg-blue-500'}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <Input
                        value={editData.name ?? ''}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        className="text-base font-bold"
                      />
                    ) : (
                      <CardTitle className="text-lg leading-snug">{selectedProject.name}</CardTitle>
                    )}
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {isEditing ? (
                        <Input
                          value={editData.location ?? ''}
                          onChange={e => setEditData({ ...editData, location: e.target.value })}
                          className="h-6 text-xs"
                        />
                      ) : selectedProject.location}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => { setSelectedProject(null); setIsEditing(false); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-gray-400">Status</Label>
                  {isEditing ? (
                    <Select
                      value={editData.status}
                      onValueChange={(v: any) => setEditData({ ...editData, status: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Direncanakan</SelectItem>
                        <SelectItem value="IN_PROGRESS">Dalam Proses</SelectItem>
                        <SelectItem value="COMPLETED">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`${STATUS_MAP[selectedProject.status]?.color} text-white`}>
                      {STATUS_MAP[selectedProject.status]?.label}
                    </Badge>
                  )}
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Kapasitas', value: `${selectedProject.capacity} kWp`, icon: Zap, color: 'text-amber-500' },
                    { label: 'Jumlah Panel', value: `${selectedProject.numPanels} unit`, icon: Briefcase, color: 'text-blue-500' },
                    { label: 'Investasi', value: selectedProject.investment > 0 ? formatCurrency(selectedProject.investment) : '—', icon: DollarSign, color: 'text-green-500' },
                    { label: 'Penghematan/Thn', value: selectedProject.annualSaving > 0 ? formatCurrency(selectedProject.annualSaving) : '—', icon: TrendingUp, color: 'text-indigo-500' },
                    { label: 'Payback Period', value: selectedProject.roiYears > 0 ? `${selectedProject.roiYears} Tahun` : '—', icon: Calendar, color: 'text-orange-500' },
                    { label: 'Tipe Sistem', value: selectedProject.systemType, icon: Zap, color: 'text-cyan-500' },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`h-3 w-3 ${item.color}`} />
                          <p className="text-[9px] text-gray-400 uppercase font-bold">{item.label}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-800 truncate">{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-gray-400">Catatan / Deskripsi</Label>
                  {isEditing ? (
                    <textarea
                      value={editData.description ?? ''}
                      onChange={e => setEditData({ ...editData, description: e.target.value })}
                      placeholder="Tambahkan catatan proyek..."
                      className="w-full text-sm border border-gray-200 rounded-lg p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 italic min-h-[40px]">
                      {selectedProject.description || 'Belum ada catatan untuk proyek ini.'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t flex gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>Batal</Button>
                      <Button className="flex-1 bg-blue-600" onClick={handleSaveEdit}>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Simpan
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEdit(selectedProject)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(selectedProject.id!)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Hapus
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
