import { 
  Sun, Battery, Zap, TrendingUp, 
  ArrowRight, HelpCircle,
  Briefcase, Award, Calculator
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function Dashboard() {
  const projectCount = useLiveQuery(() => db.projects.count());
  const lastQuiz = useLiveQuery(() => db.quizAttempts.orderBy('createdAt').reverse().first());
  const calcCount = useLiveQuery(() => db.calculations.count());

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 transition-all">
          <h1 className="text-3xl font-bold">Selamat Datang di PLTS Training Tools</h1>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Alat Utama</h2>
          <Link to="/tools" className="text-blue-600 text-sm font-medium flex items-center hover:underline">
            Lihat semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/calculators/string-config">
            <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
              <CardHeader>
                <Zap className="h-10 w-10 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>String Config</CardTitle>
                <CardDescription>
                  Cek kecocokan antara Inverter dan Panel Surya Anda.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/calculators/roi">
            <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Kalkulator ROI</CardTitle>
                <CardDescription>
                  Hitung penghematan listrik dan masa balik modal (BEP).
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/calculators/battery-sizing">
            <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
              <CardHeader>
                <Battery className="h-10 w-10 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Sizing Baterai</CardTitle>
                <CardDescription>
                  Tentukan kapasitas baterai untuk sistem Hybrid/Off-grid.
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
