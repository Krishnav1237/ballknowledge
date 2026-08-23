'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import FlagImage from '@/components/FlagImage';
import PageShell from '@/components/PageShell';
import { getAvatarUrl, getStoredProfile, type FootballIQProfile } from '@/lib/profileSync';
import { catalogMatches, catalogTeams, fetchLeagueBoard, leagueKeys } from '@/lib/leagueCatalog';
import { clockNow, formatKickoffLabel, getMatchClockStatus } from '@/lib/matchUtils';
import { matchActionLabel, pickFeaturedMatch } from '@/lib/matchday';
import type { LeaderboardEntry } from '@/lib/boardSnapshot';

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
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function statusTone(status: 'LIVE' | 'COMPLETED' | 'UPCOMING') {
  if (status === 'LIVE') return 'text-red-400 bg-red-950/30 border-red-900/40';
  if (status === 'COMPLETED') return 'text-zinc-400 bg-black/40 border-white/10';
  return 'text-[#E11D48] bg-[#E11D48]/10 border-[#E11D48]/25';
}

export default function GameBoard() {
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [nowMs, setNowMs] = useState(0);

  const boardQuery = useQuery({
    queryKey: leagueKeys.board,
    queryFn: fetchLeagueBoard,
    staleTime: 15_000,
    refetchInterval: (query) => (query.state.data?.degraded ? 3_000 : false),
  });

  useEffect(() => {
    setNowMs(clockNow());
    const id = setInterval(() => setNowMs(clockNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setProfile(getStoredProfile());
    const sync = () => setProfile(getStoredProfile());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const matches = useMemo(() => catalogMatches() as Match[], []);
  const teams = useMemo(() => catalogTeams() as Team[], []);
  const entries: LeaderboardEntry[] = boardQuery.data?.entries ?? [];
  const statsReady = Boolean(boardQuery.data && !boardQuery.data.degraded);
  const stats = boardQuery.data?.stats ?? { takes: 0, cases: 0, cards: 0 };
  const boardReady = !boardQuery.isPending;

  const clock = nowMs;
  const featured = useMemo(() => pickFeaturedMatch(matches, clock), [matches, clock]);
  const featuredStatus = featured ? getMatchClockStatus(featured, clock || 0) : 'UPCOMING';
  const leader = entries[0] ?? null;
  const chase = entries[1] ?? null;
  const rest = entries.slice(1, 12);
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
    <PageShell atmosphere="arena" width="board">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <section className="relative flex flex-col gap-6 lg:col-span-7">
          <p className="pointer-events-none absolute -top-8 right-0 select-none font-display text-[7.5rem] font-black leading-none text-white/[0.04] sm:text-[10rem]">
            01
          </p>
          <header className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#E11D48]">Premier League 26/27</p>
            <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.88] tracking-tight sm:text-7xl">
              Rank is the OVR.
              <br />
              <span className="ovr-glow text-[#E11D48]">Take #1.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm font-semibold text-zinc-300">
              Call the next fixture. Climb the public board. Rank is the number — nothing else.
            </p>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {statsReady ? `${formatCount(stats.cases)} on the board` : 'Board live'}
              {' · '}
              {statsReady ? `${formatCount(stats.cards)} cards` : 'cards pending'}
              {' · '}
              you {yourOvr} ovr{youRank ? ` · #${youRank.rank}` : ''}
            </p>
          </header>

          {featured ? (
            <article className="ticket relative overflow-hidden rounded-[28px] p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusTone(featuredStatus)}`}>
                  {featuredStatus === 'LIVE' ? 'Live now' : featuredStatus === 'COMPLETED' ? 'Full time' : `Next · MW ${featured.matchday}`}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {formatKickoffLabel(featured.local_date)}
                </span>
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
                  <FlagImage countryName={homeName} size="xl" className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20" />
                  <p className="text-center font-display text-lg font-black uppercase leading-tight tracking-tight sm:text-2xl">{homeName}</p>
                </div>
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#E11D48]/40 bg-[#E11D48]/10 sm:h-20 sm:w-20">
                  <span className="ovr-glow font-display text-2xl font-black text-[#E11D48] sm:text-3xl">VS</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-3">
                  <FlagImage countryName={awayName} size="xl" className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20" />
                  <p className="text-center font-display text-lg font-black uppercase leading-tight tracking-tight sm:text-2xl">{awayName}</p>
                </div>
              </div>

              <Link
                href={playHref}
                className="mt-7 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#881337] to-[#E11D48] py-4 font-display text-xs font-black uppercase tracking-[0.22em] text-white shadow-[0_8px_28px_rgba(225,29,72,0.35)] hover:brightness-110"
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
            </article>
          ) : (
            <Link
              href="/premier-league"
              className="ticket rounded-[28px] px-6 py-10 text-center font-display font-black uppercase tracking-widest text-[#E11D48]"
            >
              Open season
            </Link>
          )}
        </section>

        <aside className="lg:col-span-5">
          <div className="scoreboard overflow-hidden rounded-[28px]">
            <div className="flex items-end justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E11D48]">
                  {youAreOne ? 'Defend #1' : 'Public board'}
                </p>
                <p className="mt-1 font-display text-xl font-black uppercase tracking-tight">
                  {leader ? `Beat ${leader.username}` : boardReady ? 'Board is empty. Take it.' : 'Public board'}
                </p>
              </div>
              {leader && (
                <div className="text-right">
                  <p className="ovr-glow font-display text-5xl font-black leading-none tabular-nums text-[#E11D48]">{leader.overallRating}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-500">#1 OVR</p>
                </div>
              )}
            </div>

            {leader && (
              <Link
                href={`/u/${encodeURIComponent(leader.username)}`}
                className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#E11D48]/20 to-transparent px-5 py-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAvatarUrl(leader.avatarStyle, leader.avatarSeed)}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover border-2 border-[#E11D48] shadow-[0_0_18px_rgba(225,29,72,0.45)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-black uppercase">
                    {leader.username}
                    {youAreOne ? ' · you' : ''}
                  </p>
                  <p className="truncate text-[10px] uppercase tracking-widest text-zinc-400">
                    {leader.favoriteClub || leader.favoriteNation || 'Free agent'}
                    {chase ? ` · chased by ${chase.username}` : ''}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E11D48]">#1</span>
              </Link>
            )}

            <ol className="custom-scrollbar max-h-[440px] divide-y divide-white/8 overflow-y-auto">
              {!boardReady &&
                Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className="h-4 w-8 rounded skel" />
                    <span className="h-8 w-8 rounded-full skel" />
                    <span className="h-4 flex-1 rounded skel" />
                    <span className="h-5 w-8 rounded skel" />
                  </li>
                ))}
              {boardReady && entries.length === 0 && (
                <li className="px-5 py-10 text-center text-sm text-zinc-500">
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
                      <span className="w-8 shrink-0 font-display text-sm font-black tabular-nums text-zinc-500">
                        #{entry.rank}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getAvatarUrl(entry.avatarStyle, entry.avatarSeed)}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover border border-white/10"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-sm font-black uppercase">
                          {entry.username}
                          {mine ? ' · you' : ''}
                        </span>
                        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/10">
                          <span
                            className="block h-full rounded-full bg-gradient-to-r from-[#881337] to-[#E11D48]"
                            style={{ width: `${Math.max(8, Math.min(100, entry.overallRating))}%` }}
                          />
                        </span>
                      </span>
                      <span className="font-display text-lg font-black tabular-nums">{entry.overallRating}</span>
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
    </PageShell>
  );
}
