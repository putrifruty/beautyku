import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Type, Sparkles, CheckCircle2, Video } from 'lucide-react';
import { TalkingPointItem } from '../types';

interface CueCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  hooks?: string[];
  talkingPoints: TalkingPointItem[] | { timestamp?: string; label?: string; bulletPoint?: string; bullet?: string; cameraAction?: string; actionTip?: string }[];
  honestVerdict?: { pros: string[]; cons: string[]; bestFor: string };
  onMarkRecorded?: () => void;
}

export const CueCardModal: React.FC<CueCardModalProps> = ({
  isOpen,
  onClose,
  title,
  hooks = [],
  talkingPoints,
  honestVerdict,
  onMarkRecorded,
}) => {
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCheck = (idx: number) => {
    setCheckedPoints((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const fontClass =
    fontSize === 'normal'
      ? 'text-sm'
      : fontSize === 'large'
      ? 'text-base sm:text-lg'
      : 'text-lg sm:text-xl font-medium';

  return (
    <div className="fixed inset-0 z-50 bg-[#1A0B0E]/95 text-[#FFF9F9] flex flex-col backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#5E1928]/80 bg-[#120608]/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E8B4B8] animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-[#E8B4B8] uppercase">
            Cue Card Rekam Kamera
          </span>
        </div>

        {/* Font size toggles & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#2B1218] rounded-lg p-0.5 border border-[#5E1928]">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                fontSize === 'normal' ? 'bg-[#5E1928] text-white font-bold' : 'text-[#D8A4AC]'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 text-sm rounded transition-colors ${
                fontSize === 'large' ? 'bg-[#5E1928] text-white font-bold' : 'text-[#D8A4AC]'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 text-base rounded transition-colors ${
                fontSize === 'xlarge' ? 'bg-[#5E1928] text-white font-bold' : 'text-[#D8A4AC]'
              }`}
            >
              A++
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#E8B4B8] hover:text-white hover:bg-[#5E1928]/40 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Cue Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
        {/* Title */}
        <div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title || 'Kartu Panduan Rekam'}
          </h2>
          <p className="text-xs text-[#E8B4B8]/80 mt-1">
            Gak perlu hafalan! Cukup intip kata kunci di bawah saat jeda bernapas di depan kamera.
          </p>
        </div>

        {/* Hook Section */}
        {hooks.length > 0 && (
          <div className="bg-[#2D1219]/90 border border-[#8A223B]/60 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F5D5D8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E8B4B8]" />
                Hook 3 Detik Pertama (Pilih 1)
              </span>
              <span className="text-[11px] text-[#D8A4AC]">
                Opsi {selectedHookIndex + 1} dari {hooks.length}
              </span>
            </div>

            <div className="p-3 bg-[#1A0B0E] rounded-xl border border-[#5E1928] mb-2.5">
              <p className={`font-semibold text-[#FFF5F6] ${fontClass}`}>
                "{hooks[selectedHookIndex]}"
              </p>
            </div>

            <div className="flex gap-2">
              {hooks.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedHookIndex(idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedHookIndex === idx
                      ? 'bg-[#8A223B] border-[#E8B4B8] text-white font-bold'
                      : 'bg-[#1F0C11] border-[#5E1928] text-[#D8A4AC] hover:text-white'
                  }`}
                >
                  Hook {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Talking Points Sequence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F5D5D8]">
              Alur Cerita & Talking Points
            </span>
            <span className="text-[11px] text-[#D8A4AC]">
              {Object.values(checkedPoints).filter(Boolean).length}/{talkingPoints.length} Selesai
            </span>
          </div>

          <div className="space-y-3">
            {talkingPoints.map((pt: any, idx: number) => {
              const isChecked = !!checkedPoints[idx];
              const bulletText = pt.bulletPoint || pt.bullet || '';
              const actionText = pt.cameraAction || pt.actionTip || '';
              const timeText = pt.timestamp || pt.stage || `Poin ${idx + 1}`;

              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-[#1A0B0E]/60 border-[#5E1928]/40 opacity-60'
                      : 'bg-[#2A1016] border-[#7B1E34]/70 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCheck(idx);
                        }}
                        className="mt-0.5 shrink-0"
                      >
                        <CheckCircle2
                          className={`w-5 h-5 transition-colors ${
                            isChecked ? 'text-emerald-500' : 'text-[#7B1E34] hover:text-[#E8B4B8]'
                          }`}
                        />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#E8B4B8] uppercase px-2 py-0.5 bg-[#5E1928] rounded-md">
                            {timeText}
                          </span>
                          {pt.label && (
                            <span className="text-[11px] text-[#D8A4AC] font-medium">
                              {pt.label}
                            </span>
                          )}
                        </div>

                        <p className={`font-semibold text-white leading-relaxed ${fontClass}`}>
                          {bulletText}
                        </p>

                        {actionText && (
                          <div className="flex items-center gap-1.5 text-xs text-[#E8B4B8] mt-1.5 bg-[#1F0C11] px-2.5 py-1 rounded-lg border border-[#5E1928]/60 inline-flex">
                            <Video className="w-3.5 h-3.5 text-[#F5D5D8] shrink-0" />
                            <span>Aksi Kamera: {actionText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Honest Verdict Card */}
        {honestVerdict && (
          <div className="bg-[#240D13] border border-[#5E1928] rounded-2xl p-4 text-xs space-y-2">
            <span className="font-bold text-[#F5D5D8] block text-xs uppercase tracking-wider">
              Kesimpulan Jujur
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {honestVerdict.pros && honestVerdict.pros.length > 0 && (
                <div className="bg-[#1A0B0E] p-2.5 rounded-xl border border-[#5E1928]">
                  <span className="text-emerald-400 font-semibold block mb-1">👍 Yang Disukai:</span>
                  <ul className="text-[#D8A4AC] space-y-0.5 list-disc list-inside">
                    {honestVerdict.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {honestVerdict.cons && honestVerdict.cons.length > 0 && (
                <div className="bg-[#1A0B0E] p-2.5 rounded-xl border border-[#5E1928]">
                  <span className="text-amber-400 font-semibold block mb-1">⚠️ Catatan Jujur:</span>
                  <ul className="text-[#D8A4AC] space-y-0.5 list-disc list-inside">
                    {honestVerdict.cons.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {honestVerdict.bestFor && (
              <p className="text-[#E8B4B8] pt-1">
                <strong>Rekomendasi:</strong> Cocok untuk {honestVerdict.bestFor}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Recording Toolbar */}
      <div className="border-t border-[#5E1928]/80 bg-[#120608] px-4 py-3 flex items-center justify-between">
        {/* Stopwatch Timer */}
        <div className="flex items-center gap-2">
          <div className="text-lg font-mono font-bold text-[#F5D5D8] tabular-nums">
            {formatTimer(seconds)}
          </div>
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`p-2 rounded-xl transition-colors ${
              timerRunning
                ? 'bg-amber-600/80 text-white hover:bg-amber-600'
                : 'bg-[#5E1928] text-[#F5D5D8] hover:bg-[#7B1E34]'
            }`}
            title={timerRunning ? 'Jeda Timer' : 'Mulai Timer'}
          >
            {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setTimerRunning(false);
              setSeconds(0);
            }}
            className="p-2 text-[#D8A4AC] hover:text-white rounded-xl hover:bg-[#2B1218]"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mark as recorded */}
        <div className="flex items-center gap-2">
          {onMarkRecorded && (
            <button
              onClick={() => {
                onMarkRecorded();
                onClose();
              }}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tandai Sudah Direkam</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="bg-[#2B1218] hover:bg-[#3D1A22] text-[#E8B4B8] text-xs font-medium py-2 px-3 rounded-xl border border-[#5E1928]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
