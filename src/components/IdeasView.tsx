import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  Package,
  BookmarkPlus,
  Copy,
  Check,
  Video,
  ChevronRight,
  RefreshCw,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { CategoryType, GeneratedIdea, StashProduct } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface IdeasViewProps {
  onSendToCoach: (product: { name: string; category: CategoryType; notes?: string }) => void;
  onSendToPlanner: (item: {
    title: string;
    productName: string;
    category: string;
    hooks: string[];
    talkingPoints: string[];
  }) => void;
  onOpenCueCard: (data: {
    title: string;
    hooks: string[];
    talkingPoints: any[];
  }) => void;
}

const CATEGORIES: CategoryType[] = [
  'Lip product review',
  'Skincare before makeup',
  'Makeup review',
  'Honest review',
  'Beauty tips',
  'Beauty things I wish I knew earlier',
  'GRWM',
  'Beauty and lifestyle',
];

export const IdeasView: React.FC<IdeasViewProps> = ({
  onSendToCoach,
  onSendToPlanner,
  onOpenCueCard,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Lip product review');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stashProducts, setStashProducts] = useState<StashProduct[]>([]);

  useEffect(() => {
    setStashProducts(storage.getProducts());
  }, []);

  const handleGenerate = async (customName?: string) => {
    const targetName = customName || productName;
    if (!targetName.trim()) return;

    setIsLoading(true);
    try {
      const generated = await api.generateIdeas({
        category: selectedCategory,
        productName: targetName.trim(),
        personalExperience: '',
        targetAudience: 'Beauty enthusiast Indonesia',
      });
      setIdeas(generated);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menghasilkan ide konten. Coba lagi ya bestie!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHooks = (idea: GeneratedIdea) => {
    const text = `🎯 ${idea.conceptTitle}\n\nHooks:\n${idea.hooks.map((h, i) => `${i + 1}. "${h}"`).join('\n')}\n\nTalking Points:\n${idea.talkingPoints.map((tp) => `• ${tp}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-1 pt-1 animate-in fade-in duration-200">
      {/* Search & Filter Card */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8B4B8]/35 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#8A223B] tracking-wider uppercase flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" />
            Ide & Angle Konten
          </span>
          <span className="text-[10px] text-[#8A5A62]">Format TikTok & Reels</span>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#5E1928] text-white font-semibold shadow-2xs'
                  : 'bg-[#FAF6F2] text-[#5E1928] hover:bg-[#F5D5D8]/40 border border-[#E8B4B8]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Ketik produk (misal: Cushion Somethinc / Liptint Viral)..."
            className="flex-1 text-xs sm:text-sm px-3.5 py-3 rounded-2xl bg-[#FAF6F2] border border-[#E8B4B8]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7B1E34]/20 focus:border-[#7B1E34] transition-all"
          />
          <button
            type="submit"
            disabled={!productName.trim() || isLoading}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
              productName.trim() && !isLoading
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

        {/* Quick Stash Pills */}
        {stashProducts.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
            <span className="text-[10px] text-[#8A5A62] shrink-0">Dari Stash:</span>
            {stashProducts.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProductName(`${p.brand} ${p.name}`);
                  handleGenerate(`${p.brand} ${p.name}`);
                }}
                className="bg-[#FAF6F2] hover:bg-[#F5D5D8]/40 text-[#5E1928] px-2.5 py-1 rounded-lg border border-[#E8B4B8]/40 whitespace-nowrap text-[11px]"
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ideas Result Cards */}
      {ideas.length > 0 ? (
        <div className="space-y-3">
          {ideas.map((idea, index) => (
            <div
              key={idea.id || index}
              className="bg-white rounded-3xl p-4 border border-[#E8B4B8]/40 shadow-xs space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#8A223B] bg-[#F5D5D8]/40 px-2 py-0.5 rounded-md">
                    {idea.vibe}
                  </span>
                  <h4 className="font-serif-luxury text-base font-bold text-[#5E1928] mt-1 leading-snug">
                    {idea.conceptTitle}
                  </h4>
                </div>
                <button
                  onClick={() => handleCopyHooks(idea)}
                  className="p-1.5 text-[#8A5A62] hover:text-[#5E1928] rounded-lg hover:bg-[#FAF6F2]"
                  title="Salin Poin"
                >
                  {copiedId === idea.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* 3 Hooks */}
              <div className="bg-[#FAF6F2] p-2.5 rounded-2xl border border-[#E8B4B8]/30 space-y-1">
                <span className="text-[10px] font-bold text-[#5E1928] uppercase tracking-wider block">
                  Pilihan Hook 3 Detik:
                </span>
                <ul className="text-xs text-[#5E1928]/90 space-y-1">
                  {idea.hooks.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5 italic">
                      <span className="text-[#8A223B] font-bold not-italic">{i + 1}.</span>
                      <span>"{h}"</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Talking Points */}
              <div className="space-y-1 pl-1">
                <span className="text-[10px] font-bold text-[#8A5A62] uppercase tracking-wider block">
                  Talking Points:
                </span>
                {idea.talkingPoints.map((tp, i) => (
                  <div key={i} className="text-xs text-[#2C1810] flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8A223B] mt-1.5 shrink-0" />
                    <span>{tp}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-[#E8B4B8]/25">
                <button
                  onClick={() =>
                    onSendToCoach({
                      name: idea.productName || productName || idea.conceptTitle,
                      category: selectedCategory,
                      notes: idea.conceptTitle,
                    })
                  }
                  className="flex-1 bg-[#5E1928] hover:bg-[#7B1E34] text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <span>Latih di Coach</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() =>
                    onOpenCueCard({
                      title: idea.conceptTitle,
                      hooks: idea.hooks,
                      talkingPoints: idea.talkingPoints.map((tp, idx) => ({
                        timestamp: `Poin ${idx + 1}`,
                        bulletPoint: tp,
                        cameraAction: idea.visualActions?.[idx] || 'Bicara ke kamera',
                      })),
                    })
                  }
                  className="p-2 bg-[#FAF6F2] hover:bg-[#F5D5D8]/50 text-[#5E1928] border border-[#E8B4B8]/60 rounded-xl"
                  title="Buka Cue Card Langsung"
                >
                  <Eye className="w-3.5 h-3.5 text-[#8A223B]" />
                </button>

                <button
                  onClick={() =>
                    onSendToPlanner({
                      title: idea.conceptTitle,
                      productName: idea.productName || productName,
                      category: selectedCategory,
                      hooks: idea.hooks,
                      talkingPoints: idea.talkingPoints,
                    })
                  }
                  className="p-2 bg-[#FAF6F2] hover:bg-[#F5D5D8]/50 text-[#5E1928] border border-[#E8B4B8]/60 rounded-xl"
                  title="Jadwalkan ke Planner"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-[#8A223B]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/60 rounded-3xl p-6 text-center border border-[#E8B4B8]/30 space-y-2">
          <Sparkles className="w-6 h-6 text-[#E8B4B8] mx-auto" />
          <p className="text-xs text-[#8A5A62]">
            Ketik nama produk di atas untuk melihat 3 konsep angle video, hook 3 detik, dan talking points.
          </p>
        </div>
      )}
    </div>
  );
};
