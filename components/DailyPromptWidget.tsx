'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, PenLine, BookOpen, Clock } from 'lucide-react';

interface PromptItem {
  hari: string;
  tanggal: string;
  tema: string;
  kategoriSaran: string;
  pemantik: string;
  isToday?: boolean;
}

const TANTANGAN_SEPEKAN: PromptItem[] = [
  {
    hari: 'Senin',
    tanggal: 'Pekan Ini',
    tema: 'Senja di Balik Jendela',
    kategoriSaran: 'Puisi',
    pemantik: 'Tuliskan tentang seseorang yang menatap pulang dari kaca berembun.',
  },
  {
    hari: 'Selasa',
    tanggal: 'Pekan Ini',
    tema: 'Aroma Kopi Pagi dan Kenangan',
    kategoriSaran: 'Novel & Cerbung',
    pemantik: 'Tuliskan bab pembuka kisah tentang bagaimana secangkir kopi membangkitkan masa silam tokoh utama.',
  },
  {
    hari: 'Rabu',
    tanggal: 'Pekan Ini',
    tema: 'Hujan yang Terlambat Datang',
    kategoriSaran: 'Puisi',
    pemantik: 'Tentang kemarau batin dan titik air pertama yang menyejukkan tanah gersang.',
  },
  {
    hari: 'Kamis',
    tanggal: 'Pekan Ini',
    tema: 'Jejak Sunyi di Kota Tua',
    kategoriSaran: 'Cerpen',
    pemantik: 'Langkah kaki di trotoar lengang dan bangunan bernapas kolonial.',
  },
  {
    hari: 'Jumat',
    tanggal: 'Hari Ini',
    tema: 'Surat Tak Pernah Terkirim',
    kategoriSaran: 'Puisi',
    pemantik: 'Ungkapkan kalimat yang tertahan di kerongkongan sebelum berpisah.',
    isToday: true,
  },
  {
    hari: 'Sabtu',
    tanggal: 'Besok',
    tema: 'Kereta Senja dan Rahasia yang Terbawa',
    kategoriSaran: 'Novel & Cerbung',
    pemantik: 'Bab lanjutan tentang pengelana yang menemukan koper tertinggal di gerbong malam.',
  },
  {
    hari: 'Minggu',
    tanggal: 'Lusa',
    tema: 'Pasar Malam dan Balon Gas Merah',
    kategoriSaran: 'Cerpen',
    pemantik: 'Kenangan masa kecil dan tawa riang yang memudar perlahan.',
  },
];

export default function DailyPromptWidget() {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem>(
    TANTANGAN_SEPEKAN.find((p) => p.isToday) || TANTANGAN_SEPEKAN[4]
  );
  const [showAllPrompts, setShowAllPrompts] = useState(false);

  return (
    <section className="bg-[#FFFDF9] rounded-2xl p-6 sm:p-7 border border-[#E8DED6] shadow-2xs mb-8">
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E8DED6]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0 border border-[#C85A32]/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#2C2A29]">
                Kalender Tantangan Harian
              </h3>
              <span className="border border-[#E8DED6] bg-[#FAF8F5] text-[#C85A32] text-[10px] font-semibold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Daily Prompt
              </span>
            </div>
            <p className="text-xs text-[#6B625D] mt-0.5">
              Pemicu inspirasi harian agar penamu tidak pernah kehabisan kata.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAllPrompts(!showAllPrompts)}
          className="text-xs text-[#C85A32] hover:text-[#A94728] font-semibold self-start sm:self-center flex items-center gap-1.5 transition cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{showAllPrompts ? 'Tutup Kalender Sepekan' : 'Lihat Jadwal Sepekan'}</span>
        </button>
      </div>

      {/* Tema Harian Aktif */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-[#6B625D] mb-2">
          <span className="flex items-center gap-1.5 font-semibold text-[#C85A32]">
            <Clock className="w-3.5 h-3.5" />
            Tema {selectedPrompt.hari} ({selectedPrompt.tanggal})
          </span>
          <span className="bg-[#FAF8F5] border border-[#E8DED6] text-[#6B625D] px-2.5 py-0.5 rounded-lg text-[11px]">
            Saran: <strong className="text-[#C85A32] font-semibold">{selectedPrompt.kategoriSaran}</strong>
          </span>
        </div>

        <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2A29] mb-2 leading-snug">
          &ldquo;{selectedPrompt.tema}&rdquo;
        </h4>

        <p className="text-sm text-[#6B625D] leading-relaxed mb-4">
          {selectedPrompt.pemantik}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8DED6]">
          <span className="text-xs text-[#6B625D] italic font-serif flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#7A8B68]" />
            Karya bertema ini otomatis tampil di kurasi redaksi.
          </span>

          <Link
            href={`/tulis?tema=${encodeURIComponent(selectedPrompt.tema)}&kategori=${encodeURIComponent(selectedPrompt.kategoriSaran)}`}
            className="inline-flex items-center gap-2 bg-[#C85A32] hover:bg-[#A94728] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-2xs transition"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Tulis dengan Tema Ini &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Grid Tema Sepekan */}
      {showAllPrompts && (
        <div className="pt-2 animate-in fade-in duration-150">
          <p className="text-xs font-semibold text-[#2C2A29] uppercase tracking-wider mb-2.5">
            Daftar Inspirasi 7 Hari:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {TANTANGAN_SEPEKAN.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPrompt(item)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedPrompt.tema === item.tema
                    ? 'bg-[#FFFDF9] border-[#C85A32] ring-1 ring-[#C85A32] shadow-2xs'
                    : 'bg-[#FAF8F5] hover:bg-[#FFFDF9] border-[#E8DED6]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-semibold ${item.isToday ? 'text-[#C85A32]' : 'text-[#6B625D]'}`}>
                    {item.hari} {item.isToday && '• Hari Ini'}
                  </span>
                  <span className="text-[10px] text-[#6B625D]">{item.kategoriSaran}</span>
                </div>
                <p className="font-serif font-bold text-sm text-[#2C2A29] line-clamp-1">
                  {item.tema}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
