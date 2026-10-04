'use client';

import { useState, useTransition } from 'react';
import confetti from 'canvas-confetti';
import { Feather, Flame, Coffee, Sparkles } from 'lucide-react';

export type ReaksiTipe = 'tersentuh' | 'membakar' | 'hangat' | 'memukau';

interface ReaksiData {
  tipe: ReaksiTipe;
  label: string;
  icon: typeof Feather;
  count: number;
}

interface ApresiasiMikroProps {
  karyaId: number;
  initialCounts?: Record<string, number>;
  onReactAction?: (karyaId: number, tipe: ReaksiTipe) => Promise<void>;
}

export default function ApresiasiMikro({
  karyaId,
  initialCounts = {},
  onReactAction,
}: ApresiasiMikroProps) {
  const [counts, setCounts] = useState<Record<ReaksiTipe, number>>({
    tersentuh: initialCounts.tersentuh || 0,
    membakar: initialCounts.membakar || 0,
    hangat: initialCounts.hangat || 0,
    memukau: initialCounts.memukau || 0,
  });

  const [userSelected, setUserSelected] = useState<ReaksiTipe | null>(null);
  const [isPending, startTransition] = useTransition();

  const daftarReaksi: ReaksiData[] = [
    {
      tipe: 'tersentuh',
      label: 'Tersentuh',
      icon: Feather,
      count: counts.tersentuh,
    },
    {
      tipe: 'membakar',
      label: 'Membakar',
      icon: Flame,
      count: counts.membakar,
    },
    {
      tipe: 'hangat',
      label: 'Hangat',
      icon: Coffee,
      count: counts.hangat,
    },
    {
      tipe: 'memukau',
      label: 'Memukau',
      icon: Sparkles,
      count: counts.memukau,
    },
  ];

  const handlePilihReaksi = (tipe: ReaksiTipe, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { x, y },
      colors: ['#C85A32', '#A94728', '#7A8B68', '#E8DED6'],
      disableForReducedMotion: true,
      scalar: 0.8,
    });

    setUserSelected(tipe);
    setCounts((prev) => ({
      ...prev,
      [tipe]: prev[tipe] + 1,
    }));

    if (onReactAction) {
      startTransition(async () => {
        try {
          await onReactAction(karyaId, tipe);
        } catch (err) {
          console.warn('Gagal mencatat apresiasi:', err);
        }
      });
    }
  };

  const totalApresiasi = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="py-4 border-y border-[#E8DED6] my-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#6B625D] uppercase tracking-wider">
          Apresiasi Rasa Sastra:
        </span>
        <span className="text-xs text-[#6B625D]">
          {totalApresiasi} Jejak Apresiasi
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {daftarReaksi.map((r) => {
          const isSelected = userSelected === r.tipe;
          const IconComponent = r.icon;
          return (
            <button
              key={r.tipe}
              type="button"
              onClick={(e) => handlePilihReaksi(r.tipe, e)}
              disabled={isPending}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border transition active:scale-95 text-left cursor-pointer ${
                isSelected
                  ? 'border-[#C85A32] bg-[#FAF8F5] text-[#C85A32] font-semibold ring-1 ring-[#C85A32]'
                  : 'border-[#E8DED6] bg-[#FFFDF9] hover:bg-[#FAF8F5] hover:border-[#C85A32]/40 text-[#2C2A29]'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C85A32]' : 'text-[#6B625D]'}`} />
                <span className="text-xs font-medium truncate">
                  {r.label}
                </span>
              </div>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                isSelected ? 'bg-[#C85A32] text-white' : 'bg-[#FAF8F5] text-[#6B625D]'
              }`}>
                {r.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
