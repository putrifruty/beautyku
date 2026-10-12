import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Video,
  ArrowRight,
  RefreshCw,
  Plus,
  BookmarkPlus,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';
import { CoachSession, CoachMessage, CategoryType, StashProduct } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface CoachViewProps {
  onOpenCueCard: (data: {
    title: string;
    hooks: string[];
    talkingPoints: any[];
    honestVerdict?: any;
  }) => void;
  onSendToPlanner: (item: {
    title: string;
    productName: string;
    category: string;
    hooks: string[];
    talkingPoints: string[];
  }) => void;
  initialProduct?: StashProduct | null;
  onClearInitialProduct?: () => void;
}

const STAGES = [
  'Hook Pembuka',
  'Tekstur & Rasa',
  'Ketahanan',
  'Opini Jujur',
  'Rekomendasi',
];

const QUICK_STARTERS = [
  { label: '💄 Lip Tint Viral', product: 'Lip Tint Viral', category: 'Lip product review' },
  { label: '🧴 Serum Skin Prep', product: 'Barrier Serum', category: 'Skincare before makeup' },
  { label: '🪞 Cushion Flawless', product: 'Velvet Cushion', category: 'Makeup review' },
  { label: '☕ GRWM Chit-chat', product: 'Daily Makeup Routine', category: 'GRWM' },
  { label: '💡 Tips Anti-Cakey', product: 'Tips Makeup Awet', category: 'Beauty tips' },
];

