'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { getStoredProfile, getStoredPredictions } from '@/lib/profileSync';
import { Trophy, Calendar, CheckCircle, Play, Lock } from 'lucide-react';

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
      <div className="min-h-screen bg-[#030712] text-foreground flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#881337] border-t-[#D97706] animate-spin mb-4" />
        <p className="font-display font-black text-sm uppercase tracking-widest text-[#9CA3AF]">Lacing boots / Loading World Cup...</p>
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
          className="object-cover opacity-35 object-center scale-102" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0A0A0A]/40 to-[#0A0A0A]" />
      </div>

      {/* Hero Header Banner */}
      <div className="relative pt-[90px] pb-8 px-6 bg-gradient-to-b from-[#881337]/20 via-transparent to-transparent border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#881337]/15 border border-[#881337]/30 text-rose-400 rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-widest mb-3">
              <Trophy className="w-3.5 h-3.5" /> FIFA World Cup 2026 Hub
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight leading-none">
              Tournament Matchday
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-lg font-medium">
              Select fixtures to lock in your hot takes and predictions. Graded dynamically relative to kickoff. Current system simulation date: <span className="text-amber-400">June 16, 2026</span>.
            </p>
          </div>

          {profile && (
            <Link href="/football-iq" className="glass-panel border-white/10 hover:border-[#D97706]/40 transition-colors rounded-2xl p-4 flex items-center gap-4 bg-[#0B0F19]/90 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#881337] to-[#D97706] flex items-center justify-center font-display font-black text-xl text-white shadow-md">
                {profile.overallRating}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Your Reputation</p>
                <p className="font-bold text-white leading-tight">{profile.username}</p>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-wider mt-0.5">{profile.season}</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Cockpit */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-8">
        <div className="flex border-b border-white/5 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3.5 px-6 font-display font-black text-sm uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'border-[#D97706] text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4" /> Match Schedule
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-3.5 px-6 font-display font-black text-sm uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'groups'
                ? 'border-[#D97706] text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <Trophy className="w-4 h-4" /> Group Standings
          </button>
        </div>

        {/* Schedule Tab Contents */}
        {activeTab === 'schedule' && (
          <div>
            {/* Inner Filters */}
            <div className="flex flex-wrap gap-2.5 mb-6">
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
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                    scheduleFilter === sub.id
                      ? 'bg-[#881337]/10 border-[#881337] text-rose-300 shadow-md'
                      : 'bg-[#111827]/40 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Match Listings Grid */}
            {filteredMatches.length === 0 ? (
              <div className="glass-panel border-white/5 rounded-3xl p-12 text-center bg-[#0B0F19]/25 flex flex-col justify-center items-center">
                <Calendar className="w-10 h-10 text-gray-600 mb-3" />
                <h3 className="font-display font-black text-lg text-white uppercase">No fixtures matches</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1 leading-relaxed">
                  There are no matches matching the filter {scheduleFilter} in this stage of the schedule.
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

                  return (
                    <Link
                      key={match.id}
                      href={`/match/${match.id}`}
                      className="glass-panel border-white/5 hover:border-white/15 bg-[#0B0F19]/40 hover:bg-[#0B0F19]/75 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md group"
                    >
                      {/* Match Header metadata */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                          Group {match.group} • Match {match.id}
                        </span>
                        
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5">
                          {hasPredicted && (
                            <span className="text-[9px] font-black uppercase text-green-400 tracking-wider flex items-center bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full mr-1.5">
                              <CheckCircle className="w-2.5 h-2.5 mr-1" /> Predicted
                            </span>
                          )}

                          {status === 'COMPLETED' && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-green-500/10 border border-green-500/25 text-green-400">
                              Completed
                            </span>
                          )}
                          {status === 'LIVE' && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 animate-pulse flex items-center gap-1">
                              <Play className="w-2 h-2 fill-current" /> Live
                            </span>
                          )}
                          {status === 'UPCOMING' && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Teams & Scoreboard */}
                      <div className="flex items-center justify-between py-2.5">
                        <div className="flex items-center gap-3 flex-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={homeTeam.flag} alt="" className="w-8 h-5 object-cover rounded shadow-sm shrink-0 border border-white/5" />
                          <span className="font-bold text-sm text-white group-hover:text-[#D97706] transition-colors line-clamp-1">{homeTeam.name_en}</span>
                        </div>
                        
                        <div className="flex items-center justify-center px-4 font-display font-black text-lg text-white gap-2 shrink-0">
                          <span>{getResolvedScore(match, 'home')}</span>
                          <span className="text-gray-600 font-normal">:</span>
                          <span>{getResolvedScore(match, 'away')}</span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-bold text-sm text-white group-hover:text-[#D97706] transition-colors line-clamp-1 text-right">{awayTeam.name_en}</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={awayTeam.flag} alt="" className="w-8 h-5 object-cover rounded shadow-sm shrink-0 border border-white/5" />
                        </div>
                      </div>

                      {/* Date & Location */}
                      <div className="border-t border-white/5 mt-4 pt-3 flex justify-between items-center text-[10px] text-gray-500 font-semibold">
                        <span>{match.local_date}</span>
                        <span className="underline group-hover:text-gray-400 transition-colors">Enter Match Hub →</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupsList.map(g => {
              const standings = getGroupStandings(g);
              if (standings.length === 0) return null;

              return (
                <div key={g} className="glass-panel border-white/5 bg-[#0B0F19]/40 rounded-2xl p-5 shadow-lg">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
                    <h3 className="font-display font-black text-base text-white uppercase tracking-wider">Group {g}</h3>
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Standings</span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] font-black uppercase text-gray-500 tracking-wider border-b border-white/5">
                        <th className="pb-2">Team</th>
                        <th className="pb-2 text-center">PL</th>
                        <th className="pb-2 text-center">GD</th>
                        <th className="pb-2 text-right">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((st, i) => (
                        <tr
                          key={st.teamId}
                          className={`text-xs font-semibold border-b border-white/5 last:border-0 ${
                            i < 2 ? 'text-rose-200' : 'text-gray-400'
                          }`}
                        >
                          <td className="py-2.5 flex items-center gap-2 max-w-[130px]">
                            <span className="text-[10px] font-bold text-gray-600 w-3">{i + 1}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={st.flag} alt="" className="w-5 h-3.5 object-cover rounded border border-white/5 shrink-0" />
                            <span className="truncate">{st.name}</span>
                          </td>
                          <td className="py-2.5 text-center font-mono">{st.played}</td>
                          <td className="py-2.5 text-center font-mono">{st.gd > 0 ? `+${st.gd}` : st.gd}</td>
                          <td className="py-2.5 text-right font-display font-black text-white">{st.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
