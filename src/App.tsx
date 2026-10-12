import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { CoachView } from './components/CoachView';
import { IdeasView } from './components/IdeasView';
import { VoiceDumpView } from './components/VoiceDumpView';
import { StashView } from './components/StashView';
import { PlannerView } from './components/PlannerView';
import { CueCardModal } from './components/CueCardModal';
import { StorageNoticeModal } from './components/StorageNoticeModal';
import { StashProduct, CategoryType, PlannerItem } from './types';
import { storage } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('coach');

  // Modal states
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [cueCardData, setCueCardData] = useState<{
    isOpen: boolean;
    title: string;
    hooks?: string[];
    talkingPoints: any[];
    honestVerdict?: any;
  }>({
    isOpen: false,
    title: '',
    hooks: [],
    talkingPoints: [],
  });

  // Cross-tab state sharing
  const [coachInitialProduct, setCoachInitialProduct] = useState<StashProduct | null>(null);
  const [plannerExternalItem, setPlannerExternalItem] = useState<Partial<PlannerItem> | null>(null);

  // Ready to record badge count
  const [readyCount, setReadyCount] = useState(0);

  const refreshCounts = () => {
    const plans = storage.getPlannerItems();
    setReadyCount(plans.filter((p) => p.status === 'Siap direkam').length);
  };

  useEffect(() => {
    refreshCounts();
  }, [activeTab]);

  const handleOpenCueCard = (data: {
    title: string;
    hooks?: string[];
    talkingPoints: any[];
    honestVerdict?: any;
  }) => {
    setCueCardData({
      isOpen: true,
      title: data.title,
      hooks: data.hooks || [],
      talkingPoints: data.talkingPoints,
      honestVerdict: data.honestVerdict,
    });
  };

  const handleSendToPlanner = (item: {
    title: string;
    productName: string;
    category: string;
    hooks?: string[];
    talkingPoints: string[];
  }) => {
    setPlannerExternalItem({
      title: item.title,
      productName: item.productName,
      category: item.category,
      hooks: item.hooks,
      talkingPoints: item.talkingPoints,
    });
    setActiveTab('planner');
  };

  const handleSendToCoach = (product: {
    name: string;
    category: CategoryType | string;
    notes?: string;
  }) => {
    setCoachInitialProduct({
      id: `temp-${Date.now()}`,
      name: product.name,
      brand: '',
      category: product.category,
      personalExperience: product.notes || '',
      pros: [],
      cons: [],
      status: 'Sedang dipakai',
      createdAt: new Date().toISOString(),
    });
    setActiveTab('coach');
  };

  const handleCoachFromStash = (product: StashProduct) => {
    setCoachInitialProduct(product);
    setActiveTab('coach');
  };

  const handleIdeasFromStash = (product: StashProduct) => {
    setActiveTab('ideas');
  };

  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke contoh awal? Semua data baru yang belum diekspor akan terhapus.')) {
      storage.resetToDefault();
      refreshCounts();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F2ECE6] text-[#2C1810] flex flex-col justify-center items-center sm:py-4 font-sans-body">
      {/* Mobile-first iPhone Shell Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] sm:h-[88vh] bg-[#FAF6F2] sm:rounded-[40px] shadow-2xl sm:border sm:border-[#E8B4B8]/40 sm:shadow-[0_20px_60px_-15px_rgba(94,25,40,0.15)] flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <Navbar
          onOpenStorageNotice={() => setIsStorageModalOpen(true)}
          onResetData={handleResetData}
          activeTab={activeTab}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-3 pt-2">
          {activeTab === 'coach' && (
            <CoachView
              onOpenCueCard={handleOpenCueCard}
              onSendToPlanner={handleSendToPlanner}
              initialProduct={coachInitialProduct}
              onClearInitialProduct={() => setCoachInitialProduct(null)}
            />
          )}

          {activeTab === 'ideas' && (
            <IdeasView
              onSendToCoach={handleSendToCoach}
              onSendToPlanner={handleSendToPlanner}
              onOpenCueCard={handleOpenCueCard}
            />
          )}

          {activeTab === 'voicedump' && (
            <VoiceDumpView
              onOpenCueCard={handleOpenCueCard}
              onSendToPlanner={handleSendToPlanner}
              onSendToCoach={(data) =>
                handleSendToCoach({
                  name: data.name,
                  category: 'Honest review',
                  notes: data.notes,
                })
              }
            />
          )}

          {activeTab === 'stash' && (
            <StashView
              onGenerateIdeasFromProduct={handleIdeasFromStash}
              onCoachFromProduct={handleCoachFromStash}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerView
              onOpenCueCard={handleOpenCueCard}
              externalNewItem={plannerExternalItem}
              onClearExternalItem={() => setPlannerExternalItem(null)}
            />
          )}
        </main>

        {/* Bottom Tab Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          readyToRecordCount={readyCount}
        />
      </div>

      {/* Fullscreen Teleprompter Cue Card Modal */}
      <CueCardModal
        isOpen={cueCardData.isOpen}
        onClose={() => setCueCardData((prev) => ({ ...prev, isOpen: false }))}
        title={cueCardData.title}
        hooks={cueCardData.hooks}
        talkingPoints={cueCardData.talkingPoints}
        honestVerdict={cueCardData.honestVerdict}
      />

      {/* Storage Info Modal */}
      <StorageNoticeModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        onDataRefreshed={refreshCounts}
      />
    </div>
  );
}
