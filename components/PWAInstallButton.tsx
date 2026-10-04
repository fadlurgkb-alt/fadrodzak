'use client';

import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'floating' | 'compact';
  className?: string;
}

export default function PWAInstallButton({ variant = 'button', className = '' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Jika sudah terpasang sebagai aplikasi standalone
  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7A8B68]/10 text-[#7A8B68] text-xs rounded-xl border border-[#7A8B68]/30">
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="font-medium">Aplikasi Terpasang</span>
      </div>
    );
  }

  const handleAction = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setIsDone(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`bg-[#FFFDF9] border border-[#E8DED6] rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${className}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0 border border-[#C85A32]/20">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-[#6B625D] truncate">
              <strong className="text-[#2C2A29] font-medium font-serif mr-1.5">Aplikasi Fadrodzak:</strong>
              Akses cepat dan nyaman dari layar utama Anda.
            </p>
          </div>
          <button
            onClick={handleAction}
            className="self-end sm:self-auto px-3 py-1.5 bg-[#C85A32] hover:bg-[#A94728] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs transition shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Pasang App
          </button>
        </div>
      ) : variant === 'compact' ? (
        <button
          onClick={handleAction}
          className={`flex items-center gap-1.5 text-xs text-[#C85A32] hover:underline cursor-pointer ${className}`}
          title="Download Aplikasi"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang App</span>
        </button>
      ) : (
        <button
          onClick={handleAction}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-medium rounded-xl shadow-2xs transition cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDone ? 'Aplikasi Terpasang' : 'Download Aplikasi'}</span>
        </button>
      )}

      {/* Modal Panduan Instalasi */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#FFFDF9] p-6 shadow-xl border border-[#E8DED6] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2C2A29]">
                  Pasang Fadrodzak
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-[#6B625D] hover:text-[#2C2A29] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#6B625D] space-y-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8DED6]">
              {isIOS ? (
                <>
                  <p className="font-medium text-[#2C2A29]">
                    Cara pasang di iPhone / iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-[#2C2A29]">
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">1.</span>
                      <span>Ketuk tombol <strong>Bagikan / Share</strong> (<Share className="w-3.5 h-3.5 inline mx-1 text-[#C85A32]" />) di bilah bawah Safari.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">2.</span>
                      <span>Gulir ke bawah lalu pilih <strong>Tambahkan ke Layar Utama</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#2C2A29]" />).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="shrink-0">3.</span>
                      <span>Ketuk <strong>Tambah</strong> di sudut kanan atas. Selesai!</span>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-medium text-[#2C2A29]">
                    Cara pasang di Android / Komputer (Chrome / Edge):
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-[#2C2A29]">
                    <li>Buka menu titik tiga (<strong>⋮</strong>) di pojok kanan atas browser.</li>
                    <li>Pilih <strong>Pasang Aplikasi</strong> atau <strong>Instal Fadrodzak</strong>.</li>
                    <li>Konfirmasi pemasangan, ikon Fadrodzak akan muncul di layar utama Anda.</li>
                  </ol>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-[#C85A32] text-white rounded-xl text-xs font-medium hover:bg-[#A94728] transition shadow-2xs cursor-pointer"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
