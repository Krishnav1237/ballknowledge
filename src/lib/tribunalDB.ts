export interface Fanbase {
  name: string;
  category: string;
  threat: string;
  nickname: string;
}

export interface Achievement {
  title: string;
  desc: string;
  badge: string;
}

export interface Stat {
  label: string;
  name: string;
  val: number;
}

export interface VerdictData {
  id?: string;
  text: string;
  mode: 'take' | 'rival' | 'humble' | 'court';
  caseId: number;
  fanbase: Fanbase | null;
  isRivalry: boolean;
  rarity: string;
  ovr: number;
  rulingText: string; // Chef, Delusion, Terrorist etc.
  verdict: string;
  charge: string;
  sentence: string;
  ach: Achievement;
  stats: Stat[];
  cardTheme?: string;
  countryFlag?: string;
  playerName?: string;
  playerPosition?: string;
  clubBadge?: string;
  clubName?: string;
  avatarStyle?: string;
  avatarSeed?: string;
  aiImageUrl?: string;
  matchScore?: string;
  matchTitle?: string;
  homeFlag?: string;
  awayFlag?: string;
  homeFifaCode?: string;
  awayFifaCode?: string;
  isPredicted?: boolean;
}
