'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FlagImage from '@/components/FlagImage';
import { getStoredPredictions, getStoredProfile, type FootballIQProfile } from '@/lib/profileSync';
import { clockNow, getMatchClockStatus, parseLocalDate } from '@/lib/matchUtils';
import { fetchWithTimeout } from '@/lib/requestBounds';
import { listMatchQueue, matchActionLabel, pickFeaturedMatch } from '@/lib/matchday';

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

function teamName(teams: Team[], match: Match, side: 'home' | 'away'): string {
  const id = side === 'home' ? match.home_team_id : match.away_team_id;
  const fromList = teams.find((team) => team.id === id)?.name_en;
  if (fromList) return fromList;
  return side === 'home' ? match.home_team_name_en || 'Home' : match.away_team_name_en || 'Away';
}

function kickoffLabel(match: Match): string {
  return parseLocalDate(match.local_date, match.stadium_id).toLocaleString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function MatchdayHQ() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [profile, setProfile] = useState<FootballIQProfile | null>(null);
  const [preds, setPreds] = useState<Record<string, unknown>>({});
  const [nowMs, setNowMs] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNowMs(clockNow());
    const id = setInterval(() => setNowMs(clockNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setProfile(getStoredProfile());
    setPreds(getStoredPredictions());
    const sync = () => {
      setProfile(getStoredProfile());
      setPreds(getStoredPredictions());
    };
    window.addEventListener('storage', sync);

    const load = async () => {
      try {
        const [matchRes, teamRes] = await Promise.all([
          fetchWithTimeout('/api/matches'),
          fetchWithTimeout('/api/teams'),
        ]);
        if (matchRes.ok) {
          const data = await matchRes.json();
          setMatches(Array.isArray(data) ? data : []);
        }
        if (teamRes.ok) {
          const data = await teamRes.json();
          setTeams(Array.isArray(data) ? data : []);
        }
      } catch {
        setMatches([]);
      } finally {
        setReady(true);
      }
    };
    void load();
    return () => window.removeEventListener('storage', sync);
  }, []);

  const clock = nowMs || 0;
  const featured = useMemo(() => pickFeaturedMatch(matches, clock), [matches, clock]);
  const queue = useMemo(
    () => listMatchQueue(matches, featured?.id, clock, 4),
    [matches, featured?.id, clock],
  );
  const lockedCount = Object.keys(preds).length;
  const ovr = profile?.overallRating ?? 50;
  const featuredStatus = featured ? getMatchClockStatus(featured, clock) : 'UPCOMING';
  const featuredLocked = featured ? Boolean(preds[featured.id]) : false;

  return (
    <div className="relative min-h-screen bg-[#030712] text-white pt-[52px]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image src="/images/stadium_bg.webp" alt="" fill className="object-cover opacity-[0.28]" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/55 to-[#030712]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-5 flex flex-col gap-5 min-h-[calc(100vh-52px)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#0B0F19]/85 rounded-2xl px-4 py-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#E11D48]">Season 26/27</p>
            <h1 className="font-display font-black text-lg sm:text-xl uppercase tracking-wide">
              {featured ? `Matchweek ${featured.matchday}` : 'Matchday'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-center min-w-[72px]">
              <div className="font-display font-black text-xl leading-none text-[#E11D48]">{ovr}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">OVR</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-center min-w-[72px]">
              <div className="font-display font-black text-xl leading-none">{lockedCount}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">Locked</div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-center min-w-[72px]">
              <div className="font-display font-black text-xl leading-none">{profile?.collectedCards?.length ?? 0}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-1">Cards</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          <section className="lg:col-span-7 border border-white/10 bg-[#0B0F19]/80 rounded-3xl p-5 sm:p-7 flex flex-col justify-between min-h-[340px]">
            {!ready ? (
              <div className="flex-1 flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Loading matchday...
              </div>
            ) : !featured ? (
              <div className="flex-1 flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-zinc-500">
                No fixtures loaded
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${
                    featuredStatus === 'LIVE'
                      ? 'text-red-400 bg-red-950/20 border-red-900/30'
                      : featuredStatus === 'COMPLETED'
                        ? 'text-gray-400 bg-black/30 border-white/10'
                        : 'text-[#E11D48] bg-[#E11D48]/10 border-[#E11D48]/20'
                  }`}>
                    {featuredStatus === 'LIVE' ? 'Live now' : featuredStatus === 'COMPLETED' ? 'Full time' : 'Next kickoff'}
                  </span>
                  {featuredLocked && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Call locked</span>
                  )}
                </div>

                <div className="py-8 flex items-center gap-3 sm:gap-6">
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <FlagImage countryName={teamName(teams, featured, 'home')} size="xl" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
                    <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-center leading-tight">
                      {teamName(teams, featured, 'home')}
                    </h2>
                  </div>
                  <div className="shrink-0 font-display font-black text-2xl sm:text-4xl text-[#E11D48]">VS</div>
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <FlagImage countryName={teamName(teams, featured, 'away')} size="xl" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
                    <h2 className="font-display font-black text-lg sm:text-2xl uppercase tracking-tight text-center leading-tight">
                      {teamName(teams, featured, 'away')}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{kickoffLabel(featured)}</p>
                  <Link
                    href={`/match/${featured.id}`}
                    className="px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest text-white text-center bg-gradient-to-r from-[#881337] to-[#E11D48] hover:opacity-90"
                  >
                    {matchActionLabel(featuredStatus, featuredLocked)}
                  </Link>
                </div>
              </>
            )}
          </section>

          <aside className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Queue</h3>
              <Link href="/premier-league" className="text-[10px] font-black uppercase tracking-widest text-[#E11D48]">
                Season map
              </Link>
            </div>
            {queue.map((match) => {
              const status = getMatchClockStatus(match, clock);
              const locked = Boolean(preds[match.id]);
              return (
                <Link
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="border border-white/10 hover:border-[#E11D48]/45 bg-[#0B0F19]/80 rounded-2xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      MW {match.matchday}
                      {locked ? ' · Locked' : ''}
                      {status === 'LIVE' ? ' · Live' : ''}
                    </p>
                    <p className="font-display font-black text-sm uppercase truncate">
                      {teamName(teams, match, 'home')} vs {teamName(teams, match, 'away')}
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#E11D48] shrink-0">
                    {matchActionLabel(status, locked)}
                  </span>
                </Link>
              );
            })}
            {ready && queue.length === 0 && (
              <div className="border border-white/10 rounded-2xl px-4 py-8 text-center text-[11px] font-black uppercase tracking-widest text-zinc-500">
                Queue clear. Open the season map.
              </div>
            )}
            <div className="mt-auto grid grid-cols-2 gap-2">
              <Link href="/leaderboard" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center">
                <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">Ranked</span>
                <span className="font-display font-black text-sm uppercase">Board</span>
              </Link>
              <Link href="/football-iq" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-center">
                <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">Inventory</span>
                <span className="font-display font-black text-sm uppercase">Card</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
