import React from 'react';
import { X } from 'lucide-react';
import { Player, getRosterForTeam, getPlayerImageUrl, isPlayerAllowedForSlot } from '@/lib/roster';

const PITCH_SLOTS = [
  { id: 'GK', label: 'GK', category: 'GK' },
  { id: 'LB', label: 'LB', category: 'DEF' },
  { id: 'LCB', label: 'LCB', category: 'DEF' },
  { id: 'RCB', label: 'RCB', category: 'DEF' },
  { id: 'RB', label: 'RB', category: 'DEF' },
  { id: 'LCM', label: 'LCM', category: 'MID' },
  { id: 'CDM', label: 'CDM', category: 'MID' },
  { id: 'RCM', label: 'RCM', category: 'MID' },
  { id: 'LW', label: 'LW', category: 'FWD' },
  { id: 'ST', label: 'ST', category: 'FWD' },
  { id: 'RW', label: 'RW', category: 'FWD' }
];

function getFlagEmoji(countryName: string): string {
  const normalized = countryName.toLowerCase();
  if (normalized.includes('arg')) return '🇦🇷';
  if (normalized.includes('bra')) return '🇧🇷';
  if (normalized.includes('por')) return '🇵🇹';
  if (normalized.includes('fra')) return '🇫🇷';
  if (normalized.includes('eng') || normalized.includes('gbr')) return '🏴\u200d󠁢\u200d󠁥\u200d󠁮\u200d󠁧\u200d󠁿';
  if (normalized.includes('ger') || normalized.includes('deu')) return '🇩🇪';
  if (normalized.includes('spa') || normalized.includes('esp')) return '🇪🇸';
  if (normalized.includes('net') || normalized.includes('hol') || normalized.includes('nld')) return '🇳🇱';
  if (normalized.includes('uru')) return '🇺🇾';
  if (normalized.includes('mar') || normalized.includes('mor')) return '🇲🇦';
  if (normalized.includes('jap') || normalized.includes('jpn')) return '🇯🇵';
  if (normalized.includes('sau') || normalized.includes('ksa')) return '🇸🇦';
  if (normalized.includes('usa') || normalized.includes('america') || normalized.includes('united states')) return '🇺🇸';
  if (normalized.includes('can')) return '🇨🇦';
  if (normalized.includes('mex')) return '🇲🇽';
  if (normalized.includes('ita')) return '🇮🇹';
  if (normalized.includes('cro')) return '🇭🇷';
  if (normalized.includes('bel')) return '🇧🇪';
  if (normalized.includes('sen')) return '🇸🇳';
  if (normalized.includes('swe')) return '🇸🇪';
  if (normalized.includes('tun')) return '🇹🇳';
  if (normalized.includes('egy')) return '🇪🇬';
  if (normalized.includes('irn') || normalized.includes('iran')) return '🇮🇷';
  if (normalized.includes('nzl') || normalized.includes('new zealand')) return '🇳🇿';
  return '🌍';
}

interface PlayerSelectorModalProps {
  selectedSlot: string;
  lineup: Record<string, Player>;
  homeTeam: { name_en: string; flag: string };
  awayTeam: { name_en: string; flag: string };
  onClose: () => void;
  onSelect: (player: Player) => void;
}

export default function PlayerSelectorModal({
  selectedSlot,
  lineup,
  homeTeam,
  awayTeam,
  onClose,
  onSelect
}: PlayerSelectorModalProps) {
  const activeSlot = PITCH_SLOTS.find(s => s.id === selectedSlot);
  if (!activeSlot) return null;

  const homeRoster = getRosterForTeam(homeTeam.name_en, homeTeam.flag);
  const awayRoster = getRosterForTeam(awayTeam.name_en, awayTeam.flag);
  const combinedRoster = [...homeRoster, ...awayRoster];
  
  // Filter by specific position
  const filteredRoster = combinedRoster.filter(p => isPlayerAllowedForSlot(p, activeSlot.id));
  // Sort by rating descending
  const sortedRoster = [...filteredRoster].sort((a, b) => b.rating - a.rating);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0B0F19] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] shadow-[0_0_30px_rgba(217,119,6,0.15)] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Select Player</span>
            <h3 className="font-display font-black text-base uppercase tracking-wider text-white mt-0.5">
              Position: {activeSlot.label}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable list of players */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {sortedRoster.map((player, idx) => {
            const isChosenElsewhere = Object.entries(lineup).some(([pos, p]) => p.name === player.name && p.team === player.team);
            const isChosenInCurrentSlot = lineup[activeSlot.id]?.name === player.name && lineup[activeSlot.id]?.team === player.team;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isChosenElsewhere) return;
                  onSelect(player);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isChosenInCurrentSlot
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : isChosenElsewhere
                    ? 'bg-gray-900/40 border-white/5 opacity-40 cursor-not-allowed text-gray-500'
                    : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-white/5 cursor-pointer text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Player Image with flag overlay */}
                  <div className="relative w-10 h-10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPlayerImageUrl(player.name)}
                      alt={player.name}
                      className="w-full h-full object-contain rounded-full bg-white/5 border border-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(player.name)}&backgroundColor=0f172a,1e1b4b,111827`;
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 text-sm bg-black/60 rounded-full px-0.5 shadow-sm leading-none">
                      {getFlagEmoji(player.team)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase tracking-wide text-white">
                      {player.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                      {player.team} • {player.specificPosition}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isChosenElsewhere && (
                    <span className="text-[9px] font-black uppercase bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                      In Lineup
                    </span>
                  )}
                  <span className="font-mono font-black text-base text-amber-400">
                    {player.rating}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
