export interface Player {
  id: string;
  name: string;
  count: number; // 1 to 9 people
  time: string; // HH:MM:SS format
  isNew?: boolean; // highlight on addition
}

export interface PitchInfo {
  name: string;
  price: number; // THB
  notes: string; // line-by-line bullet points or markdown
  image: string; // hotlinked image URL
}

export type RegistrationStatus = 'open' | 'closed' | 'scheduled';

export interface SessionConfig {
  status: RegistrationStatus;
  scheduledTime: string; // ISO or datetime-local string
  maxPlayers: number;
}

// Initial mock data as shown in the user's screenshots
export const INITIAL_PLAYERS: Player[] = [
  { id: '1', name: 'คุณพงศธร', count: 2, time: '18:45:02' },
  { id: '2', name: 'คุณวิทวัส', count: 1, time: '18:40:15' },
  { id: '3', name: 'ทีมงานจตุจักร', count: 4, time: '18:38:55' },
  { id: '4', name: 'คุณเอ', count: 3, time: '18:30:15' },
];

export const INITIAL_PITCH_INFO: PitchInfo = {
  name: 'Pitch 4',
  price: 150,
  notes: '• กรุณาเตรียมรองเท้าผ้าใบหรือรองเท้าสตั๊ดสำหรับหญ้าเทียม\n• มาถึงก่อนเวลาเริ่ม 15 นาที\n• มีน้ำดื่มให้บริการฟรีที่ข้างสนาม',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAM20UqyYWNQEjoiNNt2mSvd2duvSix1w-aYmAklRJlfiA41preAWi8dtQx_TbdyHWovEZpr5_VrLelE3CQtA49Dxi1LKk_E-iGFcMt4YbqtXS_kgcBgIE5vdWm4_-3G4gCZwvmCaW5g8A_6dEcsJxngK0dj_7s6BJiqRlnD-p5cQj-tFXMDJ0C0LV1X8BouO58OwztGQ8TTsz0BByuroyeEfH6MKCT3b09RB1crwYKrUng9X8Rta1S',
};

export const INITIAL_SESSION_CONFIG: SessionConfig = {
  status: 'open',
  scheduledTime: new Date(Date.now() + 45 * 60 * 1000).toISOString().slice(0, 16), // 45 minutes from now
  maxPlayers: 18,
};
