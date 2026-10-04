'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, MessageCircle } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Jangan tampilkan footer di halaman ruang percakapan penuh agar layout chat tidak terdorong
  if (pathname?.startsWith('/chat/')) {
    return null;
  }

  return (
    <footer className="w-full mt-16 pb-24 border-t border-[#E8DED6] pt-8 text-center select-none bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 space-y-5">
        {/* Dukungan & Kritik Saran */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Tautan Dukung Kami via Trakteer */}
          <a
            href="https://trakteer.id/ahmad_rahman7/tip"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFFDF9] hover:bg-white border border-[#E8DED6] text-xs text-[#C85A32] shadow-2xs hover:border-[#C85A32]/40 transition group"
            title="Dukung kelangsungan dan perkembangan Fadrodzak"
          >
            <Coffee className="w-3.5 h-3.5 text-[#C85A32] group-hover:scale-110 transition-transform" />
            <span className="font-medium">Dukungan Penulis via Trakteer</span>
            <span className="text-[#6B625D] text-[10px] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </a>

          {/* Tautan Kritik & Saran via Instagram */}
          <a
            href="https://www.instagram.com/fadrodzak_el_fa?stkn=M2tlYXhuZWhpMHdq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFFDF9] hover:bg-white border border-[#E8DED6] text-xs text-[#6B625D] hover:text-[#C85A32] shadow-2xs hover:border-[#C85A32]/30 transition group"
            title="Kirim kritik dan saran langsung melalui Instagram"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#6B625D] group-hover:text-[#C85A32] transition-colors" />
            <span className="font-medium">Kritik &amp; Saran: <strong className="font-semibold text-[#2C2A29] group-hover:text-[#C85A32]">@fadrodzak_el_fa</strong></span>
            <span className="text-[#6B625D] text-[10px] group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </a>
        </div>

        {/* Navigasi Minimalis */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#6B625D]">
          <Link
            href="/tentang-kami"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Tentang Kami
          </Link>
          <span className="text-[#E8DED6] hidden sm:inline">•</span>
          <Link
            href="/kontak"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Hubungi Kami
          </Link>
          <span className="text-[#E8DED6] hidden sm:inline">•</span>
          <Link
            href="/kebijakan-privasi"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Kebijakan Privasi
          </Link>
          <span className="text-[#E8DED6] hidden sm:inline">•</span>
          <Link
            href="/syarat-ketentuan"
            className="hover:text-[#C85A32] transition underline-offset-4 hover:underline"
          >
            Syarat &amp; Ketentuan
          </Link>
        </nav>

        {/* Hak Cipta & Slogan */}
        <p className="text-[11px] text-[#6B625D]">
          © {new Date().getFullYear()} <strong className="text-[#2C2A29] font-medium">Fadrodzak</strong> — Ruang Sastra &amp; Komunitas Aksara.
        </p>
      </div>
    </footer>
  );
}
