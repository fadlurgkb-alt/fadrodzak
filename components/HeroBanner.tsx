'use client';

import React from 'react';
import Link from 'next/link';
import { PenLine, BookOpen, Sparkles, Quote, Compass } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="mb-10 pb-8 border-b border-[#EAE2D9]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Kolom Kiri: Headline & Call-to-Action Utama */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C85A32]/10 border border-[#C85A32]/20 text-[#C85A32] text-xs font-serif tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ruang Sastra & Komunitas Aksara Nusantara</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C1A19] tracking-tight leading-[1.12]">
            Fadrodzak
          </h1>

          <p className="font-serif italic text-lg sm:text-xl text-[#C85A32]">
            &ldquo;Aksara yang hidup adalah aksara yang dirawat bersama.&rdquo;
          </p>

          <p className="text-base sm:text-lg text-[#4A4440] leading-relaxed max-w-xl font-sans">
            Ruang tenang bagi para penenun sajak, penulis cerpen, dan penikmat kata. Terbitkan karya Anda, telusuri ribuan bait bermakna, dan temukan kawan bertukar tafsir.
          </p>

          {/* Tombol Aksi Editorial */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/tulis"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C85A32] hover:bg-[#A94728] text-white rounded-xl text-sm font-medium shadow-xs transition cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>Mulai Menulis Karya</span>
            </Link>

            <Link
              href="/belajar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFFDF9] hover:bg-white text-[#2C2A29] hover:text-[#C85A32] border border-[#D8CEC4] hover:border-[#C85A32]/60 rounded-xl text-sm font-medium shadow-2xs transition cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#C85A32]" />
              <span>Klinik Bedah Karya</span>
            </Link>
          </div>
        </div>

        {/* Kolom Kanan (Desktop): Panel Kutipan Sastra Pilihan */}
        <div className="hidden lg:block lg:col-span-5">
          <div className="bg-[#FFFDF9] border border-[#E2D7CC] rounded-2xl p-6 lg:p-7 shadow-xs relative overflow-hidden">
            <div className="absolute top-2 right-3 text-[#C85A32]/10 select-none pointer-events-none">
              <Quote className="w-24 h-24" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C85A32]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kutipan Sastra Hari Ini</span>
              </div>

              <blockquote className="font-serif italic text-lg sm:text-xl text-[#242120] leading-relaxed">
                &ldquo;Yang fana adalah waktu. Kita abadi: memungut detik demi detik, merangkainya seperti bunga sampai pada suatu hari kita lupa untuk apa.&rdquo;
              </blockquote>

              <div className="pt-2 border-t border-[#EAE2D9] flex items-center justify-between text-xs text-[#5C544F]">
                <span className="font-semibold text-[#1C1A19]">Sapardi Djoko Damono</span>
                <span>Hujan Bulan Juni</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
