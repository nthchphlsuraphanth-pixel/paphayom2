import { Mail, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#eff4ff] border-t-2 border-[#bccbb9] mt-12 py-8">
      <div className="w-full px-4 md:px-8 flex flex-col md:flex-row justify-between items-center max-w-[1200px] mx-auto gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="font-display text-xl font-bold text-[#0b1c30] uppercase tracking-tight">
            PITCHREADY
          </p>
          <p className="font-sans text-[#3d4a3d] text-sm">
            © 2026 PitchReady. ระบบลงชื่อฟุตบอลหญ้าเทียมอัจฉริยะ.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="#terms" className="text-[#3d4a3d] font-bold text-sm hover:text-[#006e2f] underline transition-all">
              Terms of Service
            </a>
            <a href="#privacy" className="text-[#3d4a3d] font-bold text-sm hover:text-[#006e2f] underline transition-all">
              Privacy Policy
            </a>
            <a href="#support" className="text-[#3d4a3d] font-bold text-sm hover:text-[#006e2f] underline transition-all">
              Contact Support
            </a>
          </nav>
          
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for community matches • <ShieldCheck className="w-3.5 h-3.5 text-[#006e2f]" /> Secure System
          </p>
        </div>
      </div>
    </footer>
  );
}
