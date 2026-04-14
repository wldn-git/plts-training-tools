import { useState, useEffect } from 'react';
import { 
  Sun, Zap, 
  HelpCircle,
  Briefcase, Award, Calculator, Map
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend 
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

export function Dashboard() {
  const projectCount = useLiveQuery(() => db.projects.count());
  const lastQuiz = useLiveQuery(() => db.quizAttempts.orderBy('createdAt').reverse().first());
  const calcCount = useLiveQuery(() => db.calculations.count());
  const projects = useLiveQuery(() => db.projects.toArray());
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('plts_user_profile');
    if (savedUser) {
      const profile = JSON.parse(savedUser);
      setUserName(profile.name.split(' ')[0]); // Ambil nama depan saja
    }
  }, []);

  const projectDistribution = projects ? {
    labels: ['On-Grid', 'Off-Grid', 'Hybrid'],
    datasets: [{
      data: [
        projects.filter(p => p.systemType === 'ON_GRID').length,
        projects.filter(p => p.systemType === 'OFF_GRID').length,
        projects.filter(p => p.systemType === 'HYBRID').length,
      ],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }]
  } : null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 transition-all">
          <h1 className="text-3xl font-bold">Selamat Datang, {userName || 'Rekan'}!</h1>
          <p className="mt-2 text-blue-100 max-w-2xl">
            Asisten pintar untuk perencanaan, instalasi, dan pemeliharaan sistem Panel Surya. 
            Bantu klien Anda mendapatkan sistem terbaik dengan data yang akurat.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/calculators">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Mulai Kalkulasi
              </Button>
            </Link>
            <Link to="/quiz">
              <Button className="bg-white/20 text-white border border-white/60 hover:bg-white/30 backdrop-blur-sm">
                Uji Kemampuan
              </Button>
            </Link>
          </div>
        </div>
        <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-white/10 rotate-12" />
      </div>

      {/* Quick Stats / Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-gray-500">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider">Project Portfolio</CardTitle>
            <Briefcase className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{projectCount || 0}</div>
            <p className="text-[10px] text-blue-600 mt-1 font-bold">
              PROYEK TERSIMPAN
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-gray-500">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider">Score Quiz Terakhir</CardTitle>
            <Award className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${lastQuiz?.passed ? 'text-green-600' : 'text-amber-600'}`}>
              {lastQuiz ? `${lastQuiz.score}%` : '---'}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">
              {lastQuiz ? (lastQuiz.passed ? 'LULUS' : 'BELUM LULUS') : 'BELUM ADA DATA'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-gray-500">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider">Simulasi Selesai</CardTitle>
            <Calculator className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{calcCount || 0}</div>
            <p className="text-[10px] text-gray-400 mt-1 uppercase">
              TOTAL KALKULASI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-gray-500">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider">Potensi Surya</CardTitle>
            <Sun className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-800">4.8 PSH</div>
            <p className="text-[10px] text-green-600 mt-1 font-bold">
              INDONESIA AVG
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tools Grid */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Komposisi Portfolio</CardTitle>
              <CardDescription>Berdasarkan jenis sistem yang direncanakan.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6 h-[250px]">
              {projectDistribution && projects && projects.length > 0 ? (
                <Pie 
                  data={projectDistribution}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Briefcase className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-xs italic">Belum ada data proyek</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Link to="/calculators/psh">
            <Card className="hover:border-blue-300 transition-colors cursor-pointer group h-full">
              <CardHeader>
                <Map className="h-10 w-10 text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Peta PSH</CardTitle>
                <CardDescription>
                  Akses data radiasi matahari real-time untuk seluruh wilayah Indonesia.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="bg-white p-2 rounded-lg border shadow-sm">
            <HelpCircle className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Baru memulai?</h3>
            <p className="text-sm text-gray-600 mt-1">
              Gunakan Toolbox kami untuk memandu Anda melakukan survey lokasi dan menentukan spesifikasi awal yang tepat bagi pelanggan Anda.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
