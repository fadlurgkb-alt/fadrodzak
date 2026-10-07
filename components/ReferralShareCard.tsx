'use client';

import React, { useState } from 'react';
import { Gift, Check, Copy, MessageCircle, Users } from 'lucide-react';

interface Props {
  userId: string;
  nama?: string;
}

export default function ReferralShareCard({ userId, nama }: Props) {
  const [copied, setCopied] = useState(false);

  const pengundang = nama ? `Saya (${nama})` : 'Saya';
  const referralUrl = `https://fadrodzak.my.id/login?ref=${encodeURIComponent(userId)}`;
  const shareMessage = `Hai kawan! ${pengundang} mengundangmu bergabung dan berkarya di Fadrodzak — ruang sastra tenang untuk menerbitkan puisi, cerpen, dan cerita bersambung.\n\nSedang berlangsung Sayembara Sastra berhadiah total Rp200.000!\n\nDaftar lewat tautan ini: ${referralUrl}`;

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-3xl p-5 sm:p-6 shadow-2xs mb-6 relative overflow-hidden space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            <span>Pilar Komunitas • Undian Rp50.000</span>
          </div>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1C1A19]">
            Ajak Kawan &amp; Masuk Undian Sahabat Aksara
          </h3>
          <p className="text-xs text-[#5C544F] leading-relaxed max-w-xl">
            Bagikan tautan rujukan Anda ke teman-teman penulis. Jika kawan Anda mendaftar dan mempublikasikan karya pertamanya, nama Anda sah masuk ke dalam undian hadiah <strong>Rp50.000 tunai</strong>!
          </p>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Kotak Link Referral */}
      <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="text-xs font-mono text-[#5C544F] truncate max-w-full sm:max-w-md select-all">
          {referralUrl}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D8CEC4] hover:border-[#C85A32] bg-white text-xs font-medium text-[#2C2A29] transition shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Kirim ke WA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
