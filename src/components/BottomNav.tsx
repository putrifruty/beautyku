import React from 'react';
import { MessageSquareHeart, Lightbulb, Mic, Sparkle, CalendarDays } from 'lucide-react';

export type TabType = 'coach' | 'ideas' | 'voicedump' | 'stash' | 'planner';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  readyToRecordCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, readyToRecordCount = 0 }) => {
  const tabs = [
    {
      id: 'coach' as TabType,
      label: 'Coach AI',
      icon: MessageSquareHeart,
    },
    {
      id: 'ideas' as TabType,
      label: 'Ide Konten',
      icon: Lightbulb,
    },
    {
      id: 'voicedump' as TabType,
      label: 'Voice Dump',
      icon: Mic,
    },
    {
      id: 'stash' as TabType,
      label: 'My Stash',
      icon: Sparkle,
    },
    {
      id: 'planner' as TabType,
      label: 'Planner',
      icon: CalendarDays,
      badge: readyToRecordCount > 0 ? readyToRecordCount : undefined,
    },
  ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8B4B8]/35 shadow-sm">
      <div className="w-full grid grid-cols-5 h-15 px-1 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`min-h-[46px] flex flex-col items-center justify-center relative transition-all select-none ${
                isActive ? 'text-[#5E1928]' : 'text-[#8A5A62] hover:text-[#5E1928]'
              }`}
            >
              {isActive && (
                <span className="absolute inset-x-2 inset-y-1 bg-[#F5D5D8]/45 rounded-xl -z-10 animate-in fade-in duration-150" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-[#8A223B] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 font-medium tracking-tight whitespace-nowrap ${
                  isActive ? 'font-bold text-[#5E1928]' : 'text-[#8A5A62]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
