'use client';

import { useState } from 'react';
import { Award, Sparkles, X } from 'lucide-react';

type Badge = {
  id: number;
  nama: string;
  deskripsi?: string | null;
  icon: string;
  rarity: string;
};

type Props = {
  badges: Badge[];
};

function getRarityStyle(rarity?: string | null) {
  const safeRarity = String(rarity || 'common').toLowerCase();
  switch (safeRarity) {
    case 'legendary':
      return {
        card: 'border-[#C85A32] bg-[#FAF8F5]',
        label: 'text-[#C85A32] bg-[#C85A32]/10',
      };
    case 'epic':
      return {
        card: 'border-[#7A8B68] bg-[#FAF8F5]',
        label: 'text-[#7A8B68] bg-[#7A8B68]/10',
      };
    case 'rare':
      return {
        card: 'border-[#E8DED6] bg-[#FFFDF9]',
        label: 'text-[#C85A32] bg-[#FAF8F5]',
      };
    default:
      return {
        card: 'border-[#E8DED6] bg-[#FFFDF9]',
        label: 'text-[#6B625D] bg-[#FAF8F5]',
      };
  }
}

export default function BadgeCollection({ badges }: Props) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (badges.length === 0) {
    return (
      <div className="bg-[#FFFDF9] border border-[#E8DED6] rounded-2xl p-5 shadow-2xs">
        <h3 className="font-serif font-bold text-[#2C2A29] mb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#C85A32]" />
          Koleksi Lencana
        </h3>
        <p className="text-xs text-[#6B625D] italic">
          Belum memiliki lencana. Terus membaca dan menulis untuk membuka lencana sastra.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#FFFDF9] border border-[#E8DED6] rounded-2xl p-5 shadow-2xs">
        <div className="mb-4">
          <h3 className="font-serif font-bold text-[#2C2A29] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C85A32]" />
            Koleksi Lencana Sastra
          </h3>
          <p className="text-xs text-[#6B625D] mt-0.5">
            Pilih lencana untuk melihat rincian dan pencapaian.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {badges.map((badge) => {
            const style = getRarityStyle(badge.rarity);

            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className={`
                  ${style.card}
                  border
                  rounded-xl
                  p-4
                  text-center
                  transition
                  hover:border-[#C85A32]/40
                  shadow-2xs
                  cursor-pointer
                `}
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] flex items-center justify-center text-[#C85A32]">
                  <Award className="w-5 h-5" />
                </div>

                <p className="font-serif font-bold text-xs text-[#2C2A29] truncate">
                  {badge.nama}
                </p>

                <span
                  className={`
                    ${style.label}
                    inline-block
                    mt-1.5
                    px-2
                    py-0.5
                    rounded-lg
                    uppercase
                    text-[9px]
                    font-semibold
                    tracking-wider
                  `}
                >
                  {badge.rarity}
                </span>

                <p className="text-[10px] font-semibold text-[#C85A32] mt-2">
                  Lihat Detail &rarr;
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL DETAIL BADGE */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="relative bg-[#FFFDF9] max-w-sm w-full rounded-2xl shadow-xl border border-[#E8DED6] p-6 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E8DED6] text-[#6B625D] hover:text-[#2C2A29] flex items-center justify-center text-xs cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DED6] flex items-center justify-center text-[#C85A32]">
                <Award className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-serif font-bold text-[#2C2A29]">
                {selectedBadge.nama}
              </h2>

              <p className="uppercase text-[10px] tracking-wider text-[#C85A32] font-semibold mt-1">
                {selectedBadge.rarity}
              </p>

              <div className="mt-4 bg-[#FAF8F5] border border-[#E8DED6] rounded-xl p-4 text-left">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#C85A32] mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Tentang Lencana
                </p>

                <p className="text-xs text-[#6B625D] leading-relaxed">
                  {selectedBadge.deskripsi || 'Deskripsi lencana belum dicantumkan.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full mt-5 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-medium hover:bg-[#A94728] transition shadow-2xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}