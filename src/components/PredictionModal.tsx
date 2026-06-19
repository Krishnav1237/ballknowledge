import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface PredictionModalProps {
  homeTeam: { name_en: string; flag: string };
  awayTeam: { name_en: string; flag: string };
  predHomeScore: number;
  setPredHomeScore: (val: number) => void;
  predAwayScore: number;
  setPredAwayScore: (val: number) => void;
  predScorer: string;
  setPredScorer: (val: string) => void;
  predMotm: string;
  setPredMotm: (val: string) => void;
  predPossession: string;
  setPredPossession: (val: string) => void;
  takes: { statement: string; confidence: number }[];
  maxTakes: number;
  handleAddTake: () => void;
  handleRemoveTake: (index: number) => void;
  handleTakeChange: (index: number, key: 'statement' | 'confidence', value: any) => void;
  isSubmissionLocked: boolean;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  onClose: () => void;
  onSaveDraft: () => void;
}

export default function PredictionModal({
  homeTeam,
  awayTeam,
  predHomeScore,
  setPredHomeScore,
  predAwayScore,
  setPredAwayScore,
  predScorer,
  setPredScorer,
  predMotm,
  setPredMotm,
  predPossession,
  setPredPossession,
  takes,
  maxTakes,
  handleAddTake,
  handleRemoveTake,
  handleTakeChange,
  isSubmissionLocked,
  status,
  onClose,
  onSaveDraft
}: PredictionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-[#0B0F19] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_35px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Match Verdict Dossier</span>
            <h3 className="font-display font-black text-base uppercase tracking-wider text-white mt-0.5">
              Scoreline & Hot Takes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Prediction */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Predict Scoreline</label>
            <div className="flex items-center gap-6 max-w-md bg-black/30 border border-white/5 p-4 rounded-2xl">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase truncate">{homeTeam.name_en}</span>
                <input
                  type="number"
                  min="0"
                  value={predHomeScore}
                  disabled={isSubmissionLocked}
                  onChange={e => setPredHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl text-center font-display font-black text-xl text-white focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                />
              </div>
              <span className="text-gray-600 font-bold text-xl pt-4">:</span>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase truncate">{awayTeam.name_en}</span>
                <input
                  type="number"
                  min="0"
                  value={predAwayScore}
                  disabled={isSubmissionLocked}
                  onChange={e => setPredAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl text-center font-display font-black text-xl text-white focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Players / Possession */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">First Goalscorer</label>
              <input
                type="text"
                placeholder="e.g. Messi"
                value={predScorer}
                disabled={isSubmissionLocked}
                onChange={e => setPredScorer(e.target.value)}
                className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Man of the Match</label>
              <input
                type="text"
                placeholder="e.g. Yamal"
                value={predMotm}
                disabled={isSubmissionLocked}
                onChange={e => setPredMotm(e.target.value)}
                className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Possession Winner</label>
              <select
                value={predPossession}
                disabled={isSubmissionLocked}
                onChange={e => setPredPossession(e.target.value)}
                className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-semibold text-white focus:outline-none focus:border-[#D97706] disabled:opacity-50"
              >
                <option value="">Select winner...</option>
                <option value={homeTeam.name_en}>{homeTeam.name_en}</option>
                <option value={awayTeam.name_en}>{awayTeam.name_en}</option>
                <option value="Draw">Draw</option>
              </select>
            </div>
          </div>

          {/* Hot Takes */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Match Hot Takes</label>
              {!isSubmissionLocked && takes.length < maxTakes && (
                <button
                  onClick={handleAddTake}
                  className="px-2.5 py-1 rounded-lg border border-[#D97706]/40 hover:border-[#D97706] text-[#D97706] hover:bg-[#D97706]/5 text-[9px] font-black uppercase tracking-wider transition-all"
                >
                  + Add Take
                </button>
              )}
            </div>

            <div className="space-y-3">
              {takes.map((take, idx) => (
                <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Take #{idx + 1}</span>
                    {!isSubmissionLocked && takes.length > 1 && (
                      <button
                        onClick={() => handleRemoveTake(idx)}
                        className="text-[10px] text-red-500 hover:text-red-400 font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8">
                      <input
                        type="text"
                        placeholder="e.g. Mbappe scores but France loses..."
                        value={take.statement}
                        disabled={isSubmissionLocked}
                        onChange={e => handleTakeChange(idx, 'statement', e.target.value)}
                        className="w-full h-11 bg-black/60 border border-white/10 rounded-xl px-4 text-xs font-medium text-white placeholder-gray-600 focus:outline-none focus:border-[#D97706] disabled:opacity-50"
                      />
                    </div>
                    <div className="sm:col-span-4 flex flex-col justify-center gap-1">
                      <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Confidence</span>
                        <span className="text-[#D97706]">{take.confidence}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="99"
                        value={take.confidence}
                        disabled={isSubmissionLocked}
                        onChange={e => handleTakeChange(idx, 'confidence', parseInt(e.target.value))}
                        className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#D97706] disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning messages */}
          {status === 'LIVE' && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl flex items-start gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Match is LIVE. Inputs are read-only.</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-surface border border-white/10 hover:bg-white/5 text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close View
          </button>
          {!isSubmissionLocked && (
            <button
              onClick={onSaveDraft}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#881337] to-[#D97706] text-white font-display font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Save Predictions Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
