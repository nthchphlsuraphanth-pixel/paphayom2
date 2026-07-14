import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Bolt, Clock, CheckCircle2, Search, Info, MapPin, Map, Plus, Check
} from 'lucide-react';
import { Player, PitchInfo, SessionConfig } from '../types';

interface UserViewProps {
  players: Player[];
  pitchInfo: PitchInfo;
  sessionConfig: SessionConfig;
  addPlayer: (name: string, count: number) => void;
  showToast: (msg: string) => void;
  setScreen: (screen: 'user' | 'login' | 'admin') => void;
}

export default function UserView({
  players,
  pitchInfo,
  sessionConfig,
  addPlayer,
  showToast,
  setScreen,
}: UserViewProps) {
  const [playerName, setPlayerName] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  // Time remaining for Scheduled countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 45, seconds: 12 });

  // Running countdown timer
  useEffect(() => {
    if (sessionConfig.status !== 'scheduled') return;

    // We can simulate a countdown based on the scheduledTime setting
    const calculateTimeLeft = () => {
      const difference = +new Date(sessionConfig.scheduledTime) - +new Date();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Initialize
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const calculated = calculateTimeLeft();
      setTimeLeft(calculated);
      
      // If countdown completes, can notify or let them know
      if (calculated.hours === 0 && calculated.minutes === 0 && calculated.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionConfig.status, sessionConfig.scheduledTime]);

  const totalRegistered = players.reduce((sum, p) => sum + p.count, 0);
  const remainingSpots = Math.max(0, sessionConfig.maxPlayers - totalRegistered);
  const isFull = remainingSpots <= 0;

  // Filter players for search
  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Limit displayed players unless "showAll" is toggled
  const displayedPlayers = showAllPlayers ? filteredPlayers : filteredPlayers.slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionConfig.status !== 'open') {
      showToast('ไม่สามารถจองได้: ขณะนี้ปิดรับสมัครลงชื่อ');
      return;
    }
    if (isFull) {
      showToast('ขออภัย! เต็มโควตา 18 คนแล้ว');
      return;
    }
    if (selectedQuantity > remainingSpots) {
      showToast(`จำนวนคนเกินกว่าที่ว่างเหลือ! เหลือที่ว่างเพียง ${remainingSpots} ที่นั่ง`);
      return;
    }

    if (!playerName.trim()) {
      showToast('กรุณาระบุชื่อผู้เล่นหรือชื่อทีมของคุณ');
      return;
    }

    addPlayer(playerName.trim(), selectedQuantity);
    setPlayerName('');
    setSelectedQuantity(3); // Reset to default 3
  };

  const formatCountdown = () => {
    const hh = String(timeLeft.hours).padStart(2, '0');
    const mm = String(timeLeft.minutes).padStart(2, '0');
    const ss = String(timeLeft.seconds).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: HERO, STATS & BOOKING FORM */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border-l-[6px] flex items-center justify-between shadow-sm transition-all duration-300 ${
            sessionConfig.status === 'open' && !isFull
              ? 'bg-[#22c55e] text-[#004b1e] border-[#006e2f]'
              : isFull
              ? 'bg-amber-100 text-amber-800 border-amber-600'
              : 'bg-red-50 text-red-800 border-red-600'
          }`}
        >
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              {sessionConfig.status === 'open' && !isFull && 'เปิดลงชื่อ - พร้อมลงสนาม!'}
              {sessionConfig.status === 'open' && isFull && 'ลงชื่อครบจำนวนแล้ว!'}
              {sessionConfig.status === 'closed' && 'ปิดลงชื่อชั่วคราว'}
              {sessionConfig.status === 'scheduled' && 'เตรียมพร้อมลงสนาม!'}
            </h2>
            <p className="font-sans text-sm md:text-base opacity-90 mt-1">
              {sessionConfig.status === 'open' && !isFull && 'มาร่วมสนุกกัน พลิกเกมให้เป็นตำนาน'}
              {sessionConfig.status === 'open' && isFull && 'ตัวจริงเต็มโควตาแล้ว ติดตามรายชื่อสำรองหรือเปิดรอบใหม่'}
              {sessionConfig.status === 'closed' && 'ผู้ดูแลระบบปิดรับการลงชื่อจองสนามชั่วคราว'}
              {sessionConfig.status === 'scheduled' && 'ระบบกำลังจะเปิดให้ลงชื่อจองสนามเร็วๆ นี้'}
            </p>
          </div>
          <div className="hidden sm:block">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="text-4xl"
            >
              ⚽
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Players Card */}
          <div className="bg-[#0b1c30] p-6 rounded-2xl text-white relative overflow-hidden shadow-lg border border-white/5">
            <div className="relative z-10">
              <p className="font-sans text-xs text-[#6bff8f] font-bold uppercase tracking-widest mb-1">
                จำนวนคนปัจจุบัน
              </p>
              <p className="font-display text-3xl md:text-4xl font-extrabold text-[#6bff8f]">
                {totalRegistered} <span className="text-lg md:text-xl text-white/50">/ {sessionConfig.maxPlayers}</span>
              </p>
            </div>
            <Users className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 opacity-20 rotate-12 pointer-events-none" />
          </div>

          {/* Remaining Spots Card */}
          <div className="bg-[#006e2f] p-6 rounded-2xl text-white border-b-4 border-[#005321] relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <p className="font-sans text-xs text-white/80 font-bold uppercase tracking-widest mb-1">
                ที่ว่างเหลือ
              </p>
              <p className="font-display text-3xl md:text-4xl font-extrabold">
                {remainingSpots}
              </p>
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalRegistered / sessionConfig.maxPlayers) * 100)}%` }}
                  className="bg-[#6bff8f] h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Card */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-md relative">
          <div className="border-l-4 border-[#006e2f] pl-4 mb-6">
            <h3 className="font-display text-xl md:text-2xl font-bold text-[#0b1c30]">
              ลงชื่อจองสนาม
            </h3>
            <p className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-0.5">
              Secure spot booking form
            </p>
          </div>

          {/* If Scheduled Countdown Alert Box */}
          {sessionConfig.status === 'scheduled' && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#006e2f]/5 border-2 border-[#006e2f] rounded-2xl p-6 mb-6 flex flex-col items-center justify-center text-center shadow-inner"
            >
              <Clock className="w-10 h-10 text-[#006e2f] mb-2 animate-pulse" />
              <h4 className="font-display text-lg font-bold text-[#006e2f] mb-1">
                เปิดลงชื่อในอีก...
              </h4>
              <p className="font-mono text-3xl md:text-4xl font-extrabold text-[#0b1c30] tracking-widest">
                {formatCountdown()}
              </p>
            </motion.div>
          )}

          {/* If Closed Alert Box */}
          {sessionConfig.status === 'closed' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center text-center">
              <Info className="w-10 h-10 text-red-600 mb-2" />
              <h4 className="font-display text-lg font-bold text-red-800 mb-1">
                งดรับจองชั่วคราว
              </h4>
              <p className="font-sans text-sm text-red-600">
                ผู้ดูแลสนามปิดการลงชื่อเข้าร่วมในเซสชันนี้ชั่วคราว กรุณาติดต่อผู้ดูแลระบบ
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Name */}
            <div>
              <label className="block font-sans text-xs uppercase font-bold tracking-wider text-[#0b1c30] mb-2">
                ชื่อผู้เล่น / ชื่อทีม
              </label>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={sessionConfig.status !== 'open' || isFull}
                placeholder={isFull ? "ที่จองเต็มแล้ว..." : "ระบุชื่อของคุณ..."}
                required
                className="w-full h-14 px-4 bg-[#eff4ff] border border-[#bccbb9] rounded-xl font-sans text-base text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Quantity Selector 1-9 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-sans text-xs uppercase font-bold tracking-wider text-[#0b1c30]">
                  จำนวนคน (1-9 คน)
                </label>
                <span className="text-xs text-gray-500">
                  {selectedQuantity} คนคิวจอง
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const isActive = selectedQuantity === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={sessionConfig.status !== 'open' || isFull}
                      onClick={() => setSelectedQuantity(num)}
                      className={`h-12 border-2 rounded-xl flex items-center justify-center font-display font-bold text-sm cursor-pointer transition-all ${
                        isActive
                          ? 'border-[#006e2f] bg-[#22c55e]/20 text-[#006e2f] scale-105 shadow-sm'
                          : 'border-[#bccbb9] text-[#0b1c30] hover:bg-[#006e2f]/5'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: (sessionConfig.status !== 'open' || isFull) ? 1 : 1.01 }}
              whileTap={{ scale: (sessionConfig.status !== 'open' || isFull) ? 1 : 0.98 }}
              disabled={sessionConfig.status !== 'open' || isFull}
              type="submit"
              className="w-full h-16 bg-[#0b1c30] hover:bg-[#006e2f] text-white rounded-xl font-display font-bold text-lg uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md group disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              <span>{isFull ? 'คิวจองเต็มแล้ว' : 'ลงชื่อเข้าร่วม'}</span>
              <Bolt className="w-5 h-5 group-hover:translate-y-[-1px] transition-transform text-[#6bff8f]" />
            </motion.button>
          </form>
        </section>
      </div>

      {/* RIGHT COLUMN: LEADERBOARD, IMAGE, PITCH INFO */}
      <aside className="lg:col-span-5 space-y-8">
        
        {/* Leaderboard / List of Sign-ups */}
        <div className="bg-[#0b1c30] rounded-3xl overflow-hidden shadow-xl border border-white/5">
          <div className="bg-[#006e2f] px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-sans text-xs uppercase font-bold tracking-wider flex items-center gap-2">
              <span className="text-[#6bff8f]">📋</span> ลำดับการลงชื่อ
            </h3>
            <span className="text-white/70 text-xs font-sans font-medium">
              อัปเดตเมื่อ: เมื่อสักครู่
            </span>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-white/10 bg-[#0b1c30]">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหารายชื่อผู้เล่น..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white/10 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#6bff8f] focus:border-transparent font-sans"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto custom-scrollbar">
            {filteredPlayers.length === 0 ? (
              <div className="px-6 py-10 text-center text-white/50 italic text-sm font-sans">
                {searchQuery ? 'ไม่พบชื่อที่ค้นหา' : 'ยังไม่มีผู้ลงชื่อจองสนาม...'}
              </div>
            ) : (
              displayedPlayers.map((player, index) => {
                // Determine if this is the absolute newest added (last item in our chronological array)
                const isAbsoluteNewest = players.length > 0 && players[0].id === player.id;
                
                return (
                  <motion.div
                    key={player.id}
                    initial={player.isNew ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    className={`px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all duration-300 ${
                      isAbsoluteNewest 
                        ? 'bg-[#006e2f]/10 border-l-4 border-[#006e2f]' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-[#6bff8f] opacity-85">
                        {players.length - index}.
                      </span>
                      <div>
                        <p className="font-sans font-bold text-white text-base">
                          {player.name} <span className="text-[#6bff8f] font-mono text-sm">({player.count} คน)</span>
                        </p>
                        <p className="text-xs text-white/50 font-sans flex items-center gap-1 mt-0.5">
                          {isAbsoluteNewest ? (
                            <span className="bg-[#006e2f] text-white px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mr-1 animate-pulse">
                              ล่าสุด
                            </span>
                          ) : null}
                          {player.time}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className={`w-5 h-5 ${isAbsoluteNewest ? 'text-[#6bff8f]' : 'text-white/20'}`} />
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Toggle show all */}
          {filteredPlayers.length > 5 && (
            <div className="p-4 bg-white/5 text-center border-t border-white/5">
              <button
                onClick={() => setShowAllPlayers(!showAllPlayers)}
                className="text-[#6bff8f]/70 text-sm font-sans hover:text-[#6bff8f] transition-colors cursor-pointer py-1"
              >
                {showAllPlayers ? 'แสดงน้อยลง' : `ดูรายชื่อทั้งหมด (${filteredPlayers.length} รายการ)...`}
              </button>
            </div>
          )}
        </div>

        {/* Contextual Pitch Card & Notes */}
        <div className="space-y-4">
          <div className="relative h-64 rounded-3xl overflow-hidden group shadow-lg border border-gray-100">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
              style={{ backgroundImage: `url(${pitchInfo.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30] via-[#0b1c30]/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
              <div>
                <span className="bg-[#006e2f] text-white text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-sans font-bold mb-2 inline-block">
                  Pitch Details
                </span>
                <h4 className="text-white font-display text-xl md:text-2xl font-bold leading-tight">
                  {pitchInfo.name} @ Bangkok Football Arena
                </h4>
              </div>
              
              <button 
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                className="text-[#6bff8f] flex items-center gap-1 text-xs font-sans font-bold uppercase tracking-widest hover:underline cursor-pointer bg-[#0b1c30]/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10"
              >
                MAP <Map className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Expanded simulated Map */}
          <AnimatePresence>
            {isMapExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-[#eff4ff] border border-[#bccbb9] rounded-2xl p-4 shadow-inner"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-red-500" /> แผนที่สนามฟุตบอลจำลอง
                  </span>
                  <button 
                    onClick={() => setIsMapExpanded(false)}
                    className="text-xs text-gray-500 hover:text-red-500 cursor-pointer font-bold"
                  >
                    ปิดแผนที่
                  </button>
                </div>
                {/* Visual Representation of Map Grid */}
                <div className="h-40 bg-white border border-[#bccbb9] rounded-xl relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 pitch-grid-bg opacity-30"></div>
                  {/* Outer boundaries of soccer pitch */}
                  <div className="absolute w-[90%] h-[80%] border-2 border-[#006e2f]/20 rounded flex items-center justify-center">
                    <div className="absolute h-full w-[2px] bg-[#006e2f]/20"></div>
                    <div className="absolute w-12 h-12 border-2 border-[#006e2f]/20 rounded-full"></div>
                  </div>
                  {/* Active Pin */}
                  <div className="relative z-10 flex flex-col items-center animate-bounce">
                    <MapPin className="w-8 h-8 text-red-600 fill-red-600" />
                    <span className="bg-[#0b1c30] text-white text-[10px] px-2 py-0.5 rounded shadow font-sans mt-1">
                      {pitchInfo.name}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-sans italic text-center">
                  ถ. รัชดาภิเษก, แขวงจอมพล, เขตจตุจักร, กรุงเทพมหานคร 10900 (ใกล้ MRT รัชดาภิเษก)
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Price & Notes Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="font-sans text-xs font-bold text-gray-500 uppercase tracking-widest">
                อัตราค่าสนาม
              </span>
              <span className="font-display font-bold text-xl text-[#006e2f]">
                {pitchInfo.price} บาท/คน
              </span>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
              <h5 className="font-sans text-xs uppercase font-bold tracking-widest text-[#0b1c30] mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#006e2f]" /> หมายเหตุและระเบียบสนาม
              </h5>
              <ul className="text-sm text-gray-600 space-y-2 font-sans">
                {pitchInfo.notes.split('\n').map((noteLine, i) => (
                  <li key={i}>{noteLine}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Admin shortcut button */}
          <div className="text-center pt-2">
            <button
              onClick={() => setScreen('login')}
              className="text-xs text-[#006e2f] hover:text-[#0b1c30] hover:underline font-sans font-bold"
            >
              🔒 เข้าสู่ระบบในฐานะผู้ดูแล (Admin Login)
            </button>
          </div>

        </div>
      </aside>
    </div>
  );
}
