'use client';

import { useState, useEffect } from 'react';
import { CardTheme, downloadQuoteCard, shareQuoteCard, generateQuoteCardCanvas } from '../lib/quote-card';
import { Share2, Download, RefreshCw, Feather, Check, Sun, Compass, Sunset, Moon } from 'lucide-react';

interface CuratedQuote {
  judul: string;
  penulis: string;
  kategori: string;
  bait: string;
  catatanRedaksi: string;
}

const DAFTAR_KUTIPAN: CuratedQuote[] = [
  {
    judul: 'Senja di Tepian Kali Porong',
    penulis: 'Fadrodzak',
    kategori: 'Puisi',
    bait: 'Di tepian kali yang merapuh senja,\nlangit menyapu saga dengan jemari jingga.\nAir mengalir tanpa keluh dan ragu,\nmenghanyutkan rindu yang lama membeku.',
    catatanRedaksi: 'Pilihan redaksi hari ini tentang ketabahan melepas hari yang telah lalu.',
  },
  {
    judul: 'Sepucuk Surat dari Lorong Perpustakaan',
    penulis: 'Aisyah Rahma',
    kategori: 'Cerpen',
    bait: 'Aroma kertas tua selalu menyembunyikan masa lalu.\nUntuk siapa saja yang masih percaya,\nbahwa kata-kata sanggup menyembuhkan luka.',
    catatanRedaksi: 'Kutipan pengingat betapa lembutnya daya sembuh seuntai kalimat.',
  },
  {
    judul: 'Garis Takdir Sang Penenun',
    penulis: 'Rengganis Aksara',
    kategori: 'Novel & Cerbung',
    bait: 'Bukan riuhnya metafora yang membuat kisah abadi,\nmelainkan ruang sunyi di antara bab-babnya,\ntempat pembaca menemukan detak jantungnya sendiri.',
    catatanRedaksi: 'Kutipan novel pilihan tentang kedalaman perenungan dalam membaca kisah.',
  },
  {
    judul: 'Pantun Penjaga Nyala',
    penulis: 'Budi Santoso',
    kategori: 'Pantun',
    bait: 'Bunga melati di taman sari,\nHarum semerbak di waktu pagi.\nMari membaca setiap hari,\nBuka jendela luasnya negeri.',
    catatanRedaksi: 'Pemicu semangat literasi pembuka pagi.',
  },
  {
    judul: 'Hujan di Pelataran Senja',
    penulis: 'Dra. Siti Wardani',
    kategori: 'Puisi',
    bait: 'Gerimis tak pernah tergesa menyentuh bumi,\nsebagaimana rindu yang tahu kemana ia harus kembali.',
    catatanRedaksi: 'Bait lembut menenangkan hati di tengah kesibukan.',
  },
];

function getInitialGreetingInfo() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) {
    return { greeting: 'Sapaan Fajar & Pagi Aksara', period: 'pagi', index: 0 };
  } else if (hour >= 11 && hour < 15) {
    return { greeting: 'Meneduhkan Siang dengan Aksara', period: 'siang', index: 1 };
  } else if (hour >= 15 && hour < 19) {
    return { greeting: 'Senja di Pelataran Sastra', period: 'senja', index: 2 };
  } else {
    return { greeting: 'Bait Kontemplasi Malam', period: 'malam', index: 3 };
  }
}

