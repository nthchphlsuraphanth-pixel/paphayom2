import { motion } from 'motion/react';
import { Bell, CircleUser, LogOut, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentScreen: 'user' | 'login' | 'admin';
  setScreen: (screen: 'user' | 'login' | 'admin') => void;
  isAdminAuthenticated: boolean;
  logoutAdmin: () => void;
  showToast: (msg: string) => void;
}

export default function Header({
  currentScreen,
  setScreen,
  isAdminAuthenticated,
  logoutAdmin,
  showToast,
}: HeaderProps) {
  const handleNavClick = (screen: 'user' | 'login' | 'admin') => {
    if (screen === 'admin' && !isAdminAuthenticated) {
      setScreen('login');
    } else {
      setScreen(screen);
    }
  };

  const handleNotificationClick = () => {
    showToast('ไม่มีการแจ้งเตือนใหม่ในขณะนี้ ⚽');
  };

  const handleProfileClick = () => {
    showToast(isAdminAuthenticated ? 'เข้าสู่ระบบในฐานะผู้ดูแลระบบ' : 'กรุณาเข้าสู่ระบบเพื่อใช้งานเพิ่มเติม');
  };

  return (
    <header className="bg-[#0b1c30] border-b-2 border-brand-green shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setScreen('user')}>
          <h1 className="font-display text-2xl md:text-3xl text-[#6bff8f] uppercase tracking-tighter font-extrabold flex items-center gap-2">
            PITCHREADY
          </h1>
          {isAdminAuthenticated && (
            <span className="hidden sm:inline-block px-3 py-1 bg-[#006e2f] text-white font-sans text-xs font-bold rounded-md tracking-wider">
              ADMIN PANEL
            </span>
          )}
        </div>

        <nav className="hidden md:flex gap-8 items-center h-full relative">
          <button
            onClick={() => handleNavClick('user')}
            className={`relative py-1 text-sm font-bold tracking-wide uppercase transition-colors duration-200 cursor-pointer ${
              currentScreen === 'user' ? 'text-[#6bff8f]' : 'text-[#dae2fd] hover:text-white'
            }`}
          >
            Sign Up
            {currentScreen === 'user' && (
              <motion.div
                layoutId="nav-underline"
                className="absolute left-0 right-0 bottom-[-8px] h-[3px] bg-[#6bff8f]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`relative py-1 text-sm font-bold tracking-wide uppercase transition-colors duration-200 cursor-pointer ${
              currentScreen === 'admin' || currentScreen === 'login'
                ? 'text-[#6bff8f]'
                : 'text-[#dae2fd] hover:text-white'
            }`}
          >
            Admin Panel
            {(currentScreen === 'admin' || currentScreen === 'login') && (
              <motion.div
                layoutId="nav-underline"
                className="absolute left-0 right-0 bottom-[-8px] h-[3px] bg-[#6bff8f]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={handleNotificationClick}
            className="text-[#6bff8f] cursor-pointer p-2 hover:bg-white/10 rounded-full transition-all relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0b1c30]" />
          </button>

          <button
            onClick={handleProfileClick}
            className="text-[#6bff8f] cursor-pointer p-2 hover:bg-white/10 rounded-full transition-all"
            title="User Profile"
          >
            <CircleUser className="w-5 h-5" />
          </button>

          {isAdminAuthenticated && (
            <button
              onClick={() => {
                logoutAdmin();
                showToast('ออกจากระบบผู้ดูแลแล้ว');
              }}
              className="ml-2 text-red-400 hover:text-red-300 cursor-pointer p-2 hover:bg-red-500/10 rounded-full transition-all"
              title="Logout Admin"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
