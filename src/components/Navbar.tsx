import React from 'react';
import { Sparkles, Database, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onOpenStorageNotice: () => void;
  onResetData: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenStorageNotice, onResetData }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF6F2]/90 backdrop-blur-xl border-b border-[#E8B4B8]/25 px-4 h-13 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#5E1928] flex items-center justify-center text-white shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F5D5D8]" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-serif-luxury text-base font-bold tracking-tight text-[#5E1928]">
            Beauty Buddy
          </span>
          <span className="text-[10px] text-[#8A5A62] font-medium hidden xs:inline">
            TikTok & Reels
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenStorageNotice}
          className="flex items-center gap-1 text-[11px] font-medium text-[#7B1E34] hover:bg-[#F5D5D8]/40 px-2.5 py-1 rounded-full transition-colors"
          title="Status Penyimpanan Lokal"
        >
          <Database className="w-3 h-3 text-[#7B1E34]" />
          <span>Data Lokal</span>
        </button>

        <button
          onClick={onResetData}
          className="p-1.5 text-[#8A5A62] hover:text-[#5E1928] hover:bg-[#E8B4B8]/20 rounded-full transition-colors"
          title="Reset ke data contoh"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
