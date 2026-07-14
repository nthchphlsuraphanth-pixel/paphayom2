/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, onValue, set } from 'firebase/database'; // นำเข้าเครื่องมือจาก Firebase
import { db } from './firebase'; // ดึงท่อเชื่อมต่อที่เราสร้างไว้มาใช้

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

  // --- Core Application State (ซิงค์แบบสด ๆ จากคลาวด์ Firebase) ---
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [pitchInfo, setPitchInfo] = useState<PitchInfo>(INITIAL_PITCH_INFO);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>(INITIAL_SESSION_CONFIG);

  // --- Notifications/Toasts State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // --- ดึงข้อมูลสด ๆ แบบ Real-time จาก Firebase เมื่อมีเครื่องอื่นอัปเดต ---
  useEffect(() => {
    // 1. คอยฟังความเปลี่ยนแปลงของข้อมูลผู้เล่นจองสนาม
    const playersRef = ref(db, 'pitchready_players');
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setPlayers(data);
      } else {
        setPlayers([]);
      }
    });

    // 2. คอยฟังความเปลี่ยนแปลงของข้อมูลการตั้งค่าสนาม
    const pitchInfoRef = ref(db, 'pitchready_pitch_info');
    const unsubscribePitch = onValue(pitchInfoRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setPitchInfo(data);
      }
    });

    // 3. คอยฟังความเปลี่ยนแปลงของรูปแบบข้อมูล Session
    const sessionConfigRef = ref(db, 'pitchready_session_config');
    const unsubscribeSession = onValue(sessionConfigRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setSessionConfig(data);
      }
    });

    // ปิดการเชื่อมต่อเมื่อปิดหน้าเว็บ
    return () => {
      unsubscribePlayers();
      unsubscribePitch();
      unsubscribeSession();
    };
  }, []);

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
    const cleanPlayers = players.map(p => ({ ...p, isNew: false }));
    const newPlayer: Player = {
      id: String(Date.now()),
      name,
      count,
      time: getFormattedTime(),
      isNew: true,
    };

    const updated = [newPlayer, ...cleanPlayers];
    set(ref(db, 'pitchready_players'), updated) // บันทึกตรงเข้า Firebase
      .then(() => showToast(`ลงชื่อ "${name}" (${count} คน) เรียบร้อย! ⚽`));
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
    
    const updated = [newPlayer, ...cleanPlayers];
    set(ref(db, 'pitchready_players'), updated) // บันทึกตรงเข้า Firebase
      .then(() => showToast(`แอดมินลงชื่อ "${name}" สำเร็จ`));
  };

  const deletePlayer = (id: string) => {
    const updated = players.filter(p => p.id !== id);
    set(ref(db, 'pitchready_players'), updated); // บันทึกตรงเข้า Firebase
  };

  const editPlayer = (id: string, name: string, count: number) => {
    const updated = players.map(p => {
      if (p.id === id) {
        return { ...p, name, count };
      }
      return p;
    });
    set(ref(db, 'pitchready_players'), updated); // บันทึกตรงเข้า Firebase
  };

  const resetSession = () => {
    set(ref(db, 'pitchready_players'), []); // สั่งล้างข้อมูลบนคลาวด์ Firebase
  };

  const updatePitchInfo = (info: Partial<PitchInfo>) => {
    const updated = { ...pitchInfo, ...info };
    set(ref(db, 'pitchready_pitch_info'), updated); // เซฟค่าสนามใหม่เข้า Firebase
  };

  const updateSessionConfig = (config: Partial<SessionConfig>) => {
    const updated = { ...sessionConfig, ...config };
    set(ref(db, 'pitchready_session_config'), updated); // เซฟตั้งค่าห้องเข้า Firebase
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface font-sans antialiased text-[#0b1c30]">
      <Header 
        currentScreen={currentScreen}
        setScreen={setScreen}
        isAdminAuthenticated={isAdminAuthenticated}
        logoutAdmin={logoutAdmin}
        showToast={showToast}
      />

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

      <Footer />

      <Toast 
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
