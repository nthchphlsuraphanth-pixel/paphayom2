/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import UserView from './components/UserView';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { 
  Player, PitchInfo, SessionConfig, 
  INITIAL_PLAYERS, INITIAL_PITCH_INFO, INITIAL_SESSION_CONFIG 
} from './types';

export default function App() {
  // --- Screen Routing ---
  const [currentScreen, setScreen] = useState<'user' | 'login' | 'admin'>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pitchready_admin_auth') === 'true';
  });

  // --- Core Application State (Persistent via LocalStorage) ---
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('pitchready_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [pitchInfo, setPitchInfo] = useState<PitchInfo>(() => {
    const saved = localStorage.getItem('pitchready_pitch_info');
    return saved ? JSON.parse(saved) : INITIAL_PITCH_INFO;
  });

  const [sessionConfig, setSessionConfig] = useState<SessionConfig>(() => {
    const saved = localStorage.getItem('pitchready_session_config');
    return saved ? JSON.parse(saved) : INITIAL_SESSION_CONFIG;
  });

  // --- Notifications/Toasts State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // --- Sync State to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('pitchready_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('pitchready_pitch_info', JSON.stringify(pitchInfo));
  }, [pitchInfo]);

  useEffect(() => {
    localStorage.setItem('pitchready_session_config', JSON.stringify(sessionConfig));
  }, [sessionConfig]);

  // --- Helper Routines ---
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToastMessage(msg);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem('pitchready_admin_auth', 'true');
    setScreen('admin');
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('pitchready_admin_auth');
    setScreen('user');
  };

  // Create formatted timestamp (HH:MM:SS)
  const getFormattedTime = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const addPlayer = (name: string, count: number) => {
    // Clear the "isNew" flag on previous players first
    const cleanPlayers = players.map(p => ({ ...p, isNew: false }));

    const newPlayer: Player = {
      id: String(Date.now()),
      name,
      count,
      time: getFormattedTime(),
      isNew: true,
    };

    // Prepend to array so the newest is index 0 (top of list)
    setPlayers([newPlayer, ...cleanPlayers]);
    showToast(`ลงชื่อ "${name}" (${count} คน) เรียบร้อย! ⚽`);
  };

  const addPlayerDirect = (name: string, count: number) => {
    const cleanPlayers = players.map(p => ({ ...p, isNew: false }));
    const newPlayer: Player = {
      id: String(Date.now()),
      name,
      count,
      time: getFormattedTime(),
      isNew: true,
    };
    setPlayers([newPlayer, ...cleanPlayers]);
    showToast(`แอดมินลงชื่อ "${name}" สำเร็จ`);
  };

  const deletePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const editPlayer = (id: string, name: string, count: number) => {
    setPlayers(players.map(p => {
      if (p.id === id) {
        return { ...p, name, count };
      }
      return p;
    }));
  };

  const resetSession = () => {
    setPlayers([]);
  };

  const updatePitchInfo = (info: Partial<PitchInfo>) => {
    setPitchInfo(prev => ({ ...prev, ...info }));
  };

  const updateSessionConfig = (config: Partial<SessionConfig>) => {
    setSessionConfig(prev => ({ ...prev, ...config }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface font-sans antialiased text-[#0b1c30]">
      {/* Sticky Top Header */}
      <Header 
        currentScreen={currentScreen}
        setScreen={setScreen}
        isAdminAuthenticated={isAdminAuthenticated}
        logoutAdmin={logoutAdmin}
        showToast={showToast}
      />

      {/* Main Container Stage */}
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentScreen === 'user' && (
            <motion.div
              key="user-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <UserView 
                players={players}
                pitchInfo={pitchInfo}
                sessionConfig={sessionConfig}
                addPlayer={addPlayer}
                showToast={showToast}
                setScreen={setScreen}
              />
            </motion.div>
          )}

          {currentScreen === 'login' && (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AdminLogin 
                onLoginSuccess={handleAdminLoginSuccess}
                showToast={showToast}
              />
            </motion.div>
          )}

          {currentScreen === 'admin' && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {isAdminAuthenticated ? (
                <AdminDashboard 
                  players={players}
                  pitchInfo={pitchInfo}
                  sessionConfig={sessionConfig}
                  updatePitchInfo={updatePitchInfo}
                  updateSessionConfig={updateSessionConfig}
                  deletePlayer={deletePlayer}
                  editPlayer={editPlayer}
                  resetSession={resetSession}
                  addPlayerDirect={addPlayerDirect}
                  showToast={showToast}
                />
              ) : (
                <div className="text-center py-20 font-sans">
                  <p className="text-red-500 font-bold mb-4">เข้าสู่ระบบไม่ถูกต้องกรุณาเข้าสู่ระบบใหม่</p>
                  <button 
                    onClick={() => setScreen('login')}
                    className="px-6 py-2.5 bg-[#006e2f] text-white font-bold rounded"
                  >
                    เข้าสู่หน้าเข้าสู่ระบบ
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Global Interactive Notification Toast */}
      <Toast 
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}

