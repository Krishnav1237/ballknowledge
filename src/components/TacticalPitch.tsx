import React from 'react';
import { Plus, X } from 'lucide-react';
import { Player, getPlayerImageUrl } from '@/lib/roster';

/**
 * Coordinates and category classification of the 11 player slots
 * representing a standard 4-3-3 formation grid on the tactical pitch.
 * Positions are defined in percentages relative to the pitch container width/height.
 */
const PITCH_SLOTS = [
  { id: 'GK', label: 'GK', category: 'GK', left: '50%', top: '88%' },
  { id: 'LB', label: 'LB', category: 'DEF', left: '15%', top: '70%' },
  { id: 'LCB', label: 'LCB', category: 'DEF', left: '38%', top: '73%' },
  { id: 'RCB', label: 'RCB', category: 'DEF', left: '62%', top: '73%' },
  { id: 'RB', label: 'RB', category: 'DEF', left: '85%', top: '70%' },
  { id: 'LCM', label: 'LCM', category: 'MID', left: '25%', top: '42%' },
  { id: 'CDM', label: 'CDM', category: 'MID', left: '50%', top: '52%' },
  { id: 'RCM', label: 'RCM', category: 'MID', left: '75%', top: '42%' },
  { id: 'LW', label: 'LW', category: 'FWD', left: '20%', top: '15%' },
  { id: 'ST', label: 'ST', category: 'FWD', left: '50%', top: '10%' },
  { id: 'RW', label: 'RW', category: 'FWD', left: '80%', top: '15%' }
];

function getFlagEmoji(countryName: string): string {
  const normalized = countryName.trim().toLowerCase();
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

interface TacticalPitchProps {
  lineup: Record<string, Player>;
  isReadOnly: boolean;
  isSubmissionLocked: boolean;
  homeTeamName: string;
  onSlotClick: (slotId: string) => void;
  onClearSlot: (slotId: string) => void;
}

export default function TacticalPitch({
  lineup,
  isReadOnly,
  isSubmissionLocked,
  homeTeamName,
  onSlotClick,
  onClearSlot
}: TacticalPitchProps) {
  const activeIsLocked = isReadOnly || isSubmissionLocked;

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-green-500/20 bg-gradient-to-b from-[#0e2c1e] via-[#0b1f15] to-[#050f0a] shadow-[0_0_35px_rgba(16,185,129,0.15)] select-none">
      {/* Pitch grass texture */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(0deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.1) 40px, transparent 40px, transparent 80px)`
      }} />
      
      {/* Pitch markings */}
      <div className="absolute inset-4 border border-white/10 rounded-2xl pointer-events-none" />
      <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 sm:w-32 sm:h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 pointer-events-none" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-b border-x border-white/10 pointer-events-none" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-t border-x border-white/10 pointer-events-none" />
      <div className="absolute top-4 left-4 w-4 h-4 border-b border-r border-white/10 rounded-br pointer-events-none" />
      <div className="absolute top-4 right-4 w-4 h-4 border-b border-l border-white/10 rounded-bl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-t border-r border-white/10 rounded-tr pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-t border-l border-white/10 rounded-tl pointer-events-none" />

      {/* Slots */}
      {PITCH_SLOTS.map(slot => {
        const selectedPlayer = lineup[slot.id];
        return (
          <div
            key={slot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: slot.left, top: slot.top }}
          >
            {selectedPlayer ? (
              // Occupied FUT card
              <div
                onClick={() => {
                  if (activeIsLocked) return;
                  onSlotClick(slot.id);
                }}
                 className={`group relative w-[38px] h-[54px] min-[370px]:w-[48px] min-[370px]:h-[68px] sm:w-[60px] sm:h-[86px] md:w-[68px] md:h-[96px] lg:w-[72px] lg:h-[102px] rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1b1f2e] to-[#090b11] border ${
                  selectedPlayer.team === homeTeamName ? 'border-[#E11D48]/40 hover:border-[#E11D48]' : 'border-[#881337]/50 hover:border-[#881337]'
                } shadow-[0_0_8px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-0.5 sm:p-1 cursor-pointer active:scale-95 transition-transform`}
              >
                 {/* Rating / Position */}
                <div className="w-full flex items-center justify-between text-[7px] min-[370px]:text-[8px] sm:text-[10px] font-black text-gray-300 shrink-0">
                  <span className="font-mono text-[#E11D48]">{selectedPlayer.rating}</span>
                  <span className="uppercase text-[6px] min-[370px]:text-[7px] sm:text-[9px] text-gray-400">{slot.label}</span>
                </div>

                {/* Player image container with flag overlay */}
                <div className="relative w-6 h-6 min-[370px]:w-8 min-[370px]:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPlayerImageUrl(selectedPlayer.name)}
                    alt={selectedPlayer.name}
                    className="w-full h-full object-contain rounded-full bg-white/5 border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://media.api-sports.io/football/players/154.png`;
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 text-[7px] min-[370px]:text-[9px] sm:text-[11px] bg-black/60 rounded-full px-0.5 shadow-sm leading-none">
                    {getFlagEmoji(selectedPlayer.team)}
                  </div>
                </div>

                {/* Player Name */}
                <div className="w-full text-center shrink-0">
                  <p className="font-display font-black text-[5.5px] min-[370px]:text-[7px] sm:text-[9px] text-white truncate uppercase tracking-tighter leading-none">
                    {selectedPlayer.name.split(' ').pop()}
                  </p>
                  <p className="text-[4px] min-[370px]:text-[5px] sm:text-[7px] text-gray-500 font-bold truncate leading-none mt-0.5">
                    {selectedPlayer.team}
                  </p>
                </div>
                
                {/* Hover clear button */}
                {!activeIsLocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearSlot(slot.id);
                    }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-red-600 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-md"
                  >
                    <X className="w-2 h-2 sm:w-3 sm:h-3" />
                  </button>
                )}
              </div>
            ) : (
              // Empty slot card
              <button
                disabled={activeIsLocked}
                onClick={() => onSlotClick(slot.id)}
                className="group relative w-[38px] h-[54px] min-[370px]:w-[48px] min-[370px]:h-[68px] sm:w-[60px] sm:h-[86px] md:w-[68px] md:h-[96px] lg:w-[72px] lg:h-[102px] rounded-lg sm:rounded-xl border border-dashed border-green-500/25 hover:border-green-400/50 bg-black/35 backdrop-blur-xs flex flex-col items-center justify-center p-0.5 cursor-pointer active:scale-95 transition-all"
              >
                <span className="font-display font-black text-[7px] min-[370px]:text-[9px] sm:text-xs text-green-500/50 group-hover:text-green-400/80 uppercase tracking-wider">
                  {slot.label}
                </span>
                {!activeIsLocked && (
                  <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-500/40 group-hover:text-green-400/80 mt-1 sm:mt-1.5 transition-transform group-hover:scale-110" />
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
