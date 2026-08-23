'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getAvatarUrl, getStoredProfile, type FootballIQProfile } from '@/lib/profileSync';
import { clockNow, getMatchClockStatus } from '@/lib/matchUtils';
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
      try {
        const [boardRes, statsRes, matchRes, teamRes] = await Promise.all([
          fetchWithTimeout('/api/leaderboard?limit=50'),
          fetchWithTimeout('/api/stats'),
          fetchWithTimeout('/api/matches'),
          fetchWithTimeout('/api/teams'),
        ]);
        if (boardRes.ok) {
          const data = await boardRes.json();
          setEntries(Array.isArray(data.entries) ? data.entries : []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (!data.degraded) {
            setStats({
              takes: Number(data.takes) || 0,
              cases: Number(data.cases) || 0,
              cards: Number(data.cards) || 0,
            });
          }
        }
        if (matchRes.ok) {
          const data = await matchRes.json();
          setMatches(Array.isArray(data) ? data : []);
        }
        if (teamRes.ok) {
          const data = await teamRes.json();
          setTeams(Array.isArray(data) ? data : []);
        }
      } catch {
        setEntries([]);
      } finally {
        setReady(true);
      }
    };
    void load();
    return () => window.removeEventListener('storage', sync);
  }, []);

  const clock = nowMs || 0;
  const featured = useMemo(() => pickFeaturedMatch(matches, clock), [matches, clock]);
  const featuredStatus = featured ? getMatchClockStatus(featured, clock) : 'UPCOMING';
  const leader = entries[0] ?? null;
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

  return (
    <div className="relative min-h-screen bg-[#030712] text-white pt-[52px]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-[11px] font-semibold text-zinc-400">
          {ready
            ? `${formatCount(stats.cases)} on the board · ${formatCount(stats.cards)} cards · ${formatCount(stats.takes)} takes`
            : 'Public OVR board'}
        </p>

        <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl uppercase tracking-tight leading-[0.95]">
          Rank is the OVR.
          <br />
          <span className="text-[#E11D48]">Take #1.</span>
        </h1>
        <p className="mt-3 text-sm text-zinc-400 max-w-md">
          Call the next fixture. Climb. If someone has a higher OVR, they sit above you. Nothing else counts.
        </p>

        <section className="mt-8 border border-white/10 rounded-2xl bg-[#0B0F19] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E11D48]">
            {youAreOne ? 'Defend #1' : 'Claim #1'}
          </p>
          <p className="mt-2 font-display font-black text-2xl uppercase tracking-tight">
            {leader
              ? youAreOne
                ? `You're ${leader.overallRating} OVR`
                : `Beat ${leader.username} · ${leader.overallRating} OVR`
              : 'Board is empty. Take it.'}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            You are {yourOvr} OVR{youRank ? ` · #${youRank.rank}` : ' · unranked'}.
          </p>
          <Link
            href={playHref}
            className="mt-5 flex items-center justify-center w-full py-3.5 rounded-xl bg-[#E11D48] hover:bg-[#be123c] text-white font-display font-black text-xs uppercase tracking-widest"
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
        </section>

        <ol className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {!ready && (
            <li className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Loading the board...
            </li>
          )}
          {ready && entries.length === 0 && (
            <li className="py-8 text-center text-sm text-zinc-500">
              Nobody is on the board yet. First call takes #1.
            </li>
          )}
          {entries.map((entry) => {
            const mine = youName && entry.username.toLowerCase() === youName.toLowerCase();
            return (
              <li key={`${entry.rank}-${entry.username}`}>
                <Link
                  href={`/u/${encodeURIComponent(entry.username)}`}
                  className={`flex items-center gap-3 py-3.5 hover:bg-white/[0.03] ${mine ? 'bg-[#E11D48]/5' : ''}`}
                >
                  <span className={`w-10 shrink-0 font-display font-black text-lg ${entry.rank === 1 ? 'text-[#E11D48]' : 'text-zinc-500'}`}>
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
                    <span className="block text-[10px] uppercase tracking-widest text-zinc-500 truncate">
                      {entry.favoriteClub || entry.favoriteNation || 'Free agent'}
                    </span>
                  </span>
                  <span className={`font-display font-black text-xl tabular-nums ${entry.rank === 1 ? 'text-[#E11D48]' : 'text-white'}`}>
                    {entry.overallRating}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-[11px] text-zinc-600">
          Rank is the OVR — nothing else.
        </p>
      </div>
    </div>
  );
}
