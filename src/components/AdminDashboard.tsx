import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, RefreshCw, Clipboard, Trash2, Edit, ChevronLeft, ChevronRight, 
  Map, Image as ImageIcon, Sliders, Calendar, DollarSign, FileText, CheckCircle2, UserPlus, Info
} from 'lucide-react';
import { Player, PitchInfo, SessionConfig, RegistrationStatus } from '../types';

interface AdminDashboardProps {
  players: Player[];
  pitchInfo: PitchInfo;
  sessionConfig: SessionConfig;
  updatePitchInfo: (info: Partial<PitchInfo>) => void;
  updateSessionConfig: (config: Partial<SessionConfig>) => void;
  deletePlayer: (id: string) => void;
  editPlayer: (id: string, name: string, count: number) => void;
  resetSession: () => void;
  addPlayerDirect: (name: string, count: number) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function AdminDashboard({
  players,
  pitchInfo,
  sessionConfig,
  updatePitchInfo,
  updateSessionConfig,
  deletePlayer,
  editPlayer,
  resetSession,
  addPlayerDirect,
  showToast,
}: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isScheduledOpeningEnabled, setIsScheduledOpeningEnabled] = useState(sessionConfig.status === 'scheduled');
  
  // States for adding a player directly from admin
  const [newAdminPlayerName, setNewAdminPlayerName] = useState('');
  const [newAdminPlayerCount, setNewAdminPlayerCount] = useState(1);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);

  // States for editing a player
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingCount, setEditingCount] = useState(1);

  const ITEMS_PER_PAGE = 5;
  const totalPlayersRegistered = players.reduce((sum, p) => sum + p.count, 0);

  // Pagination helper
  const totalPages = Math.ceil(players.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlayers = players.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Dynamically formatted chat copy output
  const generateChatText = () => {
    let text = `⚽ *PITCH READY SESSION*\n`;
    text += `สนาม: ${pitchInfo.name}\n`;
    text += `ราคา: ${pitchInfo.price} บาท/คน\n`;
    text += `วันที่: วันนี้\n`;
    text += `โควตา: ${sessionConfig.maxPlayers} คน\n\n`;

    if (players.length === 0) {
      text += `ยังไม่มีผู้เล่นลงทะเบียนจองในขณะนี้`;
    } else {
      players.forEach((p, idx) => {
        const plusTxt = p.count > 1 ? ` (+${p.count - 1})` : '';
        text += `${idx + 1}. ${p.name}${plusTxt} - ${p.time}\n`;
      });
    }

    text += `\nจองแล้วทั้งหมด: ${totalPlayersRegistered}/${sessionConfig.maxPlayers} คน`;
    return text;
  };

  const handleCopyChat = () => {
    const text = generateChatText();
    navigator.clipboard.writeText(text);
    showToast('คัดลอกรูปแบบคิวจองลงคลิปบอร์ดแล้ว! ⚽');
  };

  const handleResetSession = () => {
    if (window.confirm('คุณต้องการรีเซ็ตคิวจองและรายชื่อทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนคืนได้')) {
      resetSession();
      showToast('รีเซ็ตเซสชันสนามฟุตบอลสำเร็จ');
    }
  };

  const handleStatusToggle = () => {
    if (sessionConfig.status === 'open') {
      updateSessionConfig({ status: 'closed' });
      showToast('ปิดรับสมัครลงชื่อจองชั่วคราว');
    } else {
      updateSessionConfig({ status: 'open' });
      setIsScheduledOpeningEnabled(false);
      showToast('เปิดรับสมัครลงชื่อจองสนามแล้ว');
    }
  };

  const handleScheduledToggle = () => {
    const nextVal = !isScheduledOpeningEnabled;
    setIsScheduledOpeningEnabled(nextVal);
    if (nextVal) {
      updateSessionConfig({ status: 'scheduled' });
      showToast('ตั้งค่าเป้าหมายการจองล่วงหน้าแบบตั้งเวลา');
    } else {
      updateSessionConfig({ status: 'open' });
      showToast('เปิดรับจองทันที');
    }
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPlayerName.trim()) return;

    if (totalPlayersRegistered + newAdminPlayerCount > sessionConfig.maxPlayers) {
      showToast('ไม่สามารถจองเกินจำนวนจำกัดสูงสุดของสนามได้', 'error');
      return;
    }

    addPlayerDirect(newAdminPlayerName.trim(), newAdminPlayerCount);
    setNewAdminPlayerName('');
    setNewAdminPlayerCount(1);
    setShowAddPlayerForm(false);
  };

  const handleStartEditing = (p: Player) => {
    setEditingPlayerId(p.id);
    setEditingName(p.name);
    setEditingCount(p.count);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      showToast('กรุณากรอกชื่อผู้เล่น', 'error');
      return;
    }
    
    // Validate bounds
    const otherPlayersTotal = players
      .filter(p => p.id !== editingPlayerId)
      .reduce((sum, p) => sum + p.count, 0);

    if (otherPlayersTotal + editingCount > sessionConfig.maxPlayers) {
      showToast('ไม่สามารถระบุจำนวนผู้เล่นจองเกินลิมิตสนามได้', 'error');
      return;
    }

    editPlayer(editingPlayerId!, editingName.trim(), editingCount);
    setEditingPlayerId(null);
    showToast('อัปเดตข้อมูลผู้เล่นสำเร็จ');
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Top Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#0b1c30]">
            Session Management
          </h1>
          <p className="text-gray-500 font-sans mt-1">
            แผงควบคุมระบบจัดการและติดตามคิวจองสนามแบบเรียลไทม์ ({pitchInfo.name})
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleResetSession}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-sans text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            RESET SESSION
          </button>
          
          <button 
            onClick={handleCopyChat}
            className="flex items-center gap-2 px-5 py-3 bg-[#0b1c30] hover:bg-[#006e2f] text-white font-sans text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Clipboard className="w-4 h-4 text-[#6bff8f]" />
            COPY FOR CHAT
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: CONFIGURATIONS (col-span-4) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Pitch Info Editor Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[#006e2f] mb-4 flex items-center gap-2">
              <Map className="w-4 h-4" /> Pitch Information (ข้อมูลสนาม)
            </h3>

            <div className="space-y-4">
              <div className="relative mb-4 group overflow-hidden rounded-xl border border-gray-200">
                <img 
                  alt="Pitch layout" 
                  className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                  src={pitchInfo.image}
                />
                <div className="absolute bottom-2 right-2">
                  <button 
                    onClick={() => {
                      const newImg = window.prompt('ระบุลิงก์รูปภาพสนามใหม่ (URL):', pitchInfo.image);
                      if (newImg) updatePitchInfo({ image: newImg });
                    }}
                    className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm cursor-pointer border border-gray-200 flex items-center gap-1 text-xs font-bold text-[#006e2f]"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> แก้ไขรูปภาพ
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase font-bold text-gray-500 mb-1">
                  Pitch Name (ชื่อสนาม)
                </label>
                <input 
                  type="text"
                  value={pitchInfo.name}
                  onChange={(e) => updatePitchInfo({ name: e.target.value })}
                  className="w-full h-11 px-3 bg-[#eff4ff] border border-[#bccbb9] rounded-lg font-sans text-sm text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006e2f]"
                />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase font-bold text-gray-500 mb-1">
                  Price per Person (ราคาต่อคน)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    value={pitchInfo.price}
                    onChange={(e) => updatePitchInfo({ price: parseInt(e.target.value) || 0 })}
                    className="w-full h-11 px-3 pr-12 bg-[#eff4ff] border border-[#bccbb9] rounded-lg font-sans text-sm text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006e2f]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    THB
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase font-bold text-gray-500 mb-1">
                  Additional Notes (หมายเหตุเพิ่มเติม)
                </label>
                <textarea 
                  value={pitchInfo.notes}
                  onChange={(e) => updatePitchInfo({ notes: e.target.value })}
                  placeholder="รายละเอียดเพิ่มเติม รายบรรทัด..."
                  className="w-full h-24 p-3 bg-[#eff4ff] border border-[#bccbb9] rounded-lg font-sans text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006e2f] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Availability Control Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[#006e2f] mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Availability Control (ควบคุมระบบลงชื่อ)
            </h3>

            {/* Quick Toggle Status */}
            <div className="flex items-center justify-between p-4 bg-[#eff4ff] rounded-xl mb-4 border border-[#bccbb9]/30">
              <div>
                <p className="font-sans text-xs font-bold text-[#0b1c30]">Registration Status</p>
                <p className={`text-sm font-bold ${sessionConfig.status === 'open' ? 'text-[#006e2f]' : 'text-red-500'}`}>
                  {sessionConfig.status === 'open' ? 'OPENING FOR ENTRIES' : sessionConfig.status === 'scheduled' ? 'SCHEDULED COUNTDOWN' : 'REGISTRATION CLOSED'}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={sessionConfig.status === 'open'}
                  onChange={handleStatusToggle}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#006e2f]"></div>
              </label>
            </div>

            {/* Scheduled opening */}
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-sans text-xs font-bold text-gray-700">Scheduled Opening</p>
                  <p className="text-[10px] text-gray-400">เปิดระบบลงชื่อจองแบบระบุเวลา</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-75">
                  <input 
                    type="checkbox"
                    checked={isScheduledOpeningEnabled}
                    onChange={handleScheduledToggle}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#006e2f]"></div>
                </label>
              </div>

              {isScheduledOpeningEnabled && (
                <div className="relative">
                  <input 
                    type="datetime-local"
                    value={sessionConfig.scheduledTime}
                    onChange={(e) => updateSessionConfig({ scheduledTime: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#bccbb9] rounded-lg font-sans text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#006e2f]"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Set limit size */}
            <div>
              <label className="block font-sans text-xs uppercase font-bold text-gray-500 mb-1">
                Set Max Players (จำกัดจำนวนผู้เล่นสูงสุด)
              </label>
              <input 
                type="number"
                value={sessionConfig.maxPlayers}
                onChange={(e) => updateSessionConfig({ maxPlayers: parseInt(e.target.value) || 18 })}
                className="w-full h-11 px-3 bg-[#eff4ff] border border-[#bccbb9] rounded-lg font-sans text-sm font-bold text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#006e2f]"
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">
                มาตรฐานคือ 18 คน (แบ่งได้ 3 ทีม ทีมละ 6 คน)
              </p>
            </div>
          </div>

          {/* Read Only Copy Text Block Preview */}
          <div className="bg-[#0b1c30] text-white p-6 rounded-2xl shadow-md border-l-4 border-[#006e2f]">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-[#6bff8f] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Chat Summary Export (พรีวิวสำหรับคัดลอก)
            </h3>
            
            <textarea 
              readOnly
              value={generateChatText()}
              className="w-full h-36 bg-white/10 border border-white/20 rounded-lg p-3 font-mono text-xs text-white/90 focus:outline-none resize-none custom-scrollbar"
            />
          </div>

        </div>

        {/* RIGHT PANEL: PARTICIPANT ROSTER (col-span-8) */}
        <div className="md:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0b1c30]">
                  Participant Roster (รายชื่อผู้ลงชื่อจอง)
                </h3>
                <p className="text-xs text-gray-400">จัดการ เพิ่ม ลบ แก้ไข รายชื่อผู้เล่นตัวจริง</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddPlayerForm(!showAddPlayerForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#006e2f] hover:bg-[#005321] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  เพิ่มด่วน
                </button>
              </div>
            </div>

            {/* Direct Add Player Form Drawer */}
            {showAddPlayerForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                onSubmit={handleAddPlayerSubmit}
                className="p-4 bg-[#eff4ff] border-b border-gray-100 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-7">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">ชื่อผู้เล่น</label>
                    <input 
                      type="text"
                      placeholder="เช่น คุณกฤษดา..."
                      value={newAdminPlayerName}
                      onChange={(e) => setNewAdminPlayerName(e.target.value)}
                      required
                      className="w-full h-9 px-3 bg-white border border-[#bccbb9] rounded text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">จำนวนคน</label>
                    <input 
                      type="number"
                      min={1}
                      max={9}
                      value={newAdminPlayerCount}
                      onChange={(e) => setNewAdminPlayerCount(parseInt(e.target.value) || 1)}
                      required
                      className="w-full h-9 px-3 bg-white border border-[#bccbb9] rounded text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button 
                      type="submit"
                      className="w-full h-9 bg-[#0b1c30] hover:bg-[#006e2f] text-white font-bold text-xs rounded cursor-pointer"
                    >
                      ตกลง
                    </button>
                  </div>
                </div>
              </motion.form>
            )}

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b1c30] text-white uppercase text-[10px] font-bold tracking-wider">
                    <th className="px-6 py-4"># คิว</th>
                    <th className="px-6 py-4">ชื่อผู้เล่น / คณะ</th>
                    <th className="px-6 py-4 text-center">จำนวนสมาชิก</th>
                    <th className="px-6 py-4">เวลาลงชื่อ</th>
                    <th className="px-6 py-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-sans">
                  {players.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                        ยังไม่มีข้อมูลผู้จอง... คิวจองว่างเปล่าในปัจจุบัน
                      </td>
                    </tr>
                  ) : (
                    paginatedPlayers.map((player, idx) => {
                      const absoluteRank = players.length - (startIndex + idx);
                      const isEditing = editingPlayerId === player.id;

                      return (
                        <tr key={player.id} className="hover:bg-gray-50/80 transition-colors group">
                          {/* Rank */}
                          <td className="px-6 py-4 font-mono font-bold text-[#006e2f]">
                            {absoluteRank < 10 ? `0${absoluteRank}` : absoluteRank}
                          </td>
                          
                          {/* Name */}
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <input 
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="h-8 px-2 border border-[#bccbb9] rounded bg-white text-xs text-gray-800 focus:outline-none"
                              />
                            ) : (
                              <span className="font-bold text-[#0b1c30]">{player.name}</span>
                            )}
                          </td>

                          {/* Count Plus badges */}
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <input 
                                type="number"
                                min={1}
                                max={9}
                                value={editingCount}
                                onChange={(e) => setEditingCount(parseInt(e.target.value) || 1)}
                                className="w-12 h-8 px-2 border border-[#bccbb9] rounded bg-white text-xs text-center font-bold text-gray-800 focus:outline-none"
                              />
                            ) : (
                              player.count > 1 ? (
                                <span className="px-2 py-1 bg-[#eff4ff] text-[#0b1c30] border border-[#bccbb9] text-xs font-bold rounded-md">
                                  +{player.count - 1} ({player.count} คน)
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">--</span>
                              )
                            )}
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">
                            {player.time}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="px-2 py-1 bg-[#22c55e]/10 text-[#006e2f] border border-[#006e2f]/20 rounded text-xs font-bold cursor-pointer"
                                  >
                                    บันทึก
                                  </button>
                                  <button
                                    onClick={() => setEditingPlayerId(null)}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs cursor-pointer"
                                  >
                                    ยกเลิก
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEditing(player)}
                                    title="แก้ไขชื่อ/จำนวน"
                                    className="p-1.5 text-gray-400 hover:text-[#006e2f] hover:bg-gray-100 rounded-full cursor-pointer transition-all"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`คุณต้องการลบรายชื่อ "${player.name}" คิวนี้ใช่หรือไม่`)) {
                                        deletePlayer(player.id);
                                        showToast('ลบรายการผู้เล่นออกแล้ว');
                                      }
                                    }}
                                    title="ลบคิวจอง"
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between font-sans">
              <span className="text-xs text-gray-500 font-bold uppercase">
                คิวจองรวม: {totalPlayersRegistered} / {sessionConfig.maxPlayers} คน ({players.length} รายการจอง)
              </span>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 border border-[#bccbb9] rounded-lg hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold flex items-center px-1 text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 border border-[#bccbb9] rounded-lg hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Quick Stats Helper */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <Info className="w-6 h-6 text-[#006e2f] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#0b1c30]">ระบบจัดหมวดหมู่อัตโนมัติ</h4>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                คิวจองจะถูกจัดระดับเวลาลงทะเบียนอย่างถูกต้อง รายการที่มีสมาชิกหลายคนจะถูกคำนวณเข้าสู่ระบบอัตราโควตารวมโดยอัตโนมัติ เพื่อป้องกันผู้เล่นล้นสนาม (Overbooking)
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
