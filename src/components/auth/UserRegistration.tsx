import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Zap, ShieldCheck, ArrowRight, Loader2, KeyRound, Mail, Edit3, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZCHajoMtY4Wh_4Mm8FbOQTUcThwcWBSpRDb-Q_A66t2OjXkFKOqwGjOWraHUrjK9AMg/exec';

interface UserRegistrationProps {
  onComplete: (user: { name: string; email: string; whatsapp: string }) => void;
}

export function UserRegistration({ onComplete }: UserRegistrationProps) {
  const [step, setStep] = useState<'REGISTER' | 'VERIFY_OTP'>('REGISTER');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  // OTP state
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [userOtp, setUserOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (step === 'VERIFY_OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Generate 6-digit OTP code
  const generateRandomOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  // Step 1: Submit Form & Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.whatsapp.trim()) {
      setErrorMsg('Mohon lengkapi semua bidang.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMsg('Format email tidak valid. Gunakan email aktif.');
      return;
    }

    setLoading(true);
    const otpCode = generateRandomOtp();
    console.log('🔑 [DEMO / DEBUG OTP CODE]:', otpCode);

    try {
      // Kirim request ke Google Apps Script via URLSearchParams (Form Encoded)
      const params = new URLSearchParams();
      params.append('action', 'send_otp');
      params.append('name', formData.name);
      params.append('email', formData.email);
      params.append('whatsapp', formData.whatsapp);
      params.append('otp', otpCode);
      params.append('userAgent', navigator.userAgent);
      params.append('timestamp', new Date().toISOString());

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: params,
      });
    } catch (err) {
      console.error('Apps Script fetch failed:', err);
    } finally {
      setLoading(false);
      setStep('VERIFY_OTP');
      setTimer(60);
      setCanResend(false);
      setUserOtp(['', '', '', '', '', '']);
    }
  };

  // Handle OTP digit inputs
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newOtp = [...userOtp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setUserOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, '');
    const newOtp = [...userOtp];
    newOtp[index] = cleanVal;
    setUserOtp(newOtp);

    // Auto move focus to next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !userOtp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const enteredCode = userOtp.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    if (enteredCode !== generatedOtp) {
      setErrorMsg('Kode OTP tidak sesuai. Silakan periksa kembali email Anda.');
      return;
    }

    // Success OTP Verification
    setIsVerified(true);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('action', 'verified_registration');
      params.append('name', formData.name);
      params.append('email', formData.email);
      params.append('whatsapp', formData.whatsapp);
      params.append('status', 'VERIFIED');
      params.append('timestamp', new Date().toISOString());

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: params,
      });
    } catch (err) {
      console.error('Error logging verified user:', err);
    }

    setTimeout(() => {
      localStorage.setItem('plts_user_profile', JSON.stringify(formData));
      onComplete(formData);
    }, 1000);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setErrorMsg(null);
    setLoading(true);
    const newOtp = generateRandomOtp();
    console.log('🔑 [DEMO / DEBUG RESENT OTP CODE]:', newOtp);

    try {
      const params = new URLSearchParams();
      params.append('action', 'resend_otp');
      params.append('name', formData.name);
      params.append('email', formData.email);
      params.append('whatsapp', formData.whatsapp);
      params.append('otp', newOtp);
      params.append('timestamp', new Date().toISOString());

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: params,
      });
    } catch (err) {
      console.error('Resend OTP error:', err);
    } finally {
      setLoading(false);
      setTimer(60);
      setCanResend(false);
      setUserOtp(['', '', '', '', '', '']);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 overflow-y-auto select-none relative"
    >
      {/* 1. Dynamic Mouse Cursor Spotlight Layer */}
      <div 
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.22), rgba(79, 70, 229, 0.12) 40%, transparent 80%)`
        }}
      />

      {/* 2. Floating Animated Gradient Orbs */}
      <div className="pointer-events-none absolute top-10 left-10 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute bottom-10 right-10 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse duration-1000" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />

      {/* 3. Tech Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#3b82f61a_1px,transparent_1px)] [background-size:28px_28px] opacity-70" />

      {/* Main Registration Content Container */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6 text-white">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 shadow-2xl shadow-blue-500/40 rotate-3 hover:rotate-6 transition-all duration-300 hover:scale-105 cursor-pointer">
            <Zap className="h-8 w-8 text-white fill-white animate-bounce" />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
            PLTS Training Tools
          </h1>
          <p className="text-blue-300/80 text-xs font-medium mt-0.5 tracking-wide">
            Otentikasi Akun & Akses Simulator
          </p>
        </div>

        <Card className="border border-slate-800 hover:border-blue-500/40 shadow-[0_0_50px_-12px_rgba(37,99,235,0.3)] transition-all duration-500 backdrop-blur-xl bg-white/95 overflow-hidden">
          {step === 'REGISTER' ? (
            <>
              <CardHeader className="space-y-1 pt-6 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>Halo, Selamat Datang!</span>
                </CardTitle>
                <CardDescription>
                  Masukkan alamat email aktif untuk menerima 6-digit kode verifikasi OTP.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs">Nama Lengkap</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Budi Santoso"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email Aktif (Tempat Menerima OTP)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-10 text-sm pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp" className="text-xs">Nomor WhatsApp / Telp</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      placeholder="08123456xxx"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim Kode OTP...
                        </>
                      ) : (
                        <>
                          Kirim Kode OTP (Email) <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 pt-2 justify-center">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span className="text-[10px] text-slate-400 italic">
                      Alamat email diwajibkan valid untuk verifikasi akun.
                    </span>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              {/* STEP 2: VERIFY OTP SCREEN */}
              <CardHeader className="space-y-1 pt-6 pb-2 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                  <KeyRound className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Verifikasi Kode OTP</CardTitle>
                <CardDescription className="text-xs">
                  Kode OTP 6-digit telah dikirimkan ke email: <br />
                  <strong className="text-gray-900 font-bold">{formData.email}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-6 space-y-4">
                {isVerified ? (
                  <div className="py-6 flex flex-col items-center gap-3 text-center animate-in zoom-in-95">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <p className="font-bold text-green-600">Verifikasi Berhasil!</p>
                    <p className="text-xs text-gray-500">Membuka aplikasi simulasi PLTS...</p>
                  </div>
                ) : (
                  <>
                    {errorMsg && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* 6 Digit Input Boxes */}
                    <div className="flex justify-center gap-2 py-2">
                      {userOtp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { inputRefs.current[idx] = el; }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-gray-50/50"
                        />
                      ))}
                    </div>

                    <Button
                      onClick={handleVerifyOtp}
                      disabled={loading || userOtp.join('').length < 6}
                      className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-bold transition-all shadow-md shadow-green-500/20"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Verifikasi & Lanjutkan'
                      )}
                    </Button>

                    {/* Timer & Resend */}
                    <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                      <button
                        type="button"
                        onClick={() => { setStep('REGISTER'); setErrorMsg(null); }}
                        className="text-gray-400 hover:text-gray-600 flex items-center gap-1 font-medium"
                      >
                        <Edit3 className="h-3 w-3" /> Ubah Email
                      </button>

                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Kirim Ulang OTP
                        </button>
                      ) : (
                        <span className="text-gray-400 font-mono">
                          Kirim ulang dalam <strong className="text-blue-600">{timer}s</strong>
                        </span>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center mt-4 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          Build with ❤️ by WLDN SOFT
        </p>
      </div>
    </div>
  );
}
