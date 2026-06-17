'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { getStoredProfile, getStoredPredictions } from '@/lib/profileSync';
import { Trophy, Calendar, CheckCircle, Play, Lock, ChevronRight } from 'lucide-react';

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

const SYSTEM_DATE = new Date('2026-06-16T19:20:00');

function parseLocalDate(localDateStr: string): Date {
  const [datePart, timePart] = localDateStr.split(' ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

// Deterministic result helper matching the backend resolution logic
function getDeterministicMatchResult(matchId: string, homeTeamName: string, awayTeamName: string) {
  let hash = 0;
  const str = matchId + homeTeamName + awayTeamName;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const homeScore = Math.abs((hash >> 4) % 4); // 0 to 3
  const awayScore = Math.abs((hash >> 8) % 3); // 0 to 2
  return { homeScore, awayScore };
}

export default function WorldCupHub() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'groups'>('schedule');
  const [scheduleFilter, setScheduleFilter] = useState<'today' | 'tomorrow' | 'upcoming' | 'completed' | 'live'>('today');
  const [profile, setProfile] = useState<any>(null);
  const [userPreds, setUserPreds] = useState<any>({});

  useEffect(() => {
    // Load local cache first
    setProfile(getStoredProfile());
    setUserPreds(getStoredPredictions());

    // Fetch matches and teams in parallel to prevent request waterfalls
    const fetchTournamentData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetch('https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.matches.json'),
          fetch('https://raw.githubusercontent.com/rezarahiminia/worldcup2026/main/football.teams.json')
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
        console.warn('Failed to fetch remote World Cup data, falling back to local files:', err);
        try {
          const matchesData = require('@/lib/worldcup2026/football.matches.json');
          const teamsData = require('@/lib/worldcup2026/football.teams.json');
          setMatches(matchesData);
          setTeams(teamsData);
        } catch (localErr) {
          console.error('Failed to load local data files:', localErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-[#D97706]">Lacing boots / Loading World Cup...</p>
      </div>
    );
  }

  // Get match status relative to simulation date: June 16, 2026, 19:20
  const getMatchStatus = (match: Match) => {
    const kickoff = parseLocalDate(match.local_date);
    const timeDiff = SYSTEM_DATE.getTime() - kickoff.getTime();
    
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
      const homeTeam = teams.find(t => t.id === match.home_team_id)?.name_en || 'Home';
      const awayTeam = teams.find(t => t.id === match.away_team_id)?.name_en || 'Away';
      const result = getDeterministicMatchResult(match.id, homeTeam, awayTeam);
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
        const homeTeam = teams.find(t => t.id === match.home_team_id);
        const awayTeam = teams.find(t => t.id === match.away_team_id);
        if (!homeTeam || !awayTeam) return;

        const result = getDeterministicMatchResult(match.id, homeTeam.name_en, awayTeam.name_en);

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
    const kickoff = parseLocalDate(match.local_date);
    
    if (scheduleFilter === 'completed') {
      return status === 'COMPLETED';
    } else if (scheduleFilter === 'live') {
      return status === 'LIVE';
    } else if (scheduleFilter === 'today') {
      return kickoff.toDateString() === SYSTEM_DATE.toDateString() && status !== 'COMPLETED';
    } else {
      // Upcoming
      return kickoff.getTime() > SYSTEM_DATE.getTime() && kickoff.toDateString() !== SYSTEM_DATE.toDateString();
    }
  }).sort((a, b) => parseLocalDate(a.local_date).getTime() - parseLocalDate(b.local_date).getTime());

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white pb-16 overflow-hidden">
      <Navbar />

      {/* Futuristic Stadium HUD Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <Image 
          src="/images/world_cup_hub_bg.webp" 
          alt="World Cup Hub Background" 
          fill 
          className="object-cover opacity-30 object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0A0A0A]/40 to-[#0A0A0A]" />
      </div>

      {/* Hero Header Banner */}
      <div className="relative pt-[80px] pb-6 px-6 bg-gradient-to-b from-[#881337]/20 via-transparent to-transparent border-b border-white/5 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#881337]/15 border border-[#881337]/45 text-[#ff4b72] rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 shadow-md">
              <Trophy className="w-3.5 h-3.5 text-[#D97706]" /> FIFA World Cup 2026 Hub
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 4px 30px rgba(0,0,0,0.85)' }}>
              Tournament <span className="text-[#D97706]">Matchday</span>
            </h1>
            <p className="text-gray-300 text-xs mt-1.5 max-w-lg font-medium leading-relaxed">
              Select fixtures to lock in your hot takes and predictions. Graded dynamically relative to kickoff. Current system simulation date: <span className="text-[#D97706] font-bold">June 16, 2026</span>.
            </p>
          </div>

          {profile && (
            <Link href="/football-iq" className="glass-panel border-white/10 hover:border-[#D97706]/40 transition-all duration-300 rounded-2xl p-4 flex items-center gap-4 bg-black/60 shadow-xl shrink-0 group active:scale-98">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#881337] to-[#D97706] flex items-center justify-center font-display font-black text-xl text-white shadow-md group-hover:scale-105 transition-transform duration-300">
                {profile.overallRating}
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Your Reputation</p>
                <p className="font-bold text-white leading-tight group-hover:text-[#D97706] transition-colors">{profile.username}</p>
                <p className="text-[8.5px] font-black text-amber-500 uppercase tracking-wider mt-0.5">{profile.season}</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Cockpit */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-5 font-display font-black text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-[#D97706] text-white shadow-[0_4px_10px_-4px_rgba(217,119,6,0.3)]'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#D97706]" /> Match Schedule
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-3 px-5 font-display font-black text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'groups'
                ? 'border-[#D97706] text-white shadow-[0_4px_10px_-4px_rgba(217,119,6,0.3)]'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#D97706]" /> Group Standings
          </button>
        </div>

        {/* Schedule Tab Contents */}
        {activeTab === 'schedule' && (
          <div>
            {/* Inner Filters capsules */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'today', label: 'Today (June 16)' },
                { id: 'live', label: 'Live Now' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'upcoming', label: 'Upcoming Matches' },
                { id: 'completed', label: 'Completed Results' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setScheduleFilter(sub.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer active:scale-95 ${
                    scheduleFilter === sub.id
                      ? 'bg-gradient-to-r from-[#881337]/20 to-[#D97706]/15 border-[#D97706] text-white shadow-[0_0_12px_rgba(217,119,6,0.15)]'
                      : 'bg-black/60 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Match Listings Grid */}
            {filteredMatches.length === 0 ? (
              <div className="glass-panel border-white/5 rounded-2xl p-12 text-center bg-black/40 flex flex-col justify-center items-center">
                <Calendar className="w-8 h-8 text-gray-600 mb-2.5" />
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">No fixtures found</h3>
                <p className="text-[11px] text-gray-500 max-w-xs mt-1 leading-relaxed">
                  There are no matches matching the filter &quot;{scheduleFilter}&quot; in this stage of the schedule.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.map(match => {
                  const homeTeam = teams.find(t => t.id === match.home_team_id);
                  const awayTeam = teams.find(t => t.id === match.away_team_id);
                  if (!homeTeam || !awayTeam) return null;

                  const status = getMatchStatus(match);
                  const hasPredicted = !!userPreds[match.id];

                  // Left accent indicator based on status
                  const statusBorderClass = {
                    COMPLETED: 'border-l-4 border-l-emerald-500',
                    LIVE: 'border-l-4 border-l-amber-500',
                    UPCOMING: 'border-l-4 border-l-[#881337]'
                  }[status] || 'border-l-4 border-l-white/5';

                  return (
                    <Link
                      key={match.id}
                      href={`/match/${match.id}`}
                      className={`glass-panel border border-white/5 hover:border-white/15 bg-black/60 hover:bg-black/80 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-[0_0_20px_rgba(217,119,6,0.05)] cursor-pointer relative overflow-hidden ${statusBorderClass}`}
                    >
                      {/* Match Header metadata */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 font-mono">
                          Group {match.group} • Match {match.id}
                        </span>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          {hasPredicted && (
                            <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest flex items-center bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                              <CheckCircle className="w-2.5 h-2.5 mr-0.5 shrink-0" /> Predicted
                            </span>
                          )}

                          {status === 'COMPLETED' && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                              Completed
                            </span>
                          )}
                          {status === 'LIVE' && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 animate-pulse flex items-center gap-0.5">
                              <Play className="w-1.5 h-1.5 fill-current" /> Live
                            </span>
                          )}
                          {status === 'UPCOMING' && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 flex items-center gap-0.5">
                              <Lock className="w-2 h-2" /> Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams & Scoreboard - Immersive console look */}
                      <div className="flex items-center justify-between py-2 bg-black/35 border border-white/5 rounded-xl px-4 my-2 shadow-inner">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={homeTeam.flag} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white/10 group-hover:scale-105 group-hover:border-[#D97706]/40 transition-all shrink-0" />
                          <span className="font-display font-black text-xs uppercase tracking-wider text-white group-hover:text-[#D97706] transition-colors truncate">{homeTeam.name_en}</span>
                        </div>
                        
                        <div className="flex items-center justify-center px-3 gap-1 shrink-0">
                          {status === 'COMPLETED' || status === 'LIVE' ? (
                            <div className="bg-slate-950/95 border border-white/15 rounded px-2.5 py-1 font-mono font-black text-[#D97706] text-sm tracking-tight shadow-[0_0_8px_rgba(217,119,6,0.15)] flex items-center gap-1.5">
                              <span>{getResolvedScore(match, 'home')}</span>
                              <span className="text-gray-600 font-normal">:</span>
                              <span>{getResolvedScore(match, 'away')}</span>
                            </div>
                          ) : (
                            <div className="bg-white/5 border border-white/5 rounded px-2.5 py-1 font-mono text-gray-600 text-xs font-bold">
                              VS
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end overflow-hidden">
                          <span className="font-display font-black text-xs uppercase tracking-wider text-white group-hover:text-[#D97706] transition-colors truncate text-right">{awayTeam.name_en}</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={awayTeam.flag} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white/10 group-hover:scale-105 group-hover:border-[#D97706]/40 transition-all shrink-0" />
                        </div>
                      </div>

                      {/* Ticket footer row styling */}
                      <div className="border-t border-white/5 mt-2.5 pt-2 flex justify-between items-center text-[9px] text-gray-500 font-mono tracking-wider uppercase">
                        <span>{match.local_date}</span>
                        {status === 'COMPLETED' ? (
                          <span className="flex items-center gap-0.5 text-[#D97706] font-bold group-hover:underline">VAR VERDICT <ChevronRight className="w-3 h-3" /></span>
                        ) : status === 'LIVE' ? (
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold animate-pulse">MONITOR FEED <ChevronRight className="w-3 h-3" /></span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-rose-400 font-bold group-hover:text-white transition-colors">LOCK TACTICS <ChevronRight className="w-3 h-3" /></span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Group Standings Tab Contents */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groupsList.map(g => {
              const standings = getGroupStandings(g);
              if (standings.length === 0) return null;

              return (
                <div key={g} className="glass-panel border border-white/5 bg-black/60 rounded-2xl overflow-hidden shadow-2xl relative">
                  {/* Header styled as mini console plaque */}
                  <div className="bg-gradient-to-r from-[#881337]/25 to-[#D97706]/10 border-b border-white/5 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-display font-black text-xs text-white uppercase tracking-widest">Group {g}</h3>
                    <span className="text-[8px] font-black text-[#D97706] bg-[#D97706]/15 border border-[#D97706]/20 px-2 py-0.5 rounded uppercase tracking-wider font-mono">Standings</span>
                  </div>

                  <div className="p-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[8px] font-black uppercase text-gray-500 tracking-wider border-b border-white/5">
                          <th className="pb-2">Team</th>
                          <th className="pb-2 text-center">PL</th>
                          <th className="pb-2 text-center">GD</th>
                          <th className="pb-2 text-right">PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((st, i) => {
                          const isPromoted = i < 2; // Top 2 qualify
                          
                          // Circular rank dot styling
                          const rankColorClass = 
                            i === 0 ? 'bg-amber-500/25 border-amber-500/50 text-[#D97706]' :
                            i === 1 ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
                            'bg-black/45 border-white/5 text-gray-500';

                          return (
                            <tr
                              key={st.teamId}
                              className={`text-[11px] font-semibold border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                                isPromoted ? 'text-rose-100' : 'text-gray-500'
                              }`}
                            >
                              <td className="py-2 flex items-center gap-2 max-w-[130px]">
                                <span className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center text-[9px] font-black font-mono shrink-0 ${rankColorClass}`}>
                                  {i + 1}
                                </span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={st.flag} alt="" className="w-5 h-5 rounded-full object-cover border border-white/10 shrink-0" />
                                <span className="font-display font-black tracking-wide uppercase truncate">{st.name}</span>
                              </td>
                              <td className="py-2 text-center font-mono text-[10px] text-gray-400">{st.played}</td>
                              <td className="py-2 text-center font-mono text-[10px] text-gray-400">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                              <td className={`py-2 text-right font-display font-black text-[12px] ${
                                isPromoted ? 'text-[#D97706] drop-shadow-[0_0_4px_rgba(217,119,6,0.15)]' : 'text-gray-500'
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
    </div>
  );
}
