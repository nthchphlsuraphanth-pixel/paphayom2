import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Shield, ArrowRight, Loader2, KeyRound } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function AdminLogin({ onLoginSuccess, showToast }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const CORRECT_PASS = '11212211667856';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === CORRECT_PASS) {
        showToast('เข้าสู่ระบบสิทธิ์ผู้ดูแลสำเร็จ! 🔒');
        onLoginSuccess();
      } else {
        showToast('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง', 'error');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleAutoFill = () => {
    setPassword("");
    showToast('ลงชื่อเล่นไปเฉยๆไอควาย');
  };

  return (
    <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-8 min-h-[70vh]">
      {/* Decorative Parallax Grid Background */}
      <div className="absolute inset-0 pitch-grid-bg opacity-20 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#dae2fd]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border-t-4 border-[#006e2f] z-10"
      >
        {/* Header Photo */}
        <div className="h-44 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10" />
          <img 
            className="w-full h-full object-cover" 
            alt="Pristine synthetic football pitch under stadium lights"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkB58K-vupETE5UYf4oTklka1tqCe4EvL4eqIrmeLSuF_y0VXPpJa6Nr7JsLiKLihX1QIWHiN61fwtpkXOI4NlIPQvOIHE6ghqXfSWTvynK6PTXF4gjT5M0rnBRw32u0FMCPMqhmidrPUO8RkzGGCzvshvv9yLIyT_T2EmAoijFwgkVdGTwLL-1My3ntsvMEKyXmLX3E84-723yViWvYgMQvwMUjQqdJwky3KzzN6CCfrPAhg812RW"
          />
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-[#006e2f] text-white font-sans text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3 h-3" /> Secure Access
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-10">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-[#0b1c30] tracking-tight">
              Admin Access
            </h1>
            <p className="font-sans text-sm text-gray-500 mt-1">
              กรุณาระบุรหัสผ่านเข้าสู่ระบบหลังบ้านเพื่อจัดการรายชื่อและคิวจองสนาม
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password input */}
            <div className="space-y-2">
              <label className="block font-sans text-xs uppercase font-bold tracking-wider text-gray-600">
                Administrator Password
              </label>
              
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  required
                  className="w-full h-14 px-4 pr-12 bg-[#eff4ff] border-2 border-[#bccbb9] focus:border-[#006e2f] focus:ring-0 rounded-xl transition-all font-mono text-base tracking-widest text-[#0b1c30]"
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#006e2f] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

          

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-[#0b1c30] hover:bg-[#006e2f] text-[#eff4ff] hover:text-white font-display font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>LOGIN</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Card Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs font-sans">
              <a href="#forgot" className="text-[#006e2f] font-bold hover:underline">
                ลืมรหัสผ่าน?
              </a>
              <span className="text-gray-400 uppercase font-bold tracking-widest text-[10px]">
                SYSTEM V2.4.0
              </span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
