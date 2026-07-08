'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredProfile, getStoredPredictions } from '@/lib/profileSync';
import { parseLocalDate, isSameUTCDate } from '@/lib/matchUtils';
import FlagImage from '@/components/FlagImage';

// Inline SVG icons — avoids Turbopack module-factory issues with lucide-react tree-shaking
const IconTrophy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconPlay = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);


interface Team {
  id: string;
  name_en: string;
  flag: string;
  fifa_code: string;
  groups: string;
}

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  finished: string;
  time_elapsed: string;
  type: string;
  stadium_id: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_team_label?: string;
  away_team_label?: string;
}

interface GroupStanding {
  teamId: string;
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

type StageFilter = 'r16' | 'qf' | 'sf' | 'final';
type StatusFilter = 'all' | 'live' | 'today' | 'upcoming' | 'completed';

const STAGE_LABELS: Record<StageFilter, string> = {
  r16: 'Round of 16',
  qf: 'Quarter-Finals',
  sf: 'Semi-Finals',
  final: 'Finals',
};

const getTacticalTitle = (rating: number): string => {
  if (rating >= 90) return 'Legendary Coach';
  if (rating >= 75) return 'Master Tactician';
  if (rating >= 60) return 'Elite Analyst';
  return 'Rookie Tactician';
};

/** Parse goalkeeper list strings like "{Player Name 22'}, {Player2 45'}" into clean name list */
function parseScorers(raw: string): string[] {
  if (!raw || raw === 'null' || raw === 'undefined' || raw.trim() === '') return [];
  return raw
    .replace(/\{([^}]+)\}/g, (_, inner) => inner.trim())
    .split(/,\s*(?=\S)/)
    .map(s => {
      // Strip trailing minute markers like "22'" or "45+2'"
      return s.trim().replace(/\s+\d+\+?\d*['+]?\s*$/, '').trim();
    })
    .filter(s => s.length > 1);
}

/** Resolve the display name for a team in a knockout match */
function resolveTeamName(match: Match, side: 'home' | 'away'): string {
  if (side === 'home') {
    return match.home_team_name_en || match.home_team_label || 'TBD';
  }
  return match.away_team_name_en || match.away_team_label || 'TBD';
}

/** Returns true if team name is a real nation (not a "Winner Match X" placeholder) */
function isRealTeam(name: string): boolean {
  return !name.startsWith('Winner') && !name.startsWith('Loser') && name !== 'TBD';
}

const groupsList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export default function WorldCupHub() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'groups'>('schedule');
  const [scheduleFilter, setScheduleFilter] = useState<StatusFilter>('all');
  const [stageFilter, setStageFilter] = useState<StageFilter>('r16');
  const [profile, setProfile] = useState<any>(null);
  const [userPreds, setUserPreds] = useState<any>({});
  const [todayFormatted, setTodayFormatted] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const dateObj = new Date();
    setTodayFormatted(dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

    setProfile(getStoredProfile());
    setUserPreds(getStoredPredictions());

    const handleStorage = () => {
      setProfile(getStoredProfile());
      setUserPreds(getStoredPredictions());
    };
    window.addEventListener('storage', handleStorage);

    const fetchTournamentData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/teams'),
        ]);
        if (matchesRes.ok && teamsRes.ok) {
          const [matchesData, teamsData] = await Promise.all([
            matchesRes.json(),
            teamsRes.json(),
          ]);
          setMatches(matchesData);
          setTeams(teamsData);
        } else {
          throw new Error('Remote fetch failed');
        }
      } catch (err) {
        console.error('Failed to fetch World Cup data:', err);
        setError('Failed to connect to the World Cup data service. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /**
   * Compute authoritative match status.
   * Priority: finished flag > time-based logic.
   * Knockout matches can last up to 3h (90min + 30min ET + penalties).
   * We only auto-complete based on time as a last resort — real data uses finished=TRUE.
   */
  const getMatchStatus = (match: Match): 'COMPLETED' | 'LIVE' | 'UPCOMING' => {
    if (match.finished === 'TRUE') return 'COMPLETED';
    const kickoff = parseLocalDate(match.local_date, match.stadium_id);
    const now = new Date();
    const elapsedMs = now.getTime() - kickoff.getTime();
    // Match is in future → UPCOMING
    if (elapsedMs < 0) return 'UPCOMING';
    // Within 3 hours of kickoff → LIVE (knockout can go ET + pens)
    if (elapsedMs < 3 * 60 * 60 * 1000) return 'LIVE';
    // 3h+ past kickoff and not marked finished → treat as completed
    return 'COMPLETED';
  };

  /**
   * Score display:
   * - COMPLETED: show real score from data
   * - LIVE: show current score if available, else 0-0
   * - UPCOMING: show dash (no score yet)
   */
  const getScore = (match: Match, side: 'home' | 'away'): string => {
    const status = getMatchStatus(match);
    if (status === 'UPCOMING') return '-';
    const raw = side === 'home' ? match.home_score : match.away_score;
    if (raw !== null && raw !== undefined && raw !== '' && raw !== 'null' && raw !== '0' || status === 'COMPLETED') {
      return (raw !== null && raw !== undefined && raw !== 'null') ? String(raw) : '0';
    }
    return '0';
  };

  // All matches for the current stage, sorted by kickoff time
  const stageMatches = useMemo(() => {
    return matches
      .filter(m => {
        if (stageFilter === 'final') return m.type === 'final' || m.type === 'third';
        return m.type === stageFilter;
      })
      .sort((a, b) =>
        parseLocalDate(a.local_date, a.stadium_id).getTime() -
        parseLocalDate(b.local_date, b.stadium_id).getTime()
      );
  }, [matches, stageFilter]);

  // Apply status filter
  const filteredMatches = useMemo(() => {
    const now = new Date();
    return stageMatches.filter(m => {
      const status = getMatchStatus(m);
      const kickoff = parseLocalDate(m.local_date, m.stadium_id);
      switch (scheduleFilter) {
        case 'all': return true;
        case 'completed': return status === 'COMPLETED';
        case 'live': return status === 'LIVE';
        case 'today': return isSameUTCDate(kickoff, now);
        case 'upcoming': return status === 'UPCOMING';
        default: return true;
      }
    });
  }, [stageMatches, scheduleFilter]);

  // Count badges for sidebar filter buttons
  const statusCounts = useMemo(() => {
    const now = new Date();
    const counts = { all: 0, completed: 0, live: 0, today: 0, upcoming: 0 };
    stageMatches.forEach(m => {
      const status = getMatchStatus(m);
      const kickoff = parseLocalDate(m.local_date, m.stadium_id);
      counts.all++;
      if (status === 'COMPLETED') counts.completed++;
      if (status === 'LIVE') counts.live++;
      if (isSameUTCDate(kickoff, now)) counts.today++;
      if (status === 'UPCOMING') counts.upcoming++;
    });
    return counts;
  }, [stageMatches]);

  // When switching stage, auto-pick best filter
  const handleStageChange = (newStage: StageFilter) => {
    setStageFilter(newStage);
    setScheduleFilter('all'); // Always show all on stage change — user can filter manually
  };

  // Standings calculation using real match scores
  const getGroupStandings = (groupLetter: string): GroupStanding[] => {
    const groupTeams = teams.filter(t => t.groups === groupLetter);
    const standings: Record<string, GroupStanding> = {};

    groupTeams.forEach(team => {
      standings[team.id] = {
        teamId: team.id,
        name: team.name_en,
        flag: team.flag,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, points: 0,
      };
    });

    matches
      .filter(m => m.group === groupLetter && m.type === 'group' && m.finished === 'TRUE')
      .forEach(match => {
        const hs = parseInt(match.home_score, 10) || 0;
        const as_ = parseInt(match.away_score, 10) || 0;
        const home = standings[match.home_team_id];
        const away = standings[match.away_team_id];
        if (home) {
          home.played++; home.gf += hs; home.ga += as_; home.gd = home.gf - home.ga;
          if (hs > as_) { home.won++; home.points += 3; }
          else if (hs === as_) { home.drawn++; home.points += 1; }
          else home.lost++;
        }
        if (away) {
          away.played++; away.gf += as_; away.ga += hs; away.gd = away.gf - away.ga;
          if (as_ > hs) { away.won++; away.points += 3; }
          else if (hs === as_) { away.drawn++; away.points += 1; }
          else away.lost++;
        }
      });

    return Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  };

  // Hydration guard — consistent SSR/client markup
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center pt-[52px]">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337]/20 border-t-[#E11D48] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-[#E11D48]">Loading World Cup 2026...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 text-center pt-[52px]">
        <div className="max-w-md bg-[#0B0F19]/80 border border-white/10 p-8 rounded-3xl shadow-xl backdrop-blur-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-2xl mb-4">⚠️</div>
          <p className="font-display font-black text-lg uppercase tracking-wider text-[#E11D48] mb-2">Arena Connection Failure</p>
          <p className="text-gray-400 text-sm max-w-sm font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-5 py-2.5 bg-[#E11D48] hover:bg-rose-700 text-white font-display font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const filterOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All Matches' },
    { id: 'live', label: 'Live Now' },
    { id: 'today', label: 'Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Results' },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-16 overflow-hidden pt-[52px]">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(225,29,72,0.3); }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image
          src="/images/world_cup_hub_bg.webp"
          alt="World Cup Hub Background"
          fill
          className="object-cover opacity-[0.62] object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#030712]/45 to-background" />
      </div>

      {/* Main Console */}
      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 pt-2 pb-6 w-full">
        <div className="w-full bg-[#0B0F19]/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden flex flex-col lg:h-[850px]">

          {/* Header */}
          <div className="shrink-0 border-b border-white/10 bg-black/20 p-4 flex flex-row items-center justify-between gap-4">
            <div className="flex-grow">
              <h1 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white uppercase tracking-wider leading-none">
                FIFA World Cup 2026 <span className="text-[#E11D48]">Hub</span>
              </h1>
              <p className="text-gray-400 text-[9px] sm:text-[10px] mt-1.5 font-bold uppercase tracking-widest">
                <span className="text-[#E11D48]">{todayFormatted.toUpperCase()}</span>
                <span className="text-zinc-600 mx-2">•</span>
                Round of 16 Underway
                <span className="text-zinc-600 mx-2">•</span>
                Lock Predictions &amp; Claim Verdict Cards
              </p>
            </div>
            {profile && (
              <Link href="/football-iq" className="border border-white/10 hover:border-[#E11D48]/40 rounded-xl p-2 px-3 bg-black/40 shadow-xl flex items-center gap-3 transition-all duration-300 group shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E11D48] via-[#881337] to-[#E11D48] p-[1.5px] clip-path-badge shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.2)] group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-[#0B0F19] clip-path-badge flex flex-col items-center justify-center font-display font-black">
                    <span className="text-white text-xs leading-none">{profile.overallRating}</span>
                    <span className="text-[5.5px] text-[#E11D48] tracking-tighter leading-none mt-0.5">OVR</span>
                  </div>
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[6.5px] font-black text-[#E11D48] uppercase tracking-widest leading-none">Manager Reputation</p>
                  <p className="font-display font-black text-xs text-white group-hover:text-[#E11D48] transition-colors truncate mt-0.5 leading-none">{profile.username}</p>
                  <p className="text-[7.5px] font-bold text-gray-400 mt-0.5 leading-none tracking-wide">{getTacticalTitle(profile.overallRating)}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Two-column layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">

            {/* Sidebar */}
            <aside className="lg:col-span-3 bg-black/10 lg:border-r lg:border-white/10 p-4 flex flex-col space-y-4 overflow-y-auto custom-scrollbar h-full shrink-0" data-lenis-prevent="true">

              {/* Navigation */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-0.5 mb-2">Navigation</span>
                {[
                  { id: 'schedule' as const, icon: IconCalendar, label: 'Match Schedule' },
                  { id: 'groups' as const, icon: IconTrophy, label: 'Group Standings' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full px-3 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-widest text-left transition-all cursor-pointer flex items-center gap-2 border ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-[#881337]/20 to-[#E11D48]/10 border-[#E11D48] text-white shadow-[0_2px_12px_rgba(225,29,72,0.15)]'
                        : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                    }`}
                  >
                    <span className="text-[#E11D48] shrink-0"><Icon /></span> {label}
                  </button>
                ))}
              </div>

              {/* Tournament Stage (schedule only) */}
              {activeTab === 'schedule' && (
                <>
                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Tournament Stage</span>
                    <select
                      value={stageFilter}
                      onChange={e => handleStageChange(e.target.value as StageFilter)}
                      className="w-full h-9 bg-black/40 border border-white/10 rounded-lg text-xs font-black uppercase text-rose-400 tracking-wider px-2 focus:ring-1 focus:ring-[#E11D48] outline-none cursor-pointer"
                    >
                      <option value="r16">Round of 16</option>
                      <option value="qf">Quarter-Finals</option>
                      <option value="sf">Semi-Finals</option>
                      <option value="final">Finals &amp; 3rd Place</option>
                    </select>
                  </div>

                  {/* Status Filters */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Filter Matches</span>
                    <div className="flex flex-col gap-1.5">
                      {filterOptions.map(({ id, label }) => {
                        const count = statusCounts[id];
                        const isActive = scheduleFilter === id;
                        return (
                          <button
                            key={id}
                            onClick={() => setScheduleFilter(id)}
                            disabled={count === 0 && id !== 'all'}
                            className={`px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider text-left transition-all border cursor-pointer w-full flex items-center justify-between gap-2 ${
                              isActive
                                ? 'bg-[#881337]/20 border-[#881337] text-rose-400'
                                : count === 0 && id !== 'all'
                                ? 'bg-black/20 border-white/5 text-zinc-600 cursor-not-allowed opacity-40'
                                : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {id === 'live' && <span className={`w-1.5 h-1.5 rounded-full bg-[#E11D48] ${count > 0 ? 'animate-pulse' : ''}`} />}
                              {label}
                            </span>
                            {count > 0 && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-rose-900/30 text-rose-300' : 'bg-white/5 text-zinc-400'}`}>
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Gameplay Guide */}
              <div className="border-t border-white/5 pt-4 space-y-2">
                <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">How to Play</span>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2.5 text-xs leading-relaxed text-gray-300">
                  {['Select any fixture and set your score prediction.', 'Build your Best XI squad and drop hot takes.', 'After the match, run VAR Review to grade predictions and claim Verdict Cards!'].map((tip, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span className="text-[#E11D48] font-black shrink-0">{i + 1}.</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9 flex flex-col h-full w-full overflow-hidden" data-lenis-prevent="true">

              {/* Stage header bar */}
              {activeTab === 'schedule' && (
                <div className="shrink-0 border-b border-white/5 bg-black/20 px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xs text-white uppercase tracking-widest">{STAGE_LABELS[stageFilter]}</span>
                    {statusCounts.live > 0 && (
                      <span className="text-[9px] font-black text-[#E11D48] bg-rose-950/30 border border-rose-900/30 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <IconPlay /> {statusCounts.live} LIVE
                      </span>
                    )}
                    {statusCounts.completed > 0 && (
                      <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-2 py-0.5 rounded">
                        {statusCounts.completed} Completed
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">{filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} shown</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">

                {/* Match Schedule */}
                {activeTab === 'schedule' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {loading ? (
                      <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full border-4 border-[#881337]/30 border-t-[#E11D48] animate-spin" />
                        <span className="text-xs text-zinc-400 font-black uppercase tracking-wider">Loading fixtures...</span>
                      </div>
                    ) : filteredMatches.length === 0 ? (
                      <div className="col-span-full border border-white/10 rounded-2xl p-12 text-center bg-black/35 shadow-xl flex flex-col justify-center items-center">
                        <span className="text-zinc-500 mb-3 block"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg></span>
                        <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">No Matches Found</h3>
                        <p className="text-[11px] text-gray-400 max-w-xs mt-1.5 leading-relaxed">
                          No {STAGE_LABELS[stageFilter]} matches match the &quot;{scheduleFilter}&quot; filter.
                          <button
                            onClick={() => setScheduleFilter('all')}
                            className="block mt-2 text-[#E11D48] hover:underline cursor-pointer font-black"
                          >
                            Show all matches →
                          </button>
                        </p>
                      </div>
                    ) : (
                      filteredMatches.map(match => {
                        const homeTeamDb = teams.find(t => t.id === match.home_team_id);
                        const awayTeamDb = teams.find(t => t.id === match.away_team_id);
                        const homeName = homeTeamDb?.name_en || resolveTeamName(match, 'home');
                        const awayName = awayTeamDb?.name_en || resolveTeamName(match, 'away');
                        const homeIsReal = isRealTeam(homeName);
                        const awayIsReal = isRealTeam(awayName);

                        const status = getMatchStatus(match);
                        const hasPredicted = !!userPreds[match.id];
                        const homeScorers = parseScorers(match.home_scorers);
                        const awayScorers = parseScorers(match.away_scorers);

                        const kickoff = parseLocalDate(match.local_date, match.stadium_id);
                        const kickoffStr = kickoff.toLocaleString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short',
                        });

                        const borderClass = status === 'COMPLETED'
                          ? 'border-l-4 border-l-emerald-500'
                          : status === 'LIVE'
                          ? 'border-l-4 border-l-[#E11D48]'
                          : 'border-l-4 border-l-white/10';

                        return (
                          <Link
                            key={match.id}
                            href={`/match/${match.id}`}
                            className={`group border border-white/10 hover:border-white/25 bg-black/40 hover:bg-black/50 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 shadow-xl cursor-pointer relative overflow-hidden ${borderClass}`}
                          >
                            {/* Match label row */}
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#E11D48] font-mono">
                                {STAGE_LABELS[stageFilter]} · Match {match.id}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {hasPredicted && (
                                  <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest flex items-center bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded gap-0.5">
                                    <IconCheckCircle /> Predicted
                                  </span>
                                )}
                                {status === 'COMPLETED' && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400">
                                    FT
                                  </span>
                                )}
                                {status === 'LIVE' && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-rose-950/20 border border-rose-900/30 text-[#E11D48] animate-pulse flex items-center gap-0.5">
                                    <IconPlay /> Live
                                    {match.time_elapsed && match.time_elapsed !== 'notstarted' && (
                                      <span className="ml-1">{match.time_elapsed}&apos;</span>
                                    )}
                                  </span>
                                )}
                                {status === 'UPCOMING' && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 flex items-center gap-0.5">
                                    <IconClock /> Upcoming
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Scoreboard */}
                            <div className="flex items-stretch gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2.5 shadow-inner">
                              {/* Home */}
                              <div className="flex items-center gap-2 flex-1 overflow-hidden min-w-0">
                                {homeIsReal ? (
                                  <FlagImage countryName={homeName} size="sm" className="w-7 h-7 rounded-full object-cover border-2 border-white/5 shrink-0" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-[9px] text-zinc-500 font-black">?</div>
                                )}
                                <span className={`font-display font-black text-[10px] sm:text-xs uppercase tracking-wider truncate ${status === 'UPCOMING' && !homeIsReal ? 'text-zinc-500 italic' : 'text-white'}`}>
                                  {homeName}
                                </span>
                              </div>

                              {/* Score/VS */}
                              <div className="flex items-center justify-center px-2 shrink-0">
                                {status !== 'UPCOMING' ? (
                                  <div className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 font-mono font-black text-[#E11D48] text-base tracking-tight shadow-[0_2px_12px_rgba(225,29,72,0.2)] flex items-center gap-2">
                                    <span>{getScore(match, 'home')}</span>
                                    <span className="text-zinc-500 font-normal text-xs">–</span>
                                    <span>{getScore(match, 'away')}</span>
                                  </div>
                                ) : (
                                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 font-mono text-zinc-500 text-xs font-bold">
                                    VS
                                  </div>
                                )}
                              </div>

                              {/* Away */}
                              <div className="flex items-center gap-2 flex-1 justify-end overflow-hidden min-w-0">
                                <span className={`font-display font-black text-[10px] sm:text-xs uppercase tracking-wider truncate text-right ${status === 'UPCOMING' && !awayIsReal ? 'text-zinc-500 italic' : 'text-white'}`}>
                                  {awayName}
                                </span>
                                {awayIsReal ? (
                                  <FlagImage countryName={awayName} size="sm" className="w-7 h-7 rounded-full object-cover border-2 border-white/5 shrink-0" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-[9px] text-zinc-500 font-black">?</div>
                                )}
                              </div>
                            </div>

                            {/* Goalscorers (completed matches) */}
                            {status === 'COMPLETED' && (homeScorers.length > 0 || awayScorers.length > 0) && (
                              <div className="grid grid-cols-2 gap-x-3 text-[9px] font-semibold text-zinc-400 leading-relaxed border-t border-white/5 pt-2">
                                <div className="space-y-0.5">
                                  {homeScorers.map((s, i) => (
                                    <div key={i} className="flex items-center gap-1 truncate">
                                      <span className="text-[#E11D48] shrink-0">⚽</span>
                                      <span className="truncate">{s}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-0.5 text-right">
                                  {awayScorers.map((s, i) => (
                                    <div key={i} className="flex items-center gap-1 justify-end truncate">
                                      <span className="truncate">{s}</span>
                                      <span className="text-[#E11D48] shrink-0">⚽</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="border-t border-white/10 pt-2 flex justify-between items-center text-[9px] text-gray-500 font-mono uppercase tracking-wider">
                              <span className="truncate">{kickoffStr}</span>
                              {status === 'COMPLETED' ? (
                                <span className="flex items-center gap-0.5 text-[#E11D48] font-black whitespace-nowrap group-hover:underline shrink-0 ml-2">
                                  VAR Review <IconChevronRight />
                                </span>
                              ) : status === 'LIVE' ? (
                                <span className="flex items-center gap-0.5 text-[#E11D48] font-black animate-pulse whitespace-nowrap shrink-0 ml-2">
                                  Live Feed <IconChevronRight />
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[#E11D48] font-black whitespace-nowrap group-hover:text-rose-400 shrink-0 ml-2">
                                  Lock Tactics <IconChevronRight />
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Group Standings */}
                {activeTab === 'groups' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {loading ? (
                      <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full border-4 border-[#881337]/30 border-t-[#E11D48] animate-spin" />
                        <span className="text-xs text-zinc-400 font-black uppercase tracking-wider">Loading standings...</span>
                      </div>
                    ) : (
                      groupsList.map(g => {
                        const standings = getGroupStandings(g);
                        if (standings.length === 0) return null;
                        return (
                          <div key={g} className="border border-white/10 bg-black/40 rounded-2xl overflow-hidden shadow-xl">
                            <div className="bg-gradient-to-r from-[#881337]/20 to-[#E11D48]/10 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                              <h3 className="font-display font-black text-xs text-white uppercase tracking-widest">Group {g}</h3>
                              <span className="text-[8px] font-black text-[#E11D48] bg-[#E11D48]/10 border border-[#E11D48]/20 px-2 py-0.5 rounded uppercase tracking-wider">Final</span>
                            </div>
                            <div className="p-4">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="text-[8px] font-black uppercase text-zinc-400 tracking-wider border-b border-white/10">
                                    <th className="pb-2">Team</th>
                                    <th className="pb-2 text-center">P</th>
                                    <th className="pb-2 text-center">W</th>
                                    <th className="pb-2 text-center">GD</th>
                                    <th className="pb-2 text-right">PTS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {standings.map((st, i) => {
                                    const isThrough = i < 2;
                                    return (
                                      <tr
                                        key={st.teamId}
                                        className={`text-[11px] font-semibold border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isThrough ? 'text-white' : 'text-zinc-500'}`}
                                      >
                                        <td className="py-2 pr-2">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-black font-mono shrink-0 ${
                                              i === 0 ? 'border-[#E11D48] text-[#E11D48] bg-rose-950/20'
                                              : i === 1 ? 'border-rose-900/40 text-rose-400 bg-rose-950/10'
                                              : 'border-white/10 text-gray-500 bg-white/5'
                                            }`}>{i + 1}</span>
                                            <FlagImage countryName={st.name} size="xs" className="w-4 h-4 rounded-full object-cover border border-white/5 shrink-0" />
                                            <span className="font-display font-black tracking-wide uppercase truncate text-[10px]">{st.name}</span>
                                            {isThrough && <span className="text-[7px] text-emerald-400 font-black shrink-0">✓</span>}
                                          </div>
                                        </td>
                                        <td className="py-2 text-center font-mono text-[10px] text-zinc-400">{st.played}</td>
                                        <td className="py-2 text-center font-mono text-[10px] text-zinc-400">{st.won}</td>
                                        <td className="py-2 text-center font-mono text-[10px] text-zinc-400">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                                        <td className={`py-2 text-right font-display font-black text-[12px] ${isThrough ? 'text-[#E11D48]' : 'text-zinc-400'}`}>{st.points}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
