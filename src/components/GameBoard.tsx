'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import FlagImage from '@/components/FlagImage';
import PageShell from '@/components/PageShell';
import { getAvatarUrl, getStoredProfile, type FootballIQProfile } from '@/lib/profileSync';
import {
  catalogMatches,
  catalogTeams,
  fetchLeagueLeaderboard,
  fetchLeagueMatches,
  fetchLeagueStats,
  fetchLeagueTeams,
  leagueKeys,
} from '@/lib/leagueCatalog';
import { clockNow, getMatchClockStatus, parseLocalDate } from '@/lib/matchUtils';
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

function statusTone(status: 'LIVE' | 'COMPLETED' | 'UPCOMING') {
  if (status === 'LIVE') return 'text-red-400 bg-red-950/30 border-red-900/40';
  if (status === 'COMPLETED') return 'text-zinc-400 bg-black/40 border-white/10';
  return 'text-[#E11D48] bg-[#E11D48]/10 border-[#E11D48]/25';
}

export default function GameBoard() {
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [nowMs, setNowMs] = useState(0);

  const matchesQuery = useQuery({
    queryKey: leagueKeys.matches,
    queryFn: fetchLeagueMatches,
    placeholderData: catalogMatches,
    staleTime: 30_000,
  });
  const teamsQuery = useQuery({
    queryKey: leagueKeys.teams,
    queryFn: fetchLeagueTeams,
    placeholderData: catalogTeams,
    staleTime: Infinity,
  });
  const boardQuery = useQuery({
    queryKey: leagueKeys.leaderboard,
    queryFn: () => fetchLeagueLeaderboard(50),
    staleTime: 15_000,
  });
  const statsQuery = useQuery({
    queryKey: leagueKeys.stats,
    queryFn: fetchLeagueStats,
    staleTime: 15_000,
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

  const matches = useMemo(() => (matchesQuery.data ?? []) as Match[], [matchesQuery.data]);
  const teams = useMemo(() => (teamsQuery.data ?? []) as Team[], [teamsQuery.data]);
  const entries: LeaderboardEntry[] = boardQuery.data ?? [];
  const statsReady = Boolean(statsQuery.data && !statsQuery.data.degraded);
  const stats = statsQuery.data ?? { takes: 0, cases: 0, cards: 0 };
  const boardReady = !boardQuery.isPending;

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

  const chips = [
    { n: statsReady ? formatCount(stats.cases) : '—', l: 'On the board' },
    { n: statsReady ? formatCount(stats.cards) : '—', l: 'Cards' },
    { n: statsReady ? formatCount(stats.takes) : '—', l: 'Takes' },
    { n: String(yourOvr), l: youRank ? `You · #${youRank.rank}` : 'You · unranked' },
  ];

  return (
    <PageShell atmosphere="stadium" width="board">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <div key={chip.l} className="hud-chip flex items-baseline gap-2 rounded-full px-3 py-1.5">
            <span className="font-display text-sm font-black tabular-nums text-[#E11D48]">{chip.n}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{chip.l}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <section className="flex flex-col gap-5 lg:col-span-7">
          <header>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#E11D48]">Premier League 26/27</p>
            <h1 className="mt-2 font-display text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl">
              Rank is the OVR.
              <br />
              <span className="ovr-glow text-[#E11D48]">Take #1.</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm font-semibold text-zinc-300 sm:text-base">
              One public board. Call the next fixture. Climb or get climbed on.
            </p>
          </header>

          {featured ? (
            <article className="panel relative overflow-hidden rounded-3xl p-5 sm:p-6">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#E11D48] to-transparent" />
              <div className="mb-5 flex items-center justify-between gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${statusTone(featuredStatus)}`}>
                  {featuredStatus === 'LIVE' ? 'Live now' : featuredStatus === 'COMPLETED' ? 'Full time' : `Next · MW ${featured.matchday}`}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{kickoffLabel(featured)}</span>
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <FlagImage countryName={homeName} size="xl" className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20" />
                  <p className="text-center font-display text-base font-black uppercase leading-tight tracking-tight sm:text-xl">{homeName}</p>
                </div>
                <div className="ovr-glow shrink-0 font-display text-3xl font-black text-[#E11D48] sm:text-5xl">VS</div>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <FlagImage countryName={awayName} size="xl" className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20" />
                  <p className="text-center font-display text-base font-black uppercase leading-tight tracking-tight sm:text-xl">{awayName}</p>
                </div>
              </div>

              <Link
                href={playHref}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#881337] to-[#E11D48] py-4 font-display text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_28px_rgba(225,29,72,0.35)] hover:brightness-110"
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
              className="panel rounded-3xl px-6 py-8 text-center font-display font-black uppercase tracking-widest text-[#E11D48]"
            >
              Open season
            </Link>
          )}
        </section>

        <aside className="lg:col-span-5">
          <div className="panel overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#E11D48]">
                  {youAreOne ? 'Defend #1' : 'Public board'}
                </p>
                <p className="font-display text-lg font-black uppercase tracking-tight">
                  {leader ? `Beat ${leader.username}` : boardReady ? 'Board is empty. Take it.' : 'Public board'}
                </p>
              </div>
              {leader && (
                <div className="text-right">
                  <p className="ovr-glow font-display text-3xl font-black leading-none tabular-nums text-[#E11D48]">{leader.overallRating}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-zinc-500">#1 OVR</p>
                </div>
              )}
            </div>

            {leader && (
              <Link
                href={`/u/${encodeURIComponent(leader.username)}`}
                className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#E11D48]/15 to-transparent px-5 py-4"
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

            <ol className="custom-scrollbar max-h-[420px] divide-y divide-white/8 overflow-y-auto">
              {!boardReady &&
                Array.from({ length: 6 }).map((_, i) => (
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
