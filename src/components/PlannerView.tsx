import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Video,
  Edit2,
  Trash2,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { PlannerItem, PlannerStatus, PlatformType, CategoryType } from '../types';
import { storage } from '../services/storage';

interface PlannerViewProps {
  onOpenCueCard: (data: {
    title: string;
    hooks?: string[];
    talkingPoints: any[];
  }) => void;
  externalNewItem?: Partial<PlannerItem> | null;
  onClearExternalItem?: () => void;
}

const STATUS_LIST: PlannerStatus[] = [
  'Ide',
  'Siap direkam',
  'Sudah direkam',
  'Sedang diedit',
  'Sudah diunggah',
];

const PLATFORMS: PlatformType[] = ['TikTok', 'Instagram Reels', 'TikTok & Reels'];

export const PlannerView: React.FC<PlannerViewProps> = ({
  onOpenCueCard,
  externalNewItem,
  onClearExternalItem,
}) => {
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [filter, setFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [platform, setPlatform] = useState<PlatformType>('TikTok');
  const [status, setStatus] = useState<PlannerStatus>('Siap direkam');
  const [talkingPointsInput, setTalkingPointsInput] = useState('');

  useEffect(() => {
    setItems(storage.getPlannerItems());
  }, []);

  useEffect(() => {
    if (externalNewItem) {
      setTitle(externalNewItem.title || '');
      setTargetDate(new Date().toISOString().split('T')[0]);
      setStatus('Siap direkam');
      setPlatform('TikTok');
      if (externalNewItem.talkingPoints) {
        setTalkingPointsInput(externalNewItem.talkingPoints.join('\n'));
      }
      setIsModalOpen(true);
      onClearExternalItem?.();
    }
  }, [externalNewItem]);

  const openAdd = () => {
    setEditingItem(null);
    setTitle('');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setPlatform('TikTok');
    setStatus('Siap direkam');
    setTalkingPointsInput('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTP = talkingPointsInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      storage.updatePlannerItem({
        ...editingItem,
        title: title.trim(),
        targetDate,
        platform,
        status,
        talkingPoints: parsedTP.length > 0 ? parsedTP : editingItem.talkingPoints,
      });
    } else {
      storage.addPlannerItem({
        id: `plan-${Date.now()}`,
        title: title.trim(),
        targetDate,
        platform,
        category: 'Beauty review',
        status,
        talkingPoints: parsedTP,
        checklist: {
          batteryMemoryReady: false,
          lightingReady: false,
          swatchClean: false,
          audioMicReady: false,
        },
        createdAt: new Date().toISOString(),
      });
    }

    setItems(storage.getPlannerItems());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus jadwal konten ini?')) {
      storage.deletePlannerItem(id);
      setItems(storage.getPlannerItems());
    }
  };

  const handleToggleChecklist = (item: PlannerItem, key: keyof PlannerItem['checklist']) => {
    const updated = {
      ...item,
      checklist: {
        ...item.checklist,
        [key]: !item.checklist[key],
      },
    };
    storage.updatePlannerItem(updated);
    setItems(storage.getPlannerItems());
  };

  const handleUpdateStatus = (item: PlannerItem, newStatus: PlannerStatus) => {
    storage.updatePlannerItem({ ...item, status: newStatus });
    setItems(storage.getPlannerItems());
  };

  const filtered = items.filter((item) => {
    if (filter === 'Semua') return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-1 pt-1 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8B4B8]/35 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#8A223B] tracking-wider uppercase block">
            Jadwal Mingguan
          </span>
          <h3 className="font-serif-luxury text-base font-bold text-[#5E1928]">
            Content Planner
          </h3>
        </div>

        <button
          onClick={openAdd}
          className="bg-[#5E1928] hover:bg-[#7B1E34] text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Jadwal Baru</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar px-1">
        {['Semua', ...STATUS_LIST].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              filter === st
                ? 'bg-[#5E1928] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#5E1928] hover:bg-[#F5D5D8]/40 border border-[#E8B4B8]/40'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-4 border border-[#E8B4B8]/35 shadow-xs space-y-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#8A5A62]">
                  <span className="font-bold text-[#5E1928] bg-[#FAF6F2] px-2 py-0.5 rounded-md border border-[#E8B4B8]/40">
                    {item.platform}
                  </span>
                  <span>{item.targetDate}</span>
                </div>
                <h4 className="font-serif-luxury text-base font-bold text-[#5E1928] mt-1 leading-snug">
                  {item.title}
                </h4>
              </div>

              {/* Status Switcher */}
              <select
                value={item.status}
                onChange={(e) => handleUpdateStatus(item, e.target.value as PlannerStatus)}
                className="text-xs px-2 py-1 rounded-xl border border-[#E8B4B8]/70 bg-[#FAF6F2] font-semibold text-[#5E1928] outline-none cursor-pointer"
              >
                {STATUS_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Checklist */}
            <div className="bg-[#FAF6F2] p-2.5 rounded-2xl border border-[#E8B4B8]/30 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleToggleChecklist(item, 'batteryMemoryReady')}
                className="flex items-center gap-1.5 text-left text-[#5E1928]"
              >
                {item.checklist.batteryMemoryReady ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#8A5A62] shrink-0" />
                )}
                <span>Baterai Siap</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleChecklist(item, 'lightingReady')}
                className="flex items-center gap-1.5 text-left text-[#5E1928]"
              >
                {item.checklist.lightingReady ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#8A5A62] shrink-0" />
                )}
                <span>Lighting Oke</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleChecklist(item, 'swatchClean')}
                className="flex items-center gap-1.5 text-left text-[#5E1928]"
              >
                {item.checklist.swatchClean ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#8A5A62] shrink-0" />
                )}
                <span>Bibir / Swatch</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleChecklist(item, 'audioMicReady')}
                className="flex items-center gap-1.5 text-left text-[#5E1928]"
              >
                {item.checklist.audioMicReady ? (
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#8A5A62] shrink-0" />
                )}
                <span>Mic Clip-on</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-[#E8B4B8]/20 gap-2">
              <button
                onClick={() =>
                  onOpenCueCard({
                    title: item.title,
                    hooks: item.hooks || [],
                    talkingPoints: (item.talkingPoints || []).map((tp, idx) => ({
                      timestamp: `Poin ${idx + 1}`,
                      bulletPoint: tp,
                      cameraAction: 'Bicara santai ke kamera',
                    })),
                  })
                }
                className="flex-1 bg-[#5E1928] hover:bg-[#7B1E34] text-white text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Buka Cue Card Syuting</span>
              </button>

              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#8A5A62] hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#E8B4B8]/40 space-y-3 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 text-[#8A5A62] hover:text-[#5E1928]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif-luxury text-base font-bold text-[#5E1928]">
              Jadwal Konten Baru
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5E1928] block mb-1">Judul / Topik Video</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Wear Test Lip Tint 8 Jam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5E1928] block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5E1928] block mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as PlatformType)}
                    className="w-full p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8]"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5E1928] block mb-1">
                  Talking Points (1 baris per poin)
                </label>
                <textarea
                  placeholder="Poin 1&#10;Poin 2"
                  value={talkingPointsInput}
                  onChange={(e) => setTalkingPointsInput(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8] focus:bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E8B4B8]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E8B4B8] font-semibold text-[#8A5A62]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#5E1928] text-white font-bold hover:bg-[#7B1E34]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
