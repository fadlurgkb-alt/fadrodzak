import React from 'react';
import Link from 'next/link';
import { PenLine, BookOpen, Feather } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative mb-10 pt-2 pb-6 border-b border-[#E8DED6]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        {/* Sisi Kiri: Identitas Editorial & Tagline */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Feather className="w-3.5 h-3.5 text-[#C85A32]" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#C85A32]">
              Ruang Sastra &amp; Komunitas Aksara
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-[#2C2A29] leading-tight mb-2">
            Fadrodzak
          </h1>

          <p className="text-base sm:text-lg font-serif italic text-[#6B625D] leading-relaxed">
            &ldquo;Tempat di mana kata-kata menemukan rumahnya.&rdquo;
          </p>
        </div>

        {/* Sisi Kanan: Kutipan Redaksi Editorial */}
        <div className="md:max-w-xs border-l border-[#C85A32]/60 pl-3.5 py-0.5">
          <p className="text-xs sm:text-sm font-serif italic text-[#6B625D] leading-relaxed">
            &ldquo;Setiap huruf yang terpahat adalah jejak jiwa, setiap bait adalah doa yang tak bersuara.&rdquo;
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[#6B625D]/80 mt-1.5 font-medium">
            Warta Redaksi Fadrodzak
          </p>
        </div>
      </div>

      {/* Baris Tombol Aksi Cepat - Lebih Tipis & Elegan */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/tulis"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C85A32] hover:bg-[#A94728] text-white font-medium text-xs shadow-2xs transition group"
          >
            <PenLine className="w-3.5 h-3.5 text-white" />
            <span>Mulai Menulis Karya</span>
            <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>

          <Link
            href="/belajar"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#2C2A29] border border-[#E8DED6] text-xs font-medium transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#7A8B68]" />
            <span>Klinik Bedah Karya</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#6B625D]">
          <span>Puisi</span>
          <span className="text-[#E8DED6]">•</span>
          <span>Cerpen</span>
          <span className="text-[#E8DED6]">•</span>
          <span>Pantun</span>
          <span className="text-[#E8DED6]">•</span>
          <span>Novel Bersambung</span>
        </div>
      </div>
    </section>
  );
}
