import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  Video,
  BookmarkPlus,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { VoiceDumpItem, VoiceDumpAnalysis } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface VoiceDumpViewProps {
  onOpenCueCard: (data: {
    title: string;
    talkingPoints: any[];
  }) => void;
  onSendToPlanner: (item: {
    title: string;
    productName: string;
    category: string;
    talkingPoints: string[];
  }) => void;
  onSendToCoach: (data: { name: string; notes?: string }) => void;
}

export const VoiceDumpView: React.FC<VoiceDumpViewProps> = ({
  onOpenCueCard,
  onSendToPlanner,
  onSendToCoach,
}) => {
  const [transcriptText, setTranscriptText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [analysis, setAnalysis] = useState<VoiceDumpAnalysis | null>(null);
  const [history, setHistory] = useState<VoiceDumpItem[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(storage.getVoiceDumps());
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
    } catch {
      alert('Izin mikrofon tidak aktif. Kamu bisa ketik atau tempel teks langsung ya bestie!');
      setShowTextInput(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const transcribed = await api.transcribeAudio(base64Data, blob.type || 'audio/webm');
          if (transcribed) {
            setTranscriptText(transcribed);
            // Auto analyze after transcribing!
            handleAnalyze(transcribed);
          }
        } catch {
          alert('Gagal mentranskripsikan audio otomatis. Coba ketik teks langsung ya!');
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudio(file);
  };

  const handleAnalyze = async (textToUse?: string) => {
    const text = textToUse || transcriptText;
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const result = await api.analyzeVoiceDump({ transcript: text.trim() });
      setAnalysis(result);

      const titleWords = text.trim().split(' ').slice(0, 5).join(' ');
      const newItem: VoiceDumpItem = {
        id: `vd-${Date.now()}`,
        title: titleWords ? `${titleWords}...` : 'Voice Dump Celoteh',
        transcript: text.trim(),
        analysis: result,
        createdAt: new Date().toISOString(),
      };
      storage.addVoiceDump(newItem);
      setHistory(storage.getVoiceDumps());
    } catch (err: any) {
      console.error(err);
      alert('Gagal memproses voice dump. Coba lagi ya!');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-1 pt-1 animate-in fade-in duration-200">
      {/* Central Voice Recording Hub */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8B4B8]/35 shadow-xs text-center space-y-4">
        <div>
          <span className="text-[11px] font-bold text-[#8A223B] tracking-wider uppercase block">
            Voice Dump Creator
          </span>
          <h3 className="font-serif-luxury text-lg font-bold text-[#5E1928]">
            Ceritakan Unboxing atau Celotehmu
          </h3>
          <p className="text-xs text-[#8A5A62] mt-0.5">
            Ngoceh bebas tanpa mikir struktur kalimat. AI akan menyusun intinya jadi Talking Points.
          </p>
        </div>

        {/* Big Apple Voice Memos Style Mic Button */}
        <div className="py-2 flex flex-col items-center justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/40 scale-105 animate-pulse'
                : 'bg-gradient-to-tr from-[#5E1928] to-[#8A223B] text-white shadow-lg shadow-[#5E1928]/25 hover:scale-105 active:scale-95'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <div className="mt-3">
            {isRecording ? (
              <span className="text-base font-mono font-bold text-rose-600 tabular-nums">
                {formatTimer(recordSeconds)}
              </span>
            ) : isTranscribing ? (
              <span className="text-xs text-amber-700 font-medium flex items-center gap-1.5 justify-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Mentranskripsikan suara...
              </span>
            ) : (
              <span className="text-xs text-[#8A5A62]">
                Ketuk tombol untuk mulai merekam
              </span>
            )}
          </div>
        </div>

        {/* Secondary options (Upload / Text) */}
        <div className="flex items-center justify-center gap-3 pt-1 border-t border-[#E8B4B8]/20">
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#8A5A62] hover:text-[#5E1928] flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <span className="text-[#E8B4B8]">·</span>
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="text-xs text-[#8A5A62] hover:text-[#5E1928] flex items-center gap-1 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            {showTextInput ? 'Sembunyikan Kolom Teks' : 'Ketik / Tempel Teks'}
          </button>
        </div>

        {/* Text Input Drawer */}
        {showTextInput && (
          <div className="space-y-2 pt-2 animate-in fade-in duration-200">
            <textarea
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Tempel atau ketik celoteh bebasmu di sini..."
              rows={3}
              className="w-full text-xs p-3 rounded-2xl bg-[#FAF6F2] border border-[#E8B4B8]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5E1928]"
            />
            <button
              onClick={() => handleAnalyze()}
              disabled={!transcriptText.trim() || isProcessing}
              className="w-full py-2.5 bg-[#5E1928] text-white rounded-xl text-xs font-bold hover:bg-[#7B1E34] transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Membedah Celoteh...' : 'Bedah Jadi Talking Points'}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-white rounded-3xl p-5 border border-[#E8B4B8]/40 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div>
            <span className="text-[10px] font-bold text-[#8A223B] uppercase tracking-wider block">
              Inti Cerita:
            </span>
            <p className="font-serif-luxury text-base font-bold text-[#5E1928] mt-0.5 leading-snug">
              {analysis.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#FAF6F2] p-2.5 rounded-2xl border border-[#E8B4B8]/30">
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3" /> Yang Disukai:
              </span>
              <ul className="text-[#5E1928]/80 space-y-0.5 text-[11px]">
                {analysis.pros.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FAF6F2] p-2.5 rounded-2xl border border-[#E8B4B8]/30">
              <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mb-1">
                <AlertCircle className="w-3 h-3" /> Catatan Jujur:
              </span>
              <ul className="text-[#5E1928]/80 space-y-0.5 text-[11px]">
                {analysis.cons.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Talking Points */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#5E1928] uppercase tracking-wider block">
              Talking Points Siap Rekam:
            </span>
            <div className="space-y-1">
              {analysis.talkingPoints.map((tp, i) => (
                <div key={i} className="p-2 bg-[#FAF6F2] rounded-xl text-xs flex items-start gap-2">
                  <span className="text-[10px] font-bold text-white bg-[#5E1928] px-1.5 py-0.5 rounded-md shrink-0">
                    {tp.stage}
                  </span>
                  <div>
                    <p className="font-semibold text-[#2C1810]">{tp.bullet}</p>
                    {tp.actionTip && (
                      <p className="text-[10px] text-[#8A223B] italic">Aksi: {tp.actionTip}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-2 pt-1 border-t border-[#E8B4B8]/25">
            <button
              onClick={() =>
                onOpenCueCard({
                  title: analysis.summary,
                  talkingPoints: analysis.talkingPoints.map((tp) => ({
                    timestamp: tp.stage,
                    bulletPoint: tp.bullet,
                    cameraAction: tp.actionTip,
                  })),
                })
              }
              className="flex-1 bg-[#5E1928] hover:bg-[#7B1E34] text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Buka Cue Card</span>
            </button>

            <button
              onClick={() =>
                onSendToPlanner({
                  title: analysis.summary,
                  productName: 'Produk dari Voice Dump',
                  category: 'Beauty review',
                  talkingPoints: analysis.talkingPoints.map((tp) => tp.bullet),
                })
              }
              className="p-2 bg-[#FAF6F2] hover:bg-[#F5D5D8]/50 text-[#5E1928] border border-[#E8B4B8]/60 rounded-xl"
              title="Simpan ke Planner"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-[#8A223B]" />
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#E8B4B8]/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A5A62] block px-1">
            Riwayat Tersimpan ({history.length})
          </span>
          <div className="space-y-1.5">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-white rounded-2xl border border-[#E8B4B8]/40 flex items-center justify-between text-xs cursor-pointer hover:bg-[#FAF6F2]"
                onClick={() => {
                  setTranscriptText(item.transcript);
                  if (item.analysis) setAnalysis(item.analysis);
                }}
              >
                <span className="font-semibold text-[#5E1928] truncate pr-2">{item.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    storage.deleteVoiceDump(item.id);
                    setHistory(storage.getVoiceDumps());
                  }}
                  className="text-[#8A5A62] hover:text-red-600 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
