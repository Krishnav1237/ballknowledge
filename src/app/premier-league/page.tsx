'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredPredictions, getStoredProfile } from '@/lib/profileSync';
import { clockNow, getMatchClockStatus, isSameUTCDate, parseLocalDate } from '@/lib/matchUtils';
import { computeLeagueTable } from '@/lib/premierLeagueUtils';
import { fetchWithTimeout } from '@/lib/requestBounds';
import FlagImage from '@/components/FlagImage';

const IconTrophy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
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

type StatusFilter = 'all' | 'live' | 'today' | 'upcoming' | 'completed';

function parseScorers(raw: string): string[] {
  if (!raw || raw === 'null' || raw === 'undefined' || raw.trim() === '') return [];
  return raw
    .replace(/\{([^}]+)\}/g, (_, inner) => inner.trim())
    .split(/,\s*(?=\S)/)
    .map((s) => s.trim().replace(/\s+\d+\+?\d*['+]?\s*$/, '').trim())
    .filter((s) => s.length > 1);
}

export default function PremierLeagueHub() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schedule' | 'table'>('schedule');
  const [scheduleFilter, setScheduleFilter] = useState<StatusFilter>('all');
  const [matchweek, setMatchweek] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [userPreds, setUserPreds] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    setNowMs(clockNow());
    const id = setInterval(() => setNowMs(clockNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setProfile(getStoredProfile());
    setUserPreds(getStoredPredictions());
    const handleStorage = () => {
      setProfile(getStoredProfile());
      setUserPreds(getStoredPredictions());
    };
    window.addEventListener('storage', handleStorage);

    const fetchData = async () => {
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetchWithTimeout('/api/matches'),
          fetchWithTimeout('/api/teams'),
        ]);
        if (!matchesRes.ok || !teamsRes.ok) throw new Error('Remote fetch failed');
        const [matchesData, teamsData] = await Promise.all([matchesRes.json(), teamsRes.json()]);
        const list = Array.isArray(matchesData) ? matchesData : [];
        setMatches(list);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        const upcoming = list.find((match: Match) => match.finished !== 'TRUE');
        if (upcoming?.matchday) setMatchweek(parseInt(upcoming.matchday, 10) || 1);
      } catch {
        setError('Failed to connect to the Premier League data service. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const getMatchStatus = (match: Match): 'COMPLETED' | 'LIVE' | 'UPCOMING' => {
    return getMatchClockStatus(match, nowMs || 0);
  };

  const getScore = (match: Match, side: 'home' | 'away'): string => {
    const status = getMatchStatus(match);
    if (status === 'UPCOMING') return '-';
    const raw = side === 'home' ? match.home_score : match.away_score;
    if (raw !== null && raw !== undefined && raw !== '' && raw !== 'null') return String(raw);
    return '0';
  };

  const weekMatches = useMemo(() => {
    return matches
      .filter((match) => parseInt(match.matchday, 10) === matchweek)
      .sort((a, b) => parseLocalDate(a.local_date, a.stadium_id).getTime() - parseLocalDate(b.local_date, b.stadium_id).getTime());
  }, [matches, matchweek]);

  const filteredMatches = useMemo(() => {
    const clock = nowMs || 0;
    const now = new Date(clock);
    return weekMatches.filter((match) => {
      const status = getMatchClockStatus(match, clock);
      const kickoff = parseLocalDate(match.local_date, match.stadium_id);
      switch (scheduleFilter) {
        case 'completed': return status === 'COMPLETED';
        case 'live': return status === 'LIVE';
        case 'today': return isSameUTCDate(kickoff, now);
        case 'upcoming': return status === 'UPCOMING';
        default: return true;
      }
    });
  }, [weekMatches, scheduleFilter, nowMs]);

  const table = useMemo(() => computeLeagueTable(matches as any, teams as any), [matches, teams]);

  return (
    <div className="relative min-h-screen bg-[#030712] text-white pt-[52px]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image src="/images/match_details_bg.webp" alt="" fill className="object-cover opacity-[0.18]" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/70 via-[#030712]/80 to-[#030712]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E11D48]">2026/27 Season · 38 matchweeks</p>
            <h1 className="font-display font-black text-3xl uppercase tracking-wide mt-1">Premier League Hub</h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-xl">
              20 clubs, 380 fixtures. Lock predictions before kickoff — Arsenal vs Coventry City opens the season on 21 August 2026.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <IconTrophy />
            <span>{profile?.username || 'Guest'} · {Object.keys(userPreds).length} locked</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 border border-red-900/40 bg-red-950/20 text-red-300 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        <div className="flex gap-2 mb-5">
          {(['schedule', 'table'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                activeTab === tab ? 'bg-[#E11D48] text-white' : 'bg-white/5 text-zinc-400 border border-white/10'
              }`}
            >
              {tab === 'schedule' ? 'Matchweeks' : 'League Table'}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
              {Array.from({ length: 38 }, (_, i) => i + 1).map((week) => (
                <button
                  key={week}
                  onClick={() => setMatchweek(week)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black ${
                    matchweek === week ? 'bg-[#E11D48] text-white' : 'bg-black/40 border border-white/10 text-zinc-400'
                  }`}
                >
                  MW {week}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', 'upcoming', 'live', 'today', 'completed'] as StatusFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setScheduleFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                    scheduleFilter === filter ? 'bg-white/10 text-white' : 'text-zinc-500'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-full py-20 text-center text-zinc-400">Loading fixtures...</div>
              ) : filteredMatches.length === 0 ? (
                <div className="col-span-full border border-white/10 rounded-2xl p-12 text-center bg-black/35">
                  <h3 className="font-display font-black text-sm uppercase">No Matches Found</h3>
                  <p className="text-[11px] text-gray-400 mt-2">No matchweek {matchweek} games match that filter.</p>
                </div>
              ) : (
                filteredMatches.map((match) => {
                  const homeName = teams.find((t) => t.id === match.home_team_id)?.name_en || match.home_team_name_en || 'Home';
                  const awayName = teams.find((t) => t.id === match.away_team_id)?.name_en || match.away_team_name_en || 'Away';
                  const status = getMatchStatus(match);
                  const kickoff = parseLocalDate(match.local_date, match.stadium_id);
                  const kickoffStr = kickoff.toLocaleString('en-GB', {
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short',
                  });
                  const homeScorers = parseScorers(match.home_scorers);
                  const awayScorers = parseScorers(match.away_scorers);
                  return (
                    <Link
                      key={match.id}
                      href={`/match/${match.id}`}
                      className="group border border-white/10 hover:border-[#E11D48]/50 hover:bg-white/[0.04] bg-black/40 rounded-2xl p-4 flex flex-col gap-3 transition-colors duration-150"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#E11D48] font-mono">
                          Matchweek {match.matchday} · Fixture {match.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {userPreds[match.id] && (
                            <span className="text-[8px] font-black uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <IconCheckCircle /> Predicted
                            </span>
                          )}
                          {status === 'LIVE' && (
                            <span className="text-[8px] font-black uppercase text-[#E11D48] animate-pulse flex items-center gap-0.5">
                              <IconPlay /> Live
                            </span>
                          )}
                          {status === 'UPCOMING' && (
                            <span className="text-[8px] font-black uppercase text-gray-400 flex items-center gap-0.5">
                              <IconClock /> Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FlagImage countryName={homeName} size="sm" className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <span className="font-display font-black text-xs uppercase truncate">{homeName}</span>
                        </div>
                        <div className="px-2 shrink-0 font-mono font-black text-[#E11D48]">
                          {status === 'UPCOMING' ? 'VS' : `${getScore(match, 'home')} – ${getScore(match, 'away')}`}
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                          <span className="font-display font-black text-xs uppercase truncate text-right">{awayName}</span>
                          <FlagImage countryName={awayName} size="sm" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        </div>
                      </div>
                      {status === 'COMPLETED' && (homeScorers.length > 0 || awayScorers.length > 0) && (
                        <div className="grid grid-cols-2 gap-x-3 text-[9px] text-zinc-400">
                          <div>{homeScorers.join(', ')}</div>
                          <div className="text-right">{awayScorers.join(', ')}</div>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-2 flex justify-between text-[9px] text-gray-500 font-mono uppercase">
                        <span>{kickoffStr}</span>
                        <span className="text-[#E11D48] font-black flex items-center gap-0.5">
                          Lock Tactics <IconChevronRight />
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'table' && (
          <div className="border border-white/10 bg-black/40 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex justify-between">
              <h3 className="font-display font-black text-xs uppercase tracking-widest">Premier League Table</h3>
              <span className="text-[9px] text-zinc-500">3 pts win · 1 draw · 0 loss</span>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase text-zinc-400 border-b border-white/10">
                  <th className="px-4 py-2">#</th>
                  <th className="py-2">Club</th>
                  <th className="py-2 text-center">P</th>
                  <th className="py-2 text-center">W</th>
                  <th className="py-2 text-center">D</th>
                  <th className="py-2 text-center">L</th>
                  <th className="py-2 text-center">GD</th>
                  <th className="px-4 py-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={row.teamId} className="border-b border-white/5 text-sm">
                    <td className="px-4 py-2 font-mono text-zinc-500">{i + 1}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <FlagImage countryName={row.name} size="xs" className="w-5 h-5 rounded-full" />
                        <span className="font-display font-black uppercase text-[11px]">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-2 text-center font-mono text-zinc-400">{row.played}</td>
                    <td className="py-2 text-center font-mono text-zinc-400">{row.won}</td>
                    <td className="py-2 text-center font-mono text-zinc-400">{row.drawn}</td>
                    <td className="py-2 text-center font-mono text-zinc-400">{row.lost}</td>
                    <td className="py-2 text-center font-mono text-zinc-400">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                    <td className="px-4 py-2 text-right font-display font-black text-[#E11D48]">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
