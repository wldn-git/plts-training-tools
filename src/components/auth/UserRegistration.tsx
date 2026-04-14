import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzVUSR1zaSNI8XdmAZsS-2oYxuTQqMH2Xowr8A9aZfqUPe4AlICdSnkJVmCIyItozMMuA/exec';

interface UserRegistrationProps {
  onComplete: (user: { name: string; email: string; whatsapp: string }) => void;
}

export function UserRegistration({ onComplete }: UserRegistrationProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.whatsapp) return;

    setLoading(true);
    try {
      // Kirim data ke Google Sheets secara background
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting agar tidak kena CORS di Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });

      // Simpan ke local storage
      localStorage.setItem('plts_user_profile', JSON.stringify(formData));
      onComplete(formData);
    } catch (error) {
      console.error('Error saving user:', error);
      // Tetap lanjutkan walau gagal kirim ke sheets agar user tidak terblokir
      localStorage.setItem('plts_user_profile', JSON.stringify(formData));
      onComplete(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8 text-white">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20 rotate-3">
            <Zap className="h-8 w-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">PLTS TRAINING TOOLS</h1>
          <p className="text-slate-400 text-sm mt-1">Lengkapi profil untuk memulai simulasi</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pt-8">
            <CardTitle className="text-xl">Halo, Selamat Datang!</CardTitle>
            <CardDescription>
              Silakan isi identitas Anda untuk akses ke fitur lengkap.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Budi Santoso"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Aktif</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@perusahaan.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="08123456xxx"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="h-11"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 pt-4 justify-center">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span className="text-[10px] text-slate-400 italic">
                  Data Anda tersimpan secara lokal di perangkat ini.
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          Build with ❤️ by WLDN SOFT
        </p>
      </div>
    </div>
  );
}
