'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredProfile, getStoredPredictions } from '@/lib/profileSync';
import { Trophy, Calendar, CheckCircle, Play, Lock, ChevronRight } from 'lucide-react';
import { parseLocalDate, getDeterministicMatchResult, isSameUTCDate } from '@/lib/matchUtils';
import FlagImage from '@/components/FlagImage';

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
  group: string;
  matchday: string;
  local_date: string;
  finished: string;
  time_elapsed: string;
  type: string;
  stadium_id: string;
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

// Real current time — match statuses reflect live schedule
const getTacticalTitle = (rating: number): string => {
  if (rating >= 90) return 'Legendary Coach';
  if (rating >= 75) return 'Master Tactician';
  if (rating >= 60) return 'Elite Analyst';
  return 'Rookie Tactician';
};

export default function WorldCupHub() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'groups'>('schedule');
  const [scheduleFilter, setScheduleFilter] = useState<'today' | 'tomorrow' | 'upcoming' | 'completed' | 'live'>('today');
  const [profile, setProfile] = useState<any>(null);
  const [userPreds, setUserPreds] = useState<any>({});
  const [todayFormatted, setTodayFormatted] = useState<string>('June 16, 2026');
  const [todayLabel, setTodayLabel] = useState<string>('Today (June 16)');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const dateObj = new Date();
    setTodayFormatted(dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    setTodayLabel(`Today (${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})`);

    // Load local cache first
    setProfile(getStoredProfile());
    setUserPreds(getStoredPredictions());

    // Fetch matches and teams in parallel to prevent request waterfalls
    const fetchTournamentData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/teams')
        ]);

        if (matchesRes.ok && teamsRes.ok) {
          const [matchesData, teamsData] = await Promise.all([
            matchesRes.json(),
            teamsRes.json()
          ]);
          setMatches(matchesData);
          setTeams(teamsData);
        } else {
          throw new Error('Remote fetch failed');
        }
      } catch (err) {
        console.error('Failed to fetch remote World Cup data:', err);
        setError('Failed to fetch real-time tournament standings. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6 text-center pt-[52px]">
        <div className="max-w-md bg-[#0B0F19]/80 border border-white/10 p-8 rounded-3xl shadow-xl backdrop-blur-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-[#E11D48] text-2xl mb-4">⚠️</div>
          <p className="font-display font-black text-lg uppercase tracking-wider text-[#E11D48] mb-2">Arena Connection Failure</p>
          <p className="text-gray-400 text-sm max-w-sm font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-5 py-2.5 bg-[#E11D48] hover:bg-rose-700 text-white font-display font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md">Retry Connection</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337]/20 border-t-[#E11D48] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-[#E11D48]">Lacing boots / Loading World Cup...</p>
      </div>
    );
  }

  // Get match status relative to real current time
  const getMatchStatus = (match: Match) => {
    const kickoff = parseLocalDate(match.local_date, match.stadium_id);
    const timeDiff = new Date().getTime() - kickoff.getTime();
    
    if (timeDiff >= 2 * 60 * 60 * 1000) {
      return 'COMPLETED';
    } else if (timeDiff >= 0) {
      return 'LIVE';
    } else {
      return 'UPCOMING';
    }
  };

  // Helper to resolve scores (either from prediction cache, actual deterministic values, or raw data)
  const getResolvedScore = (match: Match, team: 'home' | 'away') => {
    const status = getMatchStatus(match);
    if (status === 'COMPLETED' || status === 'LIVE') {
      const homeTeam = teams.find(t => t.id === match.home_team_id)?.name_en || (match as any).home_team_label || 'Home';
      const awayTeam = teams.find(t => t.id === match.away_team_id)?.name_en || (match as any).away_team_label || 'Away';
      const result = getDeterministicMatchResult(match.id, homeTeam, awayTeam, match);
      return team === 'home' ? result.homeScore : result.awayScore;
    }
    return '-';
  };

  // Standings calculation for all 12 groups (A to L)
  const groupsList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const getGroupStandings = (groupLetter: string): GroupStanding[] => {
    const groupTeams = teams.filter(t => t.groups === groupLetter);
    const standings: Record<string, GroupStanding> = {};

    groupTeams.forEach(team => {
      standings[team.id] = {
        teamId: team.id,
        name: team.name_en,
        flag: team.flag,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0
      };
    });

    // Process all group stage matches in this group
    const groupMatches = matches.filter(m => m.group === groupLetter && m.type === 'group');
    groupMatches.forEach(match => {
      const status = getMatchStatus(match);
      if (status === 'COMPLETED') {
        const homeTeam = teams.find(t => t.id === match.home_team_id) || { name_en: (match as any).home_team_label || 'Home' };
        const awayTeam = teams.find(t => t.id === match.away_team_id) || { name_en: (match as any).away_team_label || 'Away' };

        const result = getDeterministicMatchResult(match.id, homeTeam.name_en, awayTeam.name_en, match);

        // Update home team
        const home = standings[match.home_team_id];
        if (home) {
          home.played += 1;
          home.gf += result.homeScore;
          home.ga += result.awayScore;
          home.gd = home.gf - home.ga;
          if (result.homeScore > result.awayScore) {
            home.won += 1;
            home.points += 3;
          } else if (result.homeScore === result.awayScore) {
            home.drawn += 1;
            home.points += 1;
          } else {
            home.lost += 1;
          }
        }

        // Update away team
        const away = standings[match.away_team_id];
        if (away) {
          away.played += 1;
          away.gf += result.awayScore;
          away.ga += result.homeScore;
          away.gd = away.gf - away.ga;
          if (result.awayScore > result.homeScore) {
            away.won += 1;
            away.points += 3;
          } else if (result.homeScore === result.awayScore) {
            away.drawn += 1;
            away.points += 1;
          } else {
            away.lost += 1;
          }
        }
      }
    });

    // Sort standings by points desc, then goal difference desc, then goals for desc
    return Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  };

  // Filter matches for schedule tabs
  const filteredMatches = matches.filter(match => {
    const status = getMatchStatus(match);
    const kickoff = parseLocalDate(match.local_date, match.stadium_id);
    
    if (scheduleFilter === 'completed') {
      return status === 'COMPLETED';
    } else if (scheduleFilter === 'live') {
      return status === 'LIVE';
    } else if (scheduleFilter === 'today') {
      return isSameUTCDate(kickoff, new Date()) && status !== 'COMPLETED';
    } else {
      // Upcoming
      return kickoff.getTime() > new Date().getTime() && !isSameUTCDate(kickoff, new Date());
    }
  }).sort((a, b) => parseLocalDate(a.local_date, a.stadium_id).getTime() - parseLocalDate(b.local_date, b.stadium_id).getTime());

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-16 overflow-hidden pt-[52px]">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(225, 29, 72, 0.3);
        }
      `}</style>

      {/* Futuristic Stadium HUD Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/world_cup_hub_bg.webp" 
          alt="World Cup Hub Background" 
          fill 
          className="object-cover opacity-[0.38] object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#030712]/45 to-background" />
      </div>

      {/* Main Console Layout: Unified Header & Two-Column Grid */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 pt-1 pb-6 w-full">
        <div className="w-full bg-[#0B0F19]/80 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden flex flex-col lg:h-[840px]">
          
          {/* Unified Header Panel */}
          <div className="shrink-0 border-b border-white/10 bg-black/20 backdrop-blur-xs p-4 flex flex-row items-center justify-between gap-4">
            <div className="text-left flex-grow">
              <h1 className="font-display font-black text-xl sm:text-2xl lg:text-3xl text-white uppercase tracking-wider leading-none">
                FIFA WORLD CUP 2026 <span className="text-[#E11D48]">HUB</span>
              </h1>
              <p className="text-gray-400 text-[8px] sm:text-[9px] lg:text-[10px] mt-2 font-bold uppercase tracking-widest leading-none">
                TODAY: <span className="text-[#E11D48]">{todayFormatted.toUpperCase()}</span> <span className="text-zinc-355 mx-2">•</span> LOCK PREDICTIONS & CLAIM VERDICT CARDS
              </p>
            </div>
            {profile && (
              <Link href="/football-iq" className="border border-white/10 hover:border-[#E11D48]/40 rounded-xl p-2 px-3 bg-black/40 shadow-xl flex items-center gap-3 transition-all duration-300 group shrink-0">
                {/* Hexagonal Shield Badge */}
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

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
            {/* Left-Aligned Control Sidebar */}
            <aside className="lg:col-span-3 bg-black/10 lg:border-r lg:border-white/10 p-4 flex flex-col space-y-4 lg:overflow-y-visible overflow-y-auto custom-scrollbar h-full shrink-0" data-lenis-prevent="true">


            {/* Section 1: Navigation Plinths */}
            <div className="space-y-1.5">
              <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-0.5">Navigation Console</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`w-full px-3 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-widest text-left transition-all cursor-pointer flex items-center justify-start gap-2 border ${
                    activeTab === 'schedule'
                      ? 'bg-gradient-to-r from-[#881337]/20 to-[#E11D48]/10 border-[#E11D48] text-white shadow-[0_2px_12px_rgba(225,29,72,0.15)]'
                      : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#E11D48]" /> Match Schedule
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`w-full px-3 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-widest text-left transition-all cursor-pointer flex items-center justify-start gap-2 border ${
                    activeTab === 'groups'
                      ? 'bg-gradient-to-r from-[#881337]/20 to-[#E11D48]/10 border-[#E11D48] text-white shadow-[0_2px_12px_rgba(225,29,72,0.15)]'
                      : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-[#E11D48]" /> Group Standings
                </button>
              </div>
            </div>

            {/* Section 2: Fixture Sub-Filters (only active on Schedule tab) */}
            {activeTab === 'schedule' && (
              <div className="space-y-2 border-t border-white/5 pt-4">
                <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Filter Fixtures</span>
                <div className="flex flex-col space-y-1.5">
                  {[
                    { id: 'today', label: todayLabel },
                    { id: 'live', label: 'Live Now' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'completed', label: 'Completed Results' }
                  ].map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setScheduleFilter(sub.id as any)}
                      className={`px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider text-left transition-all border cursor-pointer shrink-0 whitespace-nowrap w-full ${
                        scheduleFilter === sub.id
                          ? 'bg-[#881337]/20 border-[#881337] text-rose-400 shadow-sm'
                          : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-black/50'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2 w-full">
                        <span>{sub.label}</span>
                        {sub.id === 'live' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Gameplay Guide */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <span className="block text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">Gameplay Guide</span>
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2.5 text-xs leading-relaxed text-gray-300">
                <div className="flex gap-1.5">
                  <span className="text-[#E11D48] font-black">1.</span>
                  <span>Select any active fixture from the match schedule.</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[#E11D48] font-black">2.</span>
                  <span>Set score predictions, build your Best XI squad, and drop hot takes.</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[#E11D48] font-black">3.</span>
                  <span>Once the match finishes, run **VAR Review** to grade predictions and claim Verdict Cards!</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right-Aligned Main Content Panel */}
          <main className="lg:col-span-9 flex flex-col h-full w-full overflow-hidden" data-lenis-prevent="true">

            {/* Scrollable match listings / group standings */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              
              {/* Matches Listings */}
              {activeTab === 'schedule' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredMatches.length === 0 ? (
                    <div className="glass-panel border border-white/10 rounded-2xl p-12 text-center bg-black/35 shadow-xl flex flex-col justify-center items-center">
                      <Calendar className="w-8 h-8 text-zinc-500 mb-2.5" />
                      <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">No fixtures found</h3>
                      <p className="text-[11px] text-gray-400 max-w-xs mt-1 leading-relaxed">
                        There are no matches matching the filter &quot;{scheduleFilter}&quot; in this stage of the schedule.
                      </p>
                    </div>
                  ) : (
                    filteredMatches.map(match => {
                      const homeTeam = teams.find(t => t.id === match.home_team_id) || {
                        id: match.home_team_id,
                        name_en: (match as any).home_team_label || 'Home',
                        flag: ''
                      };
                      const awayTeam = teams.find(t => t.id === match.away_team_id) || {
                        id: match.away_team_id,
                        name_en: (match as any).away_team_label || 'Away',
                        flag: ''
                      };

                      const status = getMatchStatus(match);
                      const hasPredicted = !!userPreds[match.id];

                      // Left border accent color
                      const statusBorderClass = {
                        COMPLETED: 'border-l-4 border-l-emerald-500',
                        LIVE: 'border-l-4 border-l-[#E11D48]',
                        UPCOMING: 'border-l-4 border-l-[#881337]'
                      }[status] || 'border-l-4 border-l-white/20';

                      return (
                        <Link
                          key={match.id}
                          href={`/match/${match.id}`}
                          className={`glass-panel border border-white/10 hover:border-white/20 bg-black/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-black/50 cursor-pointer relative overflow-hidden ${statusBorderClass}`}
                        >
                          {/* Match Header metadata */}
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#E11D48] font-mono">
                              Group {match.group} • Match {match.id}
                            </span>
                            
                            {/* Status Badge */}
                            <div className="flex items-center gap-1.5">
                              {hasPredicted && (
                                <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest flex items-center bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                                  <CheckCircle className="w-2.5 h-2.5 mr-0.5 shrink-0" /> Predicted
                                </span>
                              )}

                              {status === 'COMPLETED' && (
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400">
                                  Completed
                                </span>
                              )}
                              {status === 'LIVE' && (
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-rose-950/20 border border-rose-900/30 text-[#E11D48] animate-pulse flex items-center gap-0.5">
                                  <Play className="w-1.5 h-1.5 fill-current" /> Live
                                </span>
                              )}
                              {status === 'UPCOMING' && (
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 flex items-center gap-0.5">
                                  <Lock className="w-2 h-2" /> Upcoming
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Teams & Scoreboard */}
                          <div className="flex items-center justify-between py-2 bg-black/30 border border-white/5 rounded-xl px-4 my-2 shadow-inner">
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                              <FlagImage countryName={homeTeam.name_en} size="sm" className="w-7 h-7 rounded-full object-cover border-2 border-white/5 group-hover:scale-105 group-hover:border-[#E11D48]/40 transition-all shrink-0 flex items-center justify-center bg-zinc-200" />
                              <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-wider text-white group-hover:text-[#E11D48] transition-colors truncate">{homeTeam.name_en}</span>
                            </div>
                            
                            <div className="flex items-center justify-center px-3 gap-1 shrink-0">
                              {status === 'COMPLETED' || status === 'LIVE' ? (
                                <div className="bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono font-black text-[#E11D48] text-sm tracking-tight shadow-[0_2px_12px_rgba(225,29,72,0.2)] flex items-center gap-1.5">
                                  <span>{getResolvedScore(match, 'home')}</span>
                                  <span className="text-zinc-300 font-normal">:</span>
                                  <span>{getResolvedScore(match, 'away')}</span>
                                </div>
                              ) : (
                                <div className="bg-white/5 border border-white/10 rounded px-2.5 py-1 font-mono text-gray-400 text-xs font-bold">
                                  VS
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3 flex-1 justify-end overflow-hidden">
                              <span className="font-display font-black text-[10px] sm:text-xs uppercase tracking-wider text-white group-hover:text-[#E11D48] transition-colors truncate text-right">{awayTeam.name_en}</span>
                              <FlagImage countryName={awayTeam.name_en} size="sm" className="w-7 h-7 rounded-full object-cover border-2 border-white/5 group-hover:scale-105 group-hover:border-[#E11D48]/40 transition-all shrink-0 flex items-center justify-center bg-zinc-200" />
                            </div>
                          </div>

                          {/* Ticket footer row */}
                          <div className="border-t border-white/10 mt-2.5 pt-2 flex justify-between items-center text-[9px] text-gray-400 font-mono tracking-wider uppercase">
                            <span>
                              {mounted ? parseLocalDate(match.local_date, match.stadium_id).toLocaleString(undefined, {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              }) : match.local_date}
                            </span>
                            {status === 'COMPLETED' ? (
                              <span className="flex items-center gap-0.5 text-[#E11D48] font-bold group-hover:underline">VAR VERDICT <ChevronRight className="w-3 h-3" /></span>
                            ) : status === 'LIVE' ? (
                              <span className="flex items-center gap-0.5 text-[#E11D48] font-bold animate-pulse">MONITOR FEED <ChevronRight className="w-3 h-3" /></span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[#E11D48] font-bold group-hover:text-rose-400 transition-colors">LOCK TACTICS <ChevronRight className="w-3 h-3" /></span>
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
                  {groupsList.map(g => {
                    const standings = getGroupStandings(g);
                    if (standings.length === 0) return null;

                    return (
                      <div key={g} className="glass-panel border border-white/10 bg-black/40 rounded-2xl overflow-hidden shadow-xl relative">
                        {/* Standings plaque header */}
                        <div className="bg-gradient-to-r from-[#881337]/20 to-[#E11D48]/10 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                          <h3 className="font-display font-black text-xs text-white uppercase tracking-widest">Group {g}</h3>
                          <span className="text-[8px] font-black text-[#E11D48] bg-[#E11D48]/10 border border-[#E11D48]/20 px-2 py-0.5 rounded uppercase tracking-wider font-mono">Standings</span>
                        </div>

                        <div className="p-4">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[8px] font-black uppercase text-zinc-400 tracking-wider border-b border-white/10">
                                <th className="pb-2">Team</th>
                                <th className="pb-2 text-center">PL</th>
                                <th className="pb-2 text-center">GD</th>
                                <th className="pb-2 text-right">PTS</th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings.map((st, i) => {
                                const isPromoted = i < 2;
                                const rankColorClass = 
                                  i === 0 ? 'bg-rose-950/20 border-[#E11D48] text-[#E11D48]' :
                                  i === 1 ? 'bg-rose-950/10 border-rose-900/30 text-rose-400' :
                                  'bg-white/5 border-white/10 text-gray-400';

                                return (
                                  <tr
                                    key={st.teamId}
                                    className={`text-[11px] font-semibold border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                                      isPromoted ? 'text-white' : 'text-zinc-500'
                                    }`}
                                  >
                                    <td className="py-2 flex items-center gap-2 max-w-[130px]">
                                      <span className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] font-black font-mono shrink-0 ${rankColorClass}`}>
                                        {i + 1}
                                      </span>
                                      <FlagImage countryName={st.name} size="xs" className="w-5 h-5 rounded-full object-cover border border-white/5 shrink-0 flex items-center justify-center bg-zinc-200" />
                                      <span className="font-display font-black tracking-wide uppercase truncate">{st.name}</span>
                                    </td>
                                    <td className="py-2 text-center font-mono text-[10px] text-zinc-400">{st.played}</td>
                                    <td className="py-2 text-center font-mono text-[10px] text-zinc-400">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                                    <td className={`py-2 text-right font-display font-black text-[12px] ${
                                      isPromoted ? 'text-[#E11D48] drop-shadow-[0_2px_4px_rgba(225,29,72,0.15)]' : 'text-zinc-400'
                                    }`}>{st.points}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
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