export default function DailyLiteraryGreeting() {
  const [greetingInfo] = useState(getInitialGreetingInfo);
  const [quoteIndex, setQuoteIndex] = useState(greetingInfo.index);
  const [greeting] = useState(greetingInfo.greeting);
  const [period] = useState(greetingInfo.period);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<CardTheme>('terracotta');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const quote = DAFTAR_KUTIPAN[quoteIndex % DAFTAR_KUTIPAN.length];

  // Buat pratinjau canvas saat modal dibuka atau tema berganti
  useEffect(() => {
    if (!isModalOpen) return;
    let isCancelled = false;

    generateQuoteCardCanvas({
      judul: quote.judul,
      kutipan: quote.bait,
      penulis: quote.penulis,
      kategori: quote.kategori,
      theme,
    }).then((canvas) => {
      if (!isCancelled) {
        setPreviewDataUrl(canvas.toDataURL('image/png'));
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [isModalOpen, quote, theme]);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % DAFTAR_KUTIPAN.length);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadQuoteCard({
        judul: quote.judul,
        kutipan: quote.bait,
        penulis: quote.penulis,
        kategori: quote.kategori,
        theme,
      }, `kutipan-${quote.judul.toLowerCase().replace(/\s+/g, '-')}.png`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await shareQuoteCard({
        judul: quote.judul,
        kutipan: quote.bait,
        penulis: quote.penulis,
        kategori: quote.kategori,
        theme,
      });
      if (success) {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <section className="rounded-2xl bg-[#FFFDF9] border border-[#E8DED6] p-6 sm:p-7 shadow-2xs mb-8">
      {/* Header Widget */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E8DED6]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center shrink-0 border border-[#C85A32]/20">
            {period === 'pagi' && <Sun className="w-4 h-4" />}
            {period === 'siang' && <Compass className="w-4 h-4" />}
            {period === 'senja' && <Sunset className="w-4 h-4" />}
            {period === 'malam' && <Moon className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-[#C85A32] uppercase">
              Sapaan Aksara Harian
            </p>
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#2C2A29]">
              {greeting}
            </h2>
          </div>
        </div>

        <button
          onClick={handleNextQuote}
          title="Ganti bait inspirasi lainnya"
          className="px-3 py-1.5 text-[#6B625D] hover:text-[#C85A32] hover:bg-[#FAF8F5] rounded-xl transition flex items-center gap-1.5 text-xs border border-[#E8DED6] bg-[#FFFDF9] shadow-2xs cursor-pointer font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ganti Bait</span>
        </button>
      </div>

      {/* Bait Kutipan Editorial */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-[#6B625D] mb-3">
          <span className="italic font-serif">Dari karya: &ldquo;{quote.judul}&rdquo;</span>
          <span className="px-2 py-0.5 rounded-lg border border-[#E8DED6] bg-[#FAF8F5] text-[#C85A32] font-semibold text-[10px] uppercase tracking-wider">
            {quote.kategori}
          </span>
        </div>

        <blockquote className="font-serif text-lg sm:text-xl text-[#2C2A29] italic leading-relaxed whitespace-pre-line border-l-2 border-[#C85A32] pl-4 py-1 my-2">
          &ldquo;{quote.bait}&rdquo;
        </blockquote>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8DED6] text-xs">
          <p className="text-[#6B625D]">
            Karya: <strong className="font-semibold text-[#2C2A29]">{quote.penulis}</strong>
          </p>
          <p className="text-[11px] text-[#6B625D] italic hidden sm:block">
            {quote.catatanRedaksi}
          </p>
        </div>
      </div>

      {/* Baris Bawah: Sumber & Tombol Bagikan */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-[#6B625D] italic font-serif flex items-center gap-1.5">
          <Feather className="w-3.5 h-3.5 text-[#C85A32]" />
          Kurasi bait sastra harian Fadrodzak
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#C85A32] hover:bg-[#A94728] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-2xs transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Bagikan ke Story WA / IG</span>
        </button>
      </div>

      {/* Modal Pratinjau & Kustomisasi Kartu Sastra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-md w-full p-6 border border-[#E8DED6] shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DED6] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#2C2A29]">Kartu Kutipan Sastra</h3>
                <p className="text-xs text-[#6B625D]">Siap dibagikan ke Story WA &amp; Instagram</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#FAF8F5] flex items-center justify-center text-xs font-bold text-[#6B625D] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pemilihan Tema Kartu */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#2C2A29] uppercase tracking-wider mb-2">
                Pilih Nuansa Kartu:
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('terracotta')}
                  className={`py-2 px-1 text-xs rounded-xl border text-center transition cursor-pointer ${
                    theme === 'terracotta'
                      ? 'border-[#C85A32] bg-[#C85A32] text-white font-semibold shadow-2xs'
                      : 'border-[#E8DED6] bg-[#FAF8F5] text-[#C85A32] hover:bg-[#E8DED6]/40'
                  }`}
                >
                  Terakota
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('krem')}
                  className={`py-2 px-1 text-xs rounded-xl border text-center transition cursor-pointer ${
                    theme === 'krem'
                      ? 'border-[#C85A32] bg-white text-[#2C2A29] font-semibold ring-1 ring-[#C85A32]'
                      : 'border-[#E8DED6] bg-[#FAF8F5] text-[#2C2A29] hover:bg-white'
                  }`}
                >
                  Kertas
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('sage')}
                  className={`py-2 px-1 text-xs rounded-xl border text-center transition cursor-pointer ${
                    theme === 'sage'
                      ? 'border-[#7A8B68] bg-[#7A8B68] text-white font-semibold shadow-2xs'
                      : 'border-[#E8DED6] bg-[#FAF8F5] text-[#7A8B68] hover:bg-[#7A8B68]/10'
                  }`}
                >
                  Sage
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('gelap')}
                  className={`py-2 px-1 text-xs rounded-xl border text-center transition cursor-pointer ${
                    theme === 'gelap'
                      ? 'border-[#2C2A29] bg-[#2C2A29] text-amber-200 font-semibold shadow-2xs'
                      : 'border-[#E8DED6] bg-[#FAF8F5] text-[#2C2A29] hover:bg-[#2C2A29]/10'
                  }`}
                >
                  Malam
                </button>
              </div>
            </div>

            {/* Pratinjau Gambar Kartu */}
            <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E8DED6] mb-5 flex items-center justify-center">
              {previewDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDataUrl}
                  alt="Pratinjau Kartu Kutipan"
                  className="rounded-lg max-h-[300px] w-auto shadow-2xs object-contain"
                />
              ) : (
                <div className="py-24 text-center text-xs text-[#6B625D]">
                  Merakit kartu kutipan...
                </div>
              )}
            </div>

            {/* Tombol Aksi Download & Share */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 bg-[#FFFDF9] hover:bg-[#FAF8F5] text-[#2C2A29] border border-[#E8DED6] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#C85A32]" />
                {isDownloading ? 'Menyimpan...' : 'Unduh PNG'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                disabled={isSharing}
                className="inline-flex items-center justify-center gap-2 bg-[#C85A32] hover:bg-[#A94728] text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition active:scale-[0.98] disabled:opacity-50 shadow-2xs cursor-pointer"
              >
                {shareSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Dibagikan!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    {isSharing ? 'Membuka...' : 'Kirim ke Story'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