export const CoachView: React.FC<CoachViewProps> = ({
  onOpenCueCard,
  onSendToPlanner,
  initialProduct,
  onClearInitialProduct,
}) => {
  const [session, setSession] = useState<CoachSession | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [stashProducts, setStashProducts] = useState<StashProduct[]>([]);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStashProducts(storage.getProducts());
    const saved = storage.getActiveCoach();
    if (saved) {
      setSession(saved);
    }
  }, []);

  // When navigated from Stash with an initial product
  useEffect(() => {
    if (initialProduct) {
      startNewSession(
        `${initialProduct.brand} ${initialProduct.name}`,
        initialProduct.category,
        initialProduct.personalExperience
      );
      onClearInitialProduct?.();
    }
  }, [initialProduct]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isLoading]);

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInputText((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Browser ini belum mendukung mikrofon langsung. Kamu bisa ketik jawabanmu ya bestie!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Start Instant Session
  const startNewSession = async (
    productName: string,
    category: string = 'Lip product review',
    topic?: string
  ) => {
    if (!productName.trim()) return;

    setIsLoading(true);
    const newSession: CoachSession = {
      id: `coach-${Date.now()}`,
      productName: productName.trim(),
      category,
      topic,
      messages: [],
      stage: 'Hook Pembuka',
      stageIndex: 1,
      isReadyToSummarize: false,
      updatedAt: new Date().toISOString(),
    };

    try {
      const aiResponse = await api.sendCoachChat({
        messages: [
          {
            role: 'user',
            content: `Hai Buddy! Aku mau latihan ngobrolin "${newSession.productName}" (${newSession.category}). ${
              topic ? `Catatan awalku: "${topic}".` : ''
            } Bimbing aku dari pertanyaan pembuka pertama ya!`,
          },
        ],
        productName: newSession.productName,
        category: newSession.category,
      });

      const firstAiMessage: CoachMessage = {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: aiResponse.reply,
        timestamp: new Date().toISOString(),
        suggestedAnswers: aiResponse.suggestedAnswers,
        cameraTip: aiResponse.cameraTip,
        stage: aiResponse.stage,
      };

      newSession.messages = [firstAiMessage];
      newSession.stage = aiResponse.stage || 'Hook Pembuka';
      newSession.stageIndex = aiResponse.stageIndex || 1;
      newSession.isReadyToSummarize = aiResponse.isReadyToSummarize || false;

      setSession(newSession);
      storage.saveActiveCoach(newSession);
    } catch {
      const fallbackMsg: CoachMessage = {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: `Hai bestie! Senang banget mau bahas "${newSession.productName}". Biar penonton langsung stop scrolling di 3 detik pertama, apa hal pertama yang bikin kamu penasaran sama produk ini?`,
        timestamp: new Date().toISOString(),
        suggestedAnswers: [
          'Lagi viral banget dan sering sold out',
          'Penasaran sama klaim formulanya yang tahan seharian',
          'Nyari produk yang aman buat kulit sensitif',
        ],
        cameraTip: 'Pegang produk sejajar kamera sambil senyum santai ya!',
        stage: 'Hook Pembuka',
      };
      newSession.messages = [fallbackMsg];
      setSession(newSession);
      storage.saveActiveCoach(newSession);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Answer
  const sendMessage = async (textToSend?: string, isHelpRequest = false) => {
    const text = (textToSend || inputText).trim();
    if (!text && !isHelpRequest) return;
    if (!session) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const updatedMessages: CoachMessage[] = [...session.messages];

    if (!isHelpRequest && text) {
      updatedMessages.push({
        id: `msg-${Date.now()}-u`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      });
      setInputText('');
    }

    setIsLoading(true);

    try {
      const chatPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiResponse = await api.sendCoachChat({
        messages: chatPayload,
        productName: session.productName,
        category: session.category,
        isHelpRequested: isHelpRequest,
      });

      updatedMessages.push({
        id: `msg-${Date.now()}-m`,
        role: 'model',
        content: aiResponse.reply,
        timestamp: new Date().toISOString(),
        suggestedAnswers: aiResponse.suggestedAnswers,
        cameraTip: aiResponse.cameraTip,
        stage: aiResponse.stage,
      });

      const nextStageIndex = Math.min(
        5,
        Math.max(session.stageIndex, aiResponse.stageIndex || session.stageIndex + 1)
      );

      const updatedSession: CoachSession = {
        ...session,
        messages: updatedMessages,
        stage: aiResponse.stage || STAGES[nextStageIndex - 1],
        stageIndex: nextStageIndex,
        isReadyToSummarize: aiResponse.isReadyToSummarize || nextStageIndex >= 4,
        updatedAt: new Date().toISOString(),
      };

      setSession(updatedSession);
      storage.saveActiveCoach(updatedSession);
    } catch {
      updatedMessages.push({
        id: `msg-${Date.now()}-m`,
        role: 'model',
        content:
          'Menarik banget! Waktu pertama kali diaplikasikan, sensasi atau tekstur apa yang paling terasa di kulit atau bibirmu?',
        timestamp: new Date().toISOString(),
        suggestedAnswers: [
          'Ringan banget kayak gak pakai apa-apa',
          'Awalnya basah tapi cepat ngeset',
          'Creamy dan gampang banget di-blend',
        ],
        cameraTip: 'Bisa swatch tipis di punggung tangan ke arah kamera ya!',
        stage: 'Tekstur & Rasa',
      });
      const updatedSession: CoachSession = {
        ...session,
        messages: updatedMessages,
        stageIndex: Math.min(5, session.stageIndex + 1),
        isReadyToSummarize: session.stageIndex >= 3,
        updatedAt: new Date().toISOString(),
      };
      setSession(updatedSession);
      storage.saveActiveCoach(updatedSession);
    } finally {
      setIsLoading(false);
    }
  };

  // Summarize
  const handleSummarize = async () => {
    if (!session || session.messages.length < 2) return;

    setIsSummarizing(true);
    try {
      const summary = await api.summarizeCoach({
        conversation: session.messages,
        productName: session.productName,
        category: session.category,
      });

      const updatedSession: CoachSession = {
        ...session,
        summaryResult: summary,
        updatedAt: new Date().toISOString(),
      };

      setSession(updatedSession);
      storage.saveActiveCoach(updatedSession);
    } catch (err: any) {
      console.error(err);
      alert('Gagal merangkum talking points. Coba sekali lagi ya bestie!');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleReset = () => {
    storage.saveActiveCoach(null);
    setSession(null);
    setQuickInput('');
  };

  const copyTalkingPoints = () => {
    if (!session?.summaryResult) return;
    const s = session.summaryResult;
    const text = `🎯 ${s.title}\n\nHooks:\n${s.hooks.map((h, i) => `${i + 1}. "${h}"`).join('\n')}\n\nTalking Points:\n${s.talkingPoints.map((tp) => `• [${tp.timestamp}] ${tp.bulletPoint}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. SIMPLE INSTANT START SCREEN
  if (!session) {
    return (
      <div className="space-y-5 pb-24 max-w-lg mx-auto px-1 pt-1 animate-in fade-in duration-200">
        {/* Simple Welcoming Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8B4B8]/35 shadow-xs space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#8A223B] tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#8A223B]" />
              Speaking Coach AI
            </span>
            <h2 className="font-serif-luxury text-xl font-bold text-[#5E1928] leading-tight">
              Mau ngobrolin produk apa hari ini?
            </h2>
            <p className="text-xs text-[#8A5A62]">
              Latihan alur cerita santai di depan kamera. Satu pertanyaan per giliran, tanpa script hafalan.
            </p>
          </div>

          {/* Single Simple Input with Go button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startNewSession(quickInput);
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ketik nama produk (misal: Vinyl Ink / Cushion Aura)..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-3 rounded-2xl bg-[#FAF6F2] border border-[#E8B4B8]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1E34]/20 focus:border-[#7B1E34] transition-all"
            />
            <button
              type="submit"
              disabled={!quickInput.trim() || isLoading}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                quickInput.trim() && !isLoading
                  ? 'bg-[#5E1928] text-white shadow-xs hover:bg-[#7B1E34]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Quick 1-Tap Starters */}
          <div className="space-y-1.5 pt-1 border-t border-[#E8B4B8]/20">
            <span className="text-[10px] font-semibold text-[#8A5A62] block">
              Atau pilih topik cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_STARTERS.map((qs) => (
                <button
                  key={qs.label}
                  type="button"
                  onClick={() => startNewSession(qs.product, qs.category)}
                  className="text-xs bg-[#FAF6F2] hover:bg-[#F5D5D8]/50 text-[#5E1928] px-3 py-1.5 rounded-xl border border-[#E8B4B8]/40 transition-colors font-medium active:scale-95"
                >
                  {qs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stash Picker */}
          {stashProducts.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold text-[#8A5A62] block">
                Dari koleksi Stash kamu:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stashProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => startNewSession(`${p.brand} ${p.name}`, p.category, p.personalExperience)}
                    className="text-xs bg-white hover:bg-[#F5D5D8]/40 text-[#5E1928] px-2.5 py-1.5 rounded-xl border border-[#E8B4B8]/60 transition-colors font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-[#8A5A62] font-normal">({p.brand})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. CONVERSATION VIEW (Ultra-clean, iMessage / WhatsApp style)
  const latestAiMessage = [...session.messages].reverse().find((m) => m.role === 'model');

  return (
    <div className="flex flex-col h-[calc(100vh-3.25rem-4.25rem)] max-w-lg mx-auto pb-1 px-1">
      {/* Sleek Top Header Bar */}
      <div className="py-2 px-3 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E8B4B8]/30 shadow-2xs mb-2 shrink-0 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <h3 className="text-xs font-bold text-[#5E1928] truncate">{session.productName}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-[#8A5A62]">
            <span>Tahap {session.stageIndex}/5:</span>
            <span className="font-semibold text-[#7B1E34] truncate">{session.stage}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {session.messages.length >= 2 && !session.summaryResult && (
            <button
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="bg-[#5E1928] hover:bg-[#7B1E34] text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl transition-all shadow-2xs flex items-center gap-1"
            >
              {isSummarizing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <FileCheck2 className="w-3 h-3 text-[#F5D5D8]" />
              )}
              <span>Rangkum Poin</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-1.5 text-[#8A5A62] hover:text-[#5E1928] rounded-xl hover:bg-[#FAF6F2]"
            title="Sesi Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Step Bar */}
      <div className="flex items-center gap-1 mb-2 px-1 shrink-0">
        {STAGES.map((stg, i) => {
          const isDone = i + 1 < session.stageIndex;
          const isCurrent = i + 1 === session.stageIndex;
          return (
            <div
              key={stg}
              className={`flex-1 h-1 rounded-full transition-all ${
                isDone
                  ? 'bg-[#5E1928]'
                  : isCurrent
                  ? 'bg-[#8A223B] ring-1 ring-[#E8B4B8]'
                  : 'bg-[#E8B4B8]/30'
              }`}
              title={stg}
            />
          );
        })}
      </div>

      {/* COMPACT SUMMARY CARD (If summarized) */}
      {session.summaryResult && (
        <div className="mb-2 bg-[#2B1017] text-white rounded-2xl p-3.5 shadow-md border border-[#8A223B]/60 space-y-2 shrink-0 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F5D5D8] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E8B4B8]" />
              Talking Points Selesai!
            </span>
            <button
              onClick={() =>
                onOpenCueCard({
                  title: session.summaryResult!.title,
                  hooks: session.summaryResult!.hooks,
                  talkingPoints: session.summaryResult!.talkingPoints,
                  honestVerdict: session.summaryResult!.honestVerdict,
                })
              }
              className="bg-[#E8B4B8] hover:bg-white text-[#5E1928] text-xs font-bold py-1 px-2.5 rounded-lg transition-all flex items-center gap-1"
            >
              <Video className="w-3 h-3" />
              <span>Buka Cue Card</span>
            </button>
          </div>

          <p className="text-xs text-white/90 italic bg-black/20 p-2 rounded-xl">
            "{session.summaryResult.hooks[0]}"
          </p>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <button
              onClick={() =>
                onSendToPlanner({
                  title: session.summaryResult!.title,
                  productName: session.productName,
                  category: session.category,
                  hooks: session.summaryResult!.hooks,
                  talkingPoints: session.summaryResult!.talkingPoints.map((tp) => tp.bulletPoint),
                })
              }
              className="text-[#F5D5D8] hover:text-white flex items-center gap-1 font-semibold"
            >
              <BookmarkPlus className="w-3 h-3" />
              Jadwalkan ke Planner
            </button>
            <button
              onClick={copyTalkingPoints}
              className="text-[#F5D5D8] hover:text-white flex items-center gap-1 font-semibold"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
        {session.messages.map((msg, index) => {
          const isAi = msg.role === 'model';
          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                  isAi
                    ? 'bg-white text-[#2C1810] border border-[#E8B4B8]/40 shadow-2xs rounded-tl-xs'
                    : 'bg-[#5E1928] text-white rounded-tr-xs shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {isAi && msg.cameraTip && (
                  <div className="mt-2 pt-1.5 border-t border-[#E8B4B8]/30 flex items-start gap-1.5 text-[11px] text-[#7B1E34]">
                    <Video className="w-3 h-3 text-[#8A223B] shrink-0 mt-0.5" />
                    <span>
                      <strong>Tips Kamera:</strong> {msg.cameraTip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-1.5">
            <div className="bg-white border border-[#E8B4B8]/40 rounded-2xl p-2.5 shadow-2xs flex items-center gap-2 text-xs text-[#8A5A62]">
              <RefreshCw className="w-3 h-3 animate-spin text-[#8A223B]" />
              <span>Coach lagi ngetik pertanyaan selanjutnya...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Pancingan Chips */}
      {latestAiMessage?.suggestedAnswers && latestAiMessage.suggestedAnswers.length > 0 && (
        <div className="pt-1 pb-1 shrink-0 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#8A5A62] px-1">
            <span className="font-semibold text-[#7B1E34]">Ide Jawaban Cepat:</span>
            <button
              onClick={() => sendMessage(undefined, true)}
              disabled={isLoading}
              className="text-[#8A223B] hover:text-[#5E1928] font-bold flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              Lagi blank nih!
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {latestAiMessage.suggestedAnswers.map((ans, i) => (
              <button
                key={i}
                onClick={() => sendMessage(ans)}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-[#F5D5D8]/50 text-[#5E1928] px-2.5 py-1 rounded-xl border border-[#E8B4B8]/50 shadow-2xs transition-all active:scale-95 text-left font-medium"
              >
                "{ans}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="pt-1 shrink-0 border-t border-[#E8B4B8]/25">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-1.5"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-white hover:bg-[#FAF6F2] text-[#8A5A62] border border-[#E8B4B8]/50'
            }`}
            title={isListening ? 'Stop Mic' : 'Bicara pakai Suara'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Mendengarkan suaramu...' : 'Ketik jawabanmu...'}
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#E8B4B8]/60 bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1E34]/20 focus:border-[#7B1E34] transition-all shadow-2xs"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-[#5E1928] hover:bg-[#7B1E34] text-white shadow-xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
