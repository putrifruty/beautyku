import React, { useState } from 'react';
import { X, HardDrive, Download, Upload, AlertCircle, Check } from 'lucide-react';
import { storage } from '../services/storage';

interface StorageNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRefreshed: () => void;
}

export const StorageNoticeModal: React.FC<StorageNoticeModalProps> = ({
  isOpen,
  onClose,
  onDataRefreshed,
}) => {
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [importError, setImportError] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    const data = storage.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beauty-content-buddy-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const data = storage.exportAllData();
    navigator.clipboard.writeText(data);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleImport = () => {
    setImportError('');
    if (!importText.trim()) return;
    const ok = storage.importData(importText);
    if (ok) {
      onDataRefreshed();
      setShowImportArea(false);
      setImportText('');
      onClose();
    } else {
      setImportError('Format JSON tidak valid. Pastikan data berasal dari cadangan Beauty Content Buddy.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8B4B8]/40 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8A5A62] hover:text-[#5E1928] rounded-full hover:bg-[#FAF6F2] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F5D5D8] flex items-center justify-center text-[#5E1928]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#5E1928]">
              Penyimpanan Data Lokal
            </h3>
            <p className="text-xs text-[#8A5A62]">Status Penyimpanan & Batasan</p>
          </div>
        </div>

        <div className="bg-[#FAF6F2] border border-[#E8B4B8]/40 rounded-2xl p-4 text-xs text-[#5E1928]/90 space-y-2 mb-4 leading-relaxed">
          <p className="font-semibold flex items-center gap-1.5 text-[#5E1928]">
            <AlertCircle className="w-4 h-4 text-[#8A223B] shrink-0" />
            Catatan Penting Prototipe:
          </p>
          <p>
            Semua ide konten, riwayat latihan coach, produk stash, dan kalender kamu tersimpan
            secara <strong>lokal di browser perangkat ini (LocalStorage)</strong>.
          </p>
          <p className="text-[#8A5A62]">
            Data <em>tidak disinkronkan otomatis antar-perangkat</em> (misal dari HP ke laptop)
            karena belum terhubung ke akun cloud. Gunakan tombol Cadangkan di bawah untuk memindahkan data.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-[#5E1928] hover:bg-[#7B1E34] text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Unduh Cadangan JSON
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 bg-[#FAF6F2] hover:bg-[#F5D5D8]/50 text-[#5E1928] border border-[#E8B4B8]/60 text-xs font-medium py-2.5 px-3 rounded-xl transition-colors"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : null}
              <span>{copySuccess ? 'Tersalin!' : 'Salin JSON'}</span>
            </button>
          </div>

          {!showImportArea ? (
            <button
              onClick={() => setShowImportArea(true)}
              className="w-full flex items-center justify-center gap-2 text-xs text-[#8A5A62] hover:text-[#5E1928] py-2 transition-colors border border-dashed border-[#E8B4B8] rounded-xl"
            >
              <Upload className="w-3.5 h-3.5" />
              Pulihkan Data dari Cadangan JSON
            </button>
          ) : (
            <div className="space-y-2 pt-2 border-t border-[#E8B4B8]/30">
              <label className="text-xs font-medium text-[#5E1928] block">
                Tempel teks JSON cadangan kamu:
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"stash": [...], "planner": [...]}'
                rows={3}
                className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#E8B4B8] bg-[#FAF6F2] focus:outline-none focus:ring-1 focus:ring-[#5E1928]"
              />
              {importError && (
                <p className="text-[11px] text-red-600 font-medium">{importError}</p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowImportArea(false)}
                  className="text-xs text-[#8A5A62] px-3 py-1.5 rounded-lg hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleImport}
                  className="text-xs bg-[#5E1928] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#7B1E34]"
                >
                  Terapkan Cadangan
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-[#E8B4B8]/20 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#8A5A62] hover:text-[#5E1928] px-4 py-2"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
