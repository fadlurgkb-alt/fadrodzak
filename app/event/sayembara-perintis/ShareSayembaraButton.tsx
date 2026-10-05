'use client';

import React, { useState } from 'react';
import { Share2, Check, MessageCircle } from 'lucide-react';

export default function ShareSayembaraButton() {
  const [copied, setCopied] = useState(false);

  const shareText = `✍️ Sayembara Menulis Fadrodzak 2026\nTema: "Hujan, Rumah, dan Kenangan"\nTotal Hadiah: Rp200.000 untuk Penulis & Pembaca Aktif.\nGratis ikut & terbuka untuk umum.\n\nKirim karya atau baca sekarang di: https://fadrodzak.my.id/event/sayembara-perintis`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText('https://fadrodzak.my.id/event/sayembara-perintis');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleShareWhatsApp}
        className="inline-flex items-center gap-1.5 px-4 py-3 bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#2C2A29] hover:text-[#C85A32] border border-[#D8CEC4] hover:border-[#C85A32]/60 rounded-xl text-xs sm:text-sm font-medium shadow-2xs transition cursor-pointer"
        title="Bagikan Info Sayembara ke WhatsApp"
      >
        <MessageCircle className="w-4 h-4 text-emerald-600" />
        <span>Bagikan ke WA</span>
      </button>

      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3.5 py-3 bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#5C544F] hover:text-[#1C1A19] border border-[#D8CEC4] rounded-xl text-xs sm:text-sm font-medium shadow-2xs transition cursor-pointer"
        title="Salin Tautan Sayembara"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700">Tersalin!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Salin Link</span>
          </>
        )}
      </button>
    </div>
  );
}
