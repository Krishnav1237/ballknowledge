'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FlagImage from '@/components/FlagImage';
import { getAvatarUrl, getStoredProfile, type FootballIQProfile } from '@/lib/profileSync';
import { clockNow, getMatchClockStatus, parseLocalDate } from '@/lib/matchUtils';
import { fetchWithTimeout } from '@/lib/requestBounds';
import { matchActionLabel, pickFeaturedMatch } from '@/lib/matchday';
import type { LeaderboardEntry } from '@/app/api/leaderboard/route';

type Team = { id: string; name_en: string };
type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
};

function nameOf(teams: Team[], match: Match, side: 'home' | 'away'): string {
  const id = side === 'home' ? match.home_team_id : match.away_team_id;
  return (
    teams.find((team) => team.id === id)?.name_en ||
    (side === 'home' ? match.home_team_name_en : match.away_team_name_en) ||
    (side === 'home' ? 'Home' : 'Away')
  );
}

function formatCount(n: number): string {
  return n.toLocaleString('en-GB');
}

function kickoffLabel(match: Match): string {
  return parseLocalDate(match.local_date, match.stadium_id).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function GameBoard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({ takes: 0, cases: 0, cards: 0 });
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNowMs(clockNow());
    const id = setInterval(() => setNowMs(clockNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setProfile(getStoredProfile());
    const sync = () => setProfile(getStoredProfile());
    window.addEventListener('storage', sync);

    const load = async () => {
      const read = async (url: string) => {
        try {
          const res = await fetchWithTimeout(url);
          if (!res.ok) return null;
          return res.json();
        } catch {
          return null;
        }
      };
      const [boardData, statsData, matchData, teamData] = await Promise.all([
        read('/api/leaderboard?limit=50'),
        read('/api/stats'),
        read('/api/matches'),
        read('/api/teams'),
      ]);
      if (boardData && Array.isArray(boardData.entries)) setEntries(boardData.entries);
      if (statsData && !statsData.degraded) {
        setStats({
          takes: Number(statsData.takes) || 0,
          cases: Number(statsData.cases) || 0,
          cards: Number(statsData.cards) || 0,
        });
      }
      if (Array.isArray(matchData)) setMatches(matchData);
      if (Array.isArray(teamData)) setTeams(teamData);
      setReady(true);
    };
    void load();
    return () => window.removeEventListener('storage', sync);
  }, []);

  const clock = nowMs || 0;
  const featured = useMemo(() => pickFeaturedMatch(matches, clock), [matches, clock]);
  const featuredStatus = featured ? getMatchClockStatus(featured, clock) : 'UPCOMING';
  const leader = entries[0] ?? null;
  const chase = entries[1] ?? null;
  const rest = entries.slice(1);
  const youName = profile?.username;
  const youRank = youName
    ? entries.find((entry) => entry.username.toLowerCase() === youName.toLowerCase())
    : undefined;
  const youAreOne = Boolean(leader && youName && leader.username.toLowerCase() === youName.toLowerCase());
  const yourOvr = profile?.overallRating ?? 50;
  const playHref = featured ? `/match/${featured.id}` : '/premier-league';
  const playLabel = featured
    ? `${matchActionLabel(featuredStatus, false)} · ${nameOf(teams, featured, 'home')} vs ${nameOf(teams, featured, 'away')}`
    : 'Open season';
  const homeName = featured ? nameOf(teams, featured, 'home') : '';
  const awayName = featured ? nameOf(teams, featured, 'away') : '';

  return (
    <div className="relative min-h-screen bg-[#030712] text-white pt-[52px]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image src="/images/stadium_bg.webp" alt="" fill className="object-cover opacity-[0.34]" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/75 via-[#030712]/55 to-[#030712]" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[720px] h-[280px] bg-[#E11D48]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { n: ready ? formatCount(stats.cases) : '—', l: 'On the board' },
            { n: ready ? formatCount(stats.cards) : '—', l: 'Cards' },
            { n: ready ? formatCount(stats.takes) : '—', l: 'Takes' },
            { n: String(yourOvr), l: youRank ? `You · #${youRank.rank}` : 'You · unranked' },
          ].map((chip) => (
            <div key={chip.l} className="hud-chip rounded-full px-3 py-1.5 flex items-baseline gap-2">
              <span className="font-display font-black text-sm text-[#E11D48] tabular-nums">{chip.n}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{chip.l}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <section className="lg:col-span-7 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#E11D48]">Premier League 26/27</p>
              <h1 className="mt-2 font-display font-black text-5xl sm:text-6xl uppercase tracking-tight leading-[0.9]">
                Rank is the OVR.
                <br />
                <span className="text-[#E11D48] ovr-glow">Take #1.</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-zinc-300 max-w-lg font-semibold">
                One public board. Call the next fixture. Climb or get climbed on.
              </p>
            </div>

            {featured && (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19]/85 backdrop-blur-md p-5 sm:p-6">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E11D48] to-transparent" />
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${
                    featuredStatus === 'LIVE'
                      ? 'text-red-400 bg-red-950/30 border-red-900/40'
                      : featuredStatus === 'COMPLETED'
                        ? 'text-zinc-400 bg-black/40 border-white/10'
                        : 'text-[#E11D48] bg-[#E11D48]/10 border-[#E11D48]/25'
                  }`}>
                    {featuredStatus === 'LIVE' ? 'Live now' : featuredStatus === 'COMPLETED' ? 'Full time' : `Next · MW ${featured.matchday}`}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{kickoffLabel(featured)}</span>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <FlagImage countryName={homeName} size="xl" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
                    <p className="font-display font-black text-base sm:text-xl uppercase tracking-tight text-center leading-tight">{homeName}</p>
                  </div>
                  <div className="shrink-0 font-display font-black text-3xl sm:text-5xl text-[#E11D48] ovr-glow">VS</div>
                  <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <FlagImage countryName={awayName} size="xl" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
                    <p className="font-display font-black text-base sm:text-xl uppercase tracking-tight text-center leading-tight">{awayName}</p>
                  </div>
                </div>

                <Link
                  href={playHref}
                  className="mt-6 flex items-center justify-center w-full py-4 rounded-2xl bg-gradient-to-r from-[#881337] to-[#E11D48] text-white font-display font-black text-xs uppercase tracking-[0.2em] shadow-[0_8px_28px_rgba(225,29,72,0.35)] hover:brightness-110"
                >
                  {playLabel}
                </Link>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm ${yourOvr} OVR on BallKnowledge. Rank is the OVR. Take #1.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
                >
                  Post your OVR
                </a>
              </div>
            )}

            {!featured && ready && (
              <Link
                href="/premier-league"
                className="rounded-3xl border border-white/10 bg-[#0B0F19]/85 px-6 py-8 text-center font-display font-black uppercase tracking-widest text-[#E11D48]"
              >
                Open season
              </Link>
            )}
          </section>

          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-[#0B0F19]/90 backdrop-blur-md overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E11D48]">
                    {youAreOne ? 'Defend #1' : 'Public board'}
                  </p>
                  <p className="font-display font-black text-lg uppercase tracking-tight">
                    {leader ? `Beat ${leader.username}` : 'Board is empty. Take it.'}
                  </p>
                </div>
                {leader && (
                  <div className="text-right">
                    <p className="font-display font-black text-3xl leading-none text-[#E11D48] ovr-glow tabular-nums">{leader.overallRating}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">#1 OVR</p>
                  </div>
                )}
              </div>

              {leader && (
                <Link
                  href={`/u/${encodeURIComponent(leader.username)}`}
                  className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#E11D48]/15 to-transparent border-b border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAvatarUrl(leader.avatarStyle, leader.avatarSeed)}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#E11D48] shadow-[0_0_18px_rgba(225,29,72,0.45)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-black text-base uppercase truncate">
                      {leader.username}
                      {youAreOne ? ' · you' : ''}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 truncate">
                      {leader.favoriteClub || leader.favoriteNation || 'Free agent'}
                      {chase ? ` · chased by ${chase.username}` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#E11D48]">#1</span>
                </Link>
              )}

              <ol className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-white/8">
                {!ready && (
                  <li className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Loading the board...
                  </li>
                )}
                {ready && entries.length === 0 && (
                  <li className="py-10 px-5 text-center text-sm text-zinc-500">
                    Nobody is on the board yet. First call takes #1.
                  </li>
                )}
                {rest.map((entry) => {
                  const mine = youName && entry.username.toLowerCase() === youName.toLowerCase();
                  return (
                    <li key={`${entry.rank}-${entry.username}`}>
                      <Link
                        href={`/u/${encodeURIComponent(entry.username)}`}
                        className={`flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] ${mine ? 'bg-[#E11D48]/10' : ''}`}
                      >
                        <span className="w-8 shrink-0 font-display font-black text-sm text-zinc-500 tabular-nums">
                          #{entry.rank}
                        </span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getAvatarUrl(entry.avatarStyle, entry.avatarSeed)}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-display font-black text-sm uppercase truncate">
                            {entry.username}
                            {mine ? ' · you' : ''}
                          </span>
                          <span className="mt-1 block h-1 rounded-full bg-white/10 overflow-hidden">
                            <span
                              className="block h-full rounded-full bg-gradient-to-r from-[#881337] to-[#E11D48]"
                              style={{ width: `${Math.max(8, Math.min(100, entry.overallRating))}%` }}
                            />
                          </span>
                        </span>
                        <span className="font-display font-black text-lg tabular-nums">{entry.overallRating}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
            <p className="mt-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-600">
              Rank is the OVR — nothing else.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
