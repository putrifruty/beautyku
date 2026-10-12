import React, { useState, useEffect } from 'react';
import {
  Sparkle,
  Plus,
  Lightbulb,
  MessageSquareHeart,
  Edit2,
  Trash2,
  Camera,
  X,
} from 'lucide-react';
import { StashProduct, ProductStatus } from '../types';
import { storage } from '../services/storage';

interface StashViewProps {
  onGenerateIdeasFromProduct: (product: StashProduct) => void;
  onCoachFromProduct: (product: StashProduct) => void;
}

const STATUS_OPTIONS: ProductStatus[] = ['Ingin dicoba', 'Sedang dipakai', 'Favorit', 'Sudah habis'];

const PRESET_PHOTOS = [
  { label: 'Lip Tint', url: '/src/assets/images/beauty_lip_tint_1791731288784.jpg' },
  { label: 'Serum', url: '/src/assets/images/beauty_serum_bottle_1791731303677.jpg' },
  { label: 'Cushion', url: '/src/assets/images/beauty_cushion_compact_1791731318424.jpg' },
];

export const StashView: React.FC<StashViewProps> = ({
  onGenerateIdeasFromProduct,
  onCoachFromProduct,
}) => {
  const [products, setProducts] = useState<StashProduct[]>([]);
  const [filter, setFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StashProduct | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Lip product review');
  const [shade, setShade] = useState('');
  const [image, setImage] = useState('');
  const [personalExperience, setPersonalExperience] = useState('');
  const [status, setStatus] = useState<ProductStatus>('Sedang dipakai');

  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setCategory('Lip product review');
    setShade('');
    setImage(PRESET_PHOTOS[0].url);
    setPersonalExperience('');
    setStatus('Sedang dipakai');
    setIsModalOpen(true);
  };

  const openEdit = (p: StashProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setCategory(p.category);
    setShade(p.shade || '');
    setImage(p.image || '');
    setPersonalExperience(p.personalExperience || '');
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim()) return;

    if (editingProduct) {
      storage.updateProduct({
        ...editingProduct,
        name: name.trim(),
        brand: brand.trim(),
        category,
        shade: shade.trim() || undefined,
        image: image || editingProduct.image,
        personalExperience: personalExperience.trim(),
        status,
      });
    } else {
      storage.addProduct({
        id: `prod-${Date.now()}`,
        name: name.trim(),
        brand: brand.trim(),
        category,
        shade: shade.trim() || undefined,
        image: image || PRESET_PHOTOS[0].url,
        personalExperience: personalExperience.trim(),
        pros: [],
        cons: [],
        status,
        createdAt: new Date().toISOString(),
      });
    }

    setProducts(storage.getProducts());
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus produk ini dari stash?')) {
      storage.deleteProduct(id);
      setProducts(storage.getProducts());
    }
  };

  const filtered = products.filter((p) => {
    if (filter === 'Semua') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto px-1 pt-1 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#E8B4B8]/35 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#8A223B] tracking-wider uppercase block">
            Koleksi Produk
          </span>
          <h3 className="font-serif-luxury text-base font-bold text-[#5E1928]">
            My Beauty Stash
          </h3>
        </div>

        <button
          onClick={openAdd}
          className="bg-[#5E1928] hover:bg-[#7B1E34] text-white text-xs font-bold py-2 px-3 rounded-xl transition-all shadow-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar px-1">
        {['Semua', ...STATUS_OPTIONS].map((st) => (
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

      {/* Products Grid */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-3.5 border border-[#E8B4B8]/35 shadow-xs flex flex-col gap-2.5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#FAF6F2] border border-[#E8B4B8]/40 shrink-0">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#E8B4B8]">
                    <Sparkle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#8A5A62]">{p.brand}</span>
                  <span className="text-[10px] font-semibold text-[#8A223B] bg-[#F5D5D8]/40 px-2 py-0.5 rounded-full">
                    {p.status}
                  </span>
                </div>
                <h4 className="font-serif-luxury text-sm font-bold text-[#5E1928] truncate">
                  {p.name}
                </h4>
                {p.shade && <p className="text-[11px] text-[#8A5A62] truncate">Shade: {p.shade}</p>}
                {p.personalExperience && (
                  <p className="text-[11px] text-[#2C1810]/80 italic line-clamp-1 mt-0.5">
                    "{p.personalExperience}"
                  </p>
                )}
              </div>
            </div>

            {/* Quick 1-Tap Action Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-[#E8B4B8]/20 gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <button
                  onClick={() => onCoachFromProduct(p)}
                  className="flex-1 bg-[#5E1928] hover:bg-[#7B1E34] text-white text-[11px] font-semibold py-1.5 px-2.5 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <MessageSquareHeart className="w-3 h-3 text-[#F5D5D8]" />
                  <span>Latih Bicara</span>
                </button>
                <button
                  onClick={() => onGenerateIdeasFromProduct(p)}
                  className="bg-[#FAF6F2] hover:bg-[#F5D5D8]/50 text-[#5E1928] text-[11px] font-semibold py-1.5 px-2.5 rounded-xl border border-[#E8B4B8]/60 transition-colors flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3 text-[#8A223B]" />
                  <span>Ide</span>
                </button>
              </div>

              <div className="flex items-center gap-0.5 shrink-0 text-[#8A5A62]">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:text-[#5E1928]">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:text-red-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#E8B4B8]/40 space-y-3 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 p-1.5 text-[#8A5A62] hover:text-[#5E1928]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif-luxury text-base font-bold text-[#5E1928]">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Kosmetik'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5E1928] block mb-1">Merek & Nama Produk</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Brand (Somethinc)"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8] focus:bg-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nama (Lip Tint)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5E1928] block mb-1">Shade / Varian & Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Shade (02 Mauve)"
                    value={shade}
                    onChange={(e) => setShade(e.target.value)}
                    className="p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8] focus:bg-white"
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="p-2.5 rounded-xl bg-[#FAF6F2] border border-[#E8B4B8]"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5E1928] block mb-1">Pilih Foto Kosmetik</label>
                <div className="flex items-center gap-2">
                  {PRESET_PHOTOS.map((pr) => (
                    <button
                      key={pr.label}
                      type="button"
                      onClick={() => setImage(pr.url)}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        image === pr.url ? 'border-[#5E1928] scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={pr.url} alt={pr.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5E1928] block mb-1">Review Singkat</label>
                <textarea
                  placeholder="Ceritakan rasanya di kulit atau bibir..."
                  value={personalExperience}
                  onChange={(e) => setPersonalExperience(e.target.value)}
                  rows={2}
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
