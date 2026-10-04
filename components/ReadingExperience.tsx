'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Type,
  Clock,
  Sparkles,
  Share2,
  CloudRain,
  Wind,
  Music,
  Feather,
  Sliders,
  Play,
  Pause,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  List,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { getAmbientSoundEngine, AmbientSoundType } from '../lib/ambient-sound';
import { generateQuoteCardCanvas, downloadQuoteCard, shareQuoteCard, CardTheme } from '../lib/quote-card';
import { isBookmarked, toggleBookmark, updateReadingProgress } from '../lib/bookmark';
import ApresiasiMikro, { ReaksiTipe } from './ApresiasiMikro';
import TafsirBaitSection, { TafsirItem } from './TafsirBaitSection';
import { formatWaktuRelatif, formatWaktuLengkap } from '../lib/date';

export interface ChapterItem {
  id: number;
  judul: string;
  nomor_bab?: number | null;
  judul_bab?: string | null;
  created_at?: string | Date;
}

interface Props {
  karyaId: number;
  judul: string;
  penulis: string;
  kategori: string;
  isiTulisan: string;
  createdAt?: string | Date;
  audioUrl?: string | null;
  totalLikes: number;
  initialReaksiCounts?: Record<string, number>;
  initialTafsirs?: TafsirItem[];
  onReactAction?: (karyaId: number, tipe: ReaksiTipe) => Promise<void>;
  onKirimTafsir?: (formData: FormData) => Promise<void>;
  nomorBab?: number | null;
  judulBab?: string | null;
  namaCerita?: string | null;
  sinopsis?: string | null;
  statusCerita?: string | null;
  siblingChapters?: ChapterItem[];
  prevChapter?: ChapterItem | null;
  nextChapter?: ChapterItem | null;
}

export default function ReadingExperience({
  karyaId,
  judul,
  penulis,
  kategori,
  isiTulisan,
  createdAt,
  audioUrl,
  initialReaksiCounts = {},
  initialTafsirs = [],
  onReactAction,
  onKirimTafsir,
  nomorBab,
  judulBab,
  namaCerita,
  sinopsis,
  statusCerita,
  siblingChapters = [],
  prevChapter = null,
  nextChapter = null,
}: Props) {
  const [showChapterList, setShowChapterList] = useState(false);
  // 1. Pengaturan Mode Baca (Sepia Kertas, Dark Malam, OLED Hitam, Terang)
  const [themeMode, setThemeMode] = useState<'sepia' | 'dark' | 'oled' | 'light'>('sepia');
  const [fontSize, setFontSize] = useState<number>(19); // Default 19px (nyaman untuk mata)
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [isZenMode, setIsZenMode] = useState(false);

  // Penanda Buku (Bookmark) & Progress Baca
  const [bookmarked, setBookmarked] = useState<boolean>(() => isBookmarked(karyaId));
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleBookmarkChange = () => {
      setBookmarked(isBookmarked(karyaId));
    };
    window.addEventListener('fadrodzak_bookmark_changed', handleBookmarkChange);
    return () => window.removeEventListener('fadrodzak_bookmark_changed', handleBookmarkChange);
  }, [karyaId]);

  // Pantau posisi scroll untuk membaca progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setReadingProgress(100);
        return;
      }
      const currentScroll = window.scrollY;
      const percent = Math.min(100, Math.max(0, Math.round((currentScroll / totalHeight) * 100)));
      setReadingProgress(percent);
      updateReadingProgress(karyaId, percent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [karyaId]);

  const handleToggleBookmark = () => {
    const res = toggleBookmark({
      id: karyaId,
      judul,
      penulis,
      kategori,
      nomor_bab: nomorBab,
      judul_bab: judulBab,
      nama_cerita: namaCerita,
      progressPercent: readingProgress,
      url: `/karya/${karyaId}`,
    });
    setBookmarked(res);
  };

  // 2. Ambient Sound State
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientType, setAmbientType] = useState<AmbientSoundType>('rain');
  const [volume, setVolume] = useState<number>(0.4);
  const [showAmbientMenu, setShowAmbientMenu] = useState(false);

  // 3. Audio Voice Note (Pembacaan Puisi)
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // 4. Highlight & Quote Selection
  const [selectedText, setSelectedText] = useState('');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [cardTheme, setCardTheme] = useState<CardTheme>('terracotta');
  const [quotePreviewUrl, setQuotePreviewUrl] = useState<string | null>(null);

  // Estimasi Waktu Baca
  const trimmed = isiTulisan?.trim() || '';
  const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 180));

  // Parsing Bait / Paragraf
  const baitArray = isiTulisan
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  // Efek ambient sound
  useEffect(() => {
    const engine = getAmbientSoundEngine();
    if (isAmbientPlaying) {
      engine.play(ambientType);
      engine.setVolume(volume);
    } else {
      engine.stop();
    }
    return () => {
      engine.stop();
    };
  }, [isAmbientPlaying, ambientType, volume]);

  // Listener Seleksi Kalimat Favorit
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTooltipPos(null);
        return;
      }
      const text = selection.toString().trim();
      if (text.length >= 6) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 12 + window.scrollY,
        });
      } else {
        setTooltipPos(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  // Update Preview Kartu Kutipan
  useEffect(() => {
    if (!showQuoteModal) return;
    let cancelled = false;

    generateQuoteCardCanvas({
      judul,
      kutipan: selectedText || isiTulisan.slice(0, 200),
      penulis,
      kategori,
      theme: cardTheme,
    }).then((canvas) => {
      if (!cancelled) {
        setQuotePreviewUrl(canvas.toDataURL('image/png'));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showQuoteModal, cardTheme, selectedText, isiTulisan, judul, penulis, kategori]);

  const toggleVoiceNote = () => {
    if (!voiceAudioRef.current) return;
    if (isVoicePlaying) {
      voiceAudioRef.current.pause();
      setIsVoicePlaying(false);
    } else {
      voiceAudioRef.current.play();
      setIsVoicePlaying(true);
    }
  };

  // Konfigurasi Tema Desain Premium & Kontras Nyaman
  const isDark = themeMode === 'dark' || themeMode === 'oled';

  const pageThemeClasses = {
    sepia: 'bg-[#F5EFEB] text-[#282523]',
    dark: 'bg-[#121110] text-[#E6DFD5]',
    oled: 'bg-[#000000] text-[#EDEDED]',
    light: 'bg-[#FBF9F6] text-[#222222]',
  };

  const articleCardClasses = {
    sepia: 'bg-[#FFFDF8] border-[#DFCFC1] shadow-[0_2px_14px_rgba(40,37,35,0.04)]',
    dark: 'bg-[#1A1918] border-[#2E2B28] shadow-[0_4px_24px_rgba(0,0,0,0.45)]',
    oled: 'bg-[#0A0A0A] border-[#1F1F1F] shadow-none',
    light: 'bg-[#FFFFFF] border-[#E8E4DF] shadow-[0_2px_14px_rgba(0,0,0,0.03)]',
  };

  const toolbarClasses = {
    sepia: 'bg-[#F5EFEB]/90 border-[#DFCFC1] text-[#635B54]',
    dark: 'bg-[#121110]/95 border-[#2E2B28] text-[#A39B92]',
    oled: 'bg-black/95 border-[#1F1F1F] text-[#888888]',
    light: 'bg-[#FBF9F6]/90 border-[#E8E4DF] text-[#666666]',
  };

  const controlButtonClasses = {
    sepia: 'bg-[#FAF6F0] border-[#DECBC0] text-[#4A433E] hover:border-[#C85A32]',
    dark: 'bg-[#1E1C1A] border-[#332F2B] text-[#D1C9BE] hover:border-[#E27E5A]',
    oled: 'bg-[#141414] border-[#262626] text-[#CCCCCC] hover:border-[#E27E5A]',
    light: 'bg-[#F3EFEA] border-[#E0D8CE] text-[#333333] hover:border-[#C85A32]',
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isZenMode
          ? `fixed inset-0 z-50 overflow-y-auto p-4 sm:p-10 ${pageThemeClasses[themeMode]}`
          : pageThemeClasses[themeMode]
      }`}
    >
      {/* Tooltip Mengambang: Buat Kartu Kutipan saat teks diblok */}
      {tooltipPos && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 pointer-events-auto"
        >
          <button
            type="button"
            onClick={() => {
              setShowQuoteModal(true);
              setTooltipPos(null);
            }}
            className="flex items-center gap-1.5 bg-[#C85A32] text-white px-3.5 py-1.5 rounded-full text-xs font-serif font-bold shadow-lg hover:bg-[#A94728] transition active:scale-95 animate-in fade-in zoom-in duration-150 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Jadikan Kartu Kutipan
          </button>
        </div>
      )}

      {/* Bar Indikator Kemajuan Membaca */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50 pointer-events-none">
        <div
          className="h-full bg-[#C85A32] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Toolbar Pengalaman Membaca (Tampil Tenang, Elegan, & Konsisten) */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-md border-b py-2.5 px-4 mb-6 transition-colors ${toolbarClasses[themeMode]}`}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
          {/* Info Waktu Baca & Persentase */}
          <div className="flex items-center gap-2">
            <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'}`} />
            <span>
              Waktu baca: <strong className={isDark ? 'text-[#F5EFEB]' : 'text-[#1A1817]'}>~{estimatedReadingTime} menit</strong> ({wordCount} kata)
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              isDark ? 'bg-[#E27E5A]/20 text-[#E27E5A]' : 'bg-[#C85A32]/10 text-[#C85A32]'
            }`}>
              {readingProgress}%
            </span>
          </div>

          {/* Opsi Kontrol Membaca */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tombol Rak Buku */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-serif transition cursor-pointer ${
                bookmarked
                  ? (isDark ? 'border-[#E27E5A] bg-[#E27E5A]/15 text-[#E27E5A] font-bold' : 'border-[#C85A32] bg-[#FAF0E6] text-[#C85A32] font-bold')
                  : controlButtonClasses[themeMode]
              }`}
              title={bookmarked ? 'Karya tersimpan di Rak Bacaan' : 'Simpan ke Rak Bacaan Pribadi'}
            >
              {bookmarked ? (
                <BookmarkCheck className={`w-3.5 h-3.5 ${isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'}`} />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{bookmarked ? 'Di Rak' : 'Simpan'}</span>
            </button>

            {/* Suasana Audio Latar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAmbientMenu(!showAmbientMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                  isAmbientPlaying
                    ? (isDark ? 'border-[#E27E5A] bg-[#E27E5A]/20 text-[#E27E5A] font-bold' : 'border-[#C85A32] bg-[#FAF0E6] text-[#C85A32] font-bold')
                    : controlButtonClasses[themeMode]
                }`}
                title="Atur suara latar suasana sastra"
              >
                {isAmbientPlaying ? (
                  <Volume2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'} animate-pulse`} />
                ) : (
                  <VolumeX className="w-3.5 h-3.5" />
                )}
                <span>Suasana</span>
              </button>

              {showAmbientMenu && (
                <div className={`absolute right-0 mt-2 w-60 rounded-2xl border p-3.5 shadow-xl z-50 text-xs ${
                  isDark ? 'bg-[#1E1C1A] border-[#38332E] text-[#DDD5CA]' : 'bg-[#FFFDF8] border-[#DFCFC1] text-[#2C2A29]'
                }`}>
                  <div className={`flex items-center justify-between pb-2 border-b mb-2.5 font-bold ${
                    isDark ? 'border-[#332F2B] text-[#F9F6F0]' : 'border-[#EAE0D5] text-[#1A1817]'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <Music className={`w-3.5 h-3.5 ${isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'}`} />
                      Suara Latar Imersif
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAmbientPlaying(!isAmbientPlaying)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold cursor-pointer ${
                        isAmbientPlaying
                          ? 'bg-red-500 text-white'
                          : (isDark ? 'bg-[#E27E5A] text-white' : 'bg-[#C85A32] text-white')
                      }`}
                    >
                      {isAmbientPlaying ? 'Matikan' : 'Putar'}
                    </button>
                  </div>

                  <div className="space-y-1 mb-3">
                    {[
                      { type: 'rain', label: 'Rintik Hujan di Daun', icon: CloudRain },
                      { type: 'wind', label: 'Desau Angin Lembut', icon: Wind },
                      { type: 'quill', label: 'Goresan Pena di Kertas', icon: Feather },
                      { type: 'harp', label: 'Petikan Dawai Santai', icon: Music },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setAmbientType(item.type as AmbientSoundType);
                          setIsAmbientPlaying(true);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                          ambientType === item.type
                            ? (isDark ? 'bg-[#E27E5A]/20 text-[#E27E5A] font-bold' : 'bg-[#FAF0E6] text-[#C85A32] font-bold')
                            : (isDark ? 'hover:bg-[#2A2724] text-[#B0A79C]' : 'hover:bg-[#FAF6F0] text-[#635B54]')
                        }`}
                      >
                        <item.icon className={`w-3 h-3 ${isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'}`} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className={`pt-2 border-t ${isDark ? 'border-[#332F2B]' : 'border-[#EAE0D5]'}`}>
                    <div className="flex items-center justify-between text-[10px] opacity-75 mb-1">
                      <span>Volume</span>
                      <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-[#C85A32] h-1.5 bg-gray-300 dark:bg-stone-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pemilihan Tema Nuansa Baca (Pill Segmented) */}
            <div className={`flex items-center border rounded-xl p-0.5 ${controlButtonClasses[themeMode]}`}>
              <button
                type="button"
                onClick={() => setThemeMode('sepia')}
                className={`px-2 py-1 rounded-lg text-xs font-serif transition cursor-pointer ${
                  themeMode === 'sepia'
                    ? 'bg-[#C85A32] text-white font-bold shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Nuansa Kertas Buku Hangat"
              >
                Kertas
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`px-2 py-1 rounded-lg text-xs font-serif transition cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-[#E27E5A] text-white font-bold shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Mode Malam Elegan (Abu Arang)"
              >
                Malam
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('oled')}
                className={`px-2 py-1 rounded-lg text-xs font-serif transition cursor-pointer ${
                  themeMode === 'oled'
                    ? 'bg-black text-[#E27E5A] font-bold border border-[#333]'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Mode OLED Hitam Pekat (Hemat Daya)"
              >
                OLED
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`px-2 py-1 rounded-lg text-xs font-serif transition cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-white text-[#1A1817] font-bold shadow-2xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
                title="Mode Terang Bersih"
              >
                Terang
              </button>
            </div>

            {/* Kontrol Ukuran Font */}
            <div className={`flex items-center border rounded-xl p-0.5 ${controlButtonClasses[themeMode]}`}>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.max(16, f - 2))}
                className="px-2 py-1 text-xs font-bold opacity-75 hover:opacity-100 cursor-pointer"
                title="Kecilkan Font"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize(19)}
                className="px-1.5 py-1 text-[11px] opacity-75 hover:opacity-100 cursor-pointer"
                title="Reset Ukuran Nyaman (19px)"
              >
                <Type className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.min(27, f + 2))}
                className="px-2 py-1 text-xs font-bold opacity-75 hover:opacity-100 cursor-pointer"
                title="Besarkan Font"
              >
                A+
              </button>
            </div>

            {/* Ganti Serif / Sans */}
            <button
              type="button"
              onClick={() => setFontFamily((prev) => (prev === 'serif' ? 'sans' : 'serif'))}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${controlButtonClasses[themeMode]}`}
              title="Ganti jenis huruf sastra (Serif) / modern (Sans)"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Zen Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsZenMode(!isZenMode)}
              className={`p-1.5 rounded-xl border transition cursor-pointer ${controlButtonClasses[themeMode]}`}
              title={isZenMode ? 'Keluar Mode Zen' : 'Masuk Mode Zen Imersif'}
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Kontainer Utama Bacaan (Lebar Ideal Naskah Sastra) */}
      <div id="naskah-bacaan" className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 scroll-mt-6">
        <article
          className={`p-6 sm:p-12 rounded-3xl border transition-all ${articleCardClasses[themeMode]}`}
        >
          {/* Header Karya */}
          <div className="mb-8 pb-7 border-b transition-colors border-current/10">
            {/* Kategori & Status Badge */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className={`text-xs font-bold tracking-wider uppercase font-sans ${
                isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'
              }`}>
                {kategori === 'Novel' || kategori === 'Cerita Bersambung'
                  ? 'Novel & Cerita Bersambung'
                  : kategori}
              </span>
              {nomorBab && (
                <span className={`text-xs font-serif font-bold px-2.5 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-[#22201E] text-[#E27E5A] border-[#3D3833]'
                    : 'bg-[#FAF0E6] text-[#C85A32] border-[#E8DEC0]'
                }`}>
                  Bab {nomorBab}
                </span>
              )}
              {statusCerita && (
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-md font-serif font-medium border ${
                    statusCerita.toLowerCase() === 'tamat'
                      ? (isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-800 border-emerald-200')
                      : (isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-800 border-amber-200')
                  }`}
                >
                  {statusCerita.toLowerCase() === 'tamat' ? 'Tamat' : 'Ongoing'}
                </span>
              )}
            </div>

            {namaCerita && namaCerita !== judul && (
              <p className={`text-xs font-serif font-bold uppercase tracking-wider mb-2 ${
                isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'
              }`}>
                Seri: {namaCerita}
              </p>
            )}

            {/* Judul Utama Artikel (Sangat Menonjol & Megah) */}
            <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.15] mb-3 ${
              isDark ? 'text-[#F9F6F0]' : 'text-[#1A1817]'
            }`}>
              {judul}
            </h1>

            {judulBab && (
              <p className={`text-lg sm:text-xl font-serif italic mb-4 font-medium ${
                isDark ? 'text-[#D5CCC0]' : 'text-[#5C544F]'
              }`}>
                {judulBab}
              </p>
            )}

            {/* Metadata Penulis & Waktu */}
            <div className={`flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-serif pt-3 border-t transition-colors ${
              isDark ? 'border-[#2E2B28] text-[#A39B92]' : 'border-[#EAE0D5] text-[#6B625D]'
            }`}>
              <span>
                Ditulis oleh <strong className={`font-semibold ${isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'}`}>{penulis}</strong>
              </span>
              {createdAt && (
                <>
                  <span className="opacity-40">•</span>
                  <time
                    dateTime={new Date(createdAt).toISOString()}
                    className={isDark ? 'text-[#8E867E]' : 'text-[#8A8179]'}
                    title={formatWaktuLengkap(createdAt)}
                  >
                    {formatWaktuRelatif(createdAt)}
                  </time>
                </>
              )}
            </div>

            {/* Sinopsis Cerita / Blurb (Didesain Ulang: Sangat Jelas & Nyaman Terbaca) */}
            {sinopsis && (
              <div className={`mt-6 p-5 sm:p-6 rounded-2xl border transition-colors ${
                isDark
                  ? 'bg-[#22201E] border-[#38332E] text-[#DDD5CA]'
                  : 'bg-[#F7F2EB] border-[#DFCFC1] text-[#282523]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Feather className={`w-3.5 h-3.5 ${isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'}`} />
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-sans ${
                    isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'
                  }`}>
                    Sinopsis &amp; Intisari Karya
                  </span>
                </div>
                <p className={`font-serif text-sm sm:text-base leading-relaxed italic ${
                  isDark ? 'text-[#E6DFD5]' : 'text-[#2D2A28]'
                }`}>
                  &ldquo;{sinopsis}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Pemutar Audio Puisi oleh Penulis */}
          {audioUrl && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
              isDark
                ? 'bg-[#22201E] border-[#38332E]'
                : 'bg-[#FAF0E6] border-[#E8DACB]'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleVoiceNote}
                  className={`w-10 h-10 rounded-full text-white flex items-center justify-center hover:scale-105 transition shadow-sm cursor-pointer ${
                    isDark ? 'bg-[#E27E5A] hover:bg-[#C85A32]' : 'bg-[#C45A2C] hover:bg-[#A8451D]'
                  }`}
                >
                  {isVoicePlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <p className={`font-serif font-bold text-xs ${isDark ? 'text-[#F9F6F0]' : 'text-[#2C2C2C]'}`}>
                    Dengarkan Pembacaan Puisi
                  </p>
                  <p className={`text-[11px] font-serif ${isDark ? 'text-[#A39B92]' : 'text-[#7A6B63]'}`}>
                    Dibacakan langsung oleh {penulis}
                  </p>
                </div>
              </div>
              <audio
                ref={voiceAudioRef}
                src={audioUrl}
                onEnded={() => setIsVoicePlaying(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Isi Naskah Karya Sastra dengan Tafsir Bait */}
          <div
            className={`transition-all ${fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {baitArray.map((bait, idx) => {
              const baitTafsirs = initialTafsirs.filter((t) => t.bait_index === idx);
              return (
                <div key={idx} className="relative mb-7 sm:mb-9">
                  <p
                    className={`whitespace-pre-wrap select-text leading-[1.85] sm:leading-[1.95] tracking-[0.01em] ${
                      isDark ? 'text-[#E6DFD5]' : 'text-[#282523]'
                    }`}
                  >
                    {bait}
                  </p>

                  {/* Komponen Tafsir Bait Per Baris / Paragraf */}
                  <TafsirBaitSection
                    karyaId={karyaId}
                    baitIndex={idx}
                    potonganBait={bait}
                    initialTafsirs={baitTafsirs}
                    onKirimTafsir={onKirimTafsir}
                  />
                </div>
              );
            })}
          </div>

          {/* Apresiasi Mikro Khas Sastra */}
          <ApresiasiMikro
            karyaId={karyaId}
            initialCounts={initialReaksiCounts}
            onReactAction={onReactAction}
          />

          {/* Tombol Buat Kartu Kutipan Manual */}
          <div className={`pt-4 flex items-center justify-between gap-3 text-xs font-serif border-t ${
            isDark ? 'border-[#2E2B28] text-[#8E867E]' : 'border-[#EAE0D5] text-[#8E8E8E]'
          }`}>
            <span className="italic">
              Sorot kalimat mana saja untuk menjadikannya kartu kutipan.
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedText(isiTulisan.slice(0, 180));
                setShowQuoteModal(true);
              }}
              className={`inline-flex items-center gap-1.5 font-bold cursor-pointer transition ${
                isDark ? 'text-[#E27E5A] hover:text-[#F09472]' : 'text-[#C85A32] hover:text-[#A94728]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Bagikan Kartu Kutipan
            </button>
          </div>

          {/* Navigasi Bab Wattpad */}
          {(prevChapter || nextChapter || (siblingChapters && siblingChapters.length > 1)) && (
            <div className={`mt-8 pt-6 border-t space-y-4 ${
              isDark ? 'border-[#2E2B28]' : 'border-[#E8DEC0]/80'
            }`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                {prevChapter ? (
                  <Link
                    href={`/karya/${prevChapter.id}`}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-serif font-bold transition shadow-2xs ${
                      isDark
                        ? 'border-[#332F2B] bg-[#1E1C1A] text-[#E27E5A] hover:border-[#E27E5A]'
                        : 'border-[#DECBC0] bg-white text-[#C85A32] hover:border-[#C85A32] hover:bg-[#FAF0E6]'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Bab {prevChapter.nomor_bab || 'Sebelumnya'}
                  </Link>
                ) : (
                  <span className={`text-xs font-serif italic ${isDark ? 'text-[#6E665E]' : 'text-[#9E8E84]'}`}>
                    Bab Pertama
                  </span>
                )}

                {siblingChapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowChapterList(!showChapterList)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-serif font-bold transition cursor-pointer ${
                      isDark
                        ? 'border-[#332F2B] bg-[#1E1C1A] text-[#B0A79C] hover:text-[#E27E5A]'
                        : 'border-[#DECBC0] bg-white text-[#7A6B63] hover:text-[#C85A32] hover:bg-[#FAF0E6]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Daftar Bab ({siblingChapters.length})
                  </button>
                )}

                {nextChapter ? (
                  <Link
                    href={`/karya/${nextChapter.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C85A32] text-white hover:bg-[#A94728] text-xs font-serif font-bold transition shadow-xs"
                  >
                    Bab {nextChapter.nomor_bab || 'Selanjutnya'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className={`text-xs font-serif italic ${isDark ? 'text-[#6E665E]' : 'text-[#9E8E84]'}`}>
                    {statusCerita === 'Tamat' ? '✓ Cerita Tamat' : 'Menunggu bab berikutnya...'}
                  </span>
                )}
              </div>

              {/* Accordion Daftar Isi Seluruh Bab */}
              {showChapterList && siblingChapters.length > 0 && (
                <div className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                  isDark ? 'bg-[#1E1C1A] border-[#38332E]' : 'bg-[#FAF7F2] border-[#E8DEC0]'
                }`}>
                  <h4 className={`font-serif font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                    isDark ? 'text-[#E27E5A]' : 'text-[#C85A32]'
                  }`}>
                    <BookOpen className="w-4 h-4" />
                    Daftar Isi Bab ({namaCerita || judul})
                  </h4>
                  <div className={`divide-y max-h-60 overflow-y-auto ${
                    isDark ? 'divide-[#2A2724]' : 'divide-[#E8DEC0]/60'
                  }`}>
                    {siblingChapters.map((ch) => {
                      const isCurrent = ch.id === karyaId;
                      return (
                        <Link
                          key={ch.id}
                          href={`/karya/${ch.id}`}
                          className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-serif transition ${
                            isCurrent
                              ? (isDark ? 'bg-[#E27E5A]/20 font-bold text-[#E27E5A]' : 'bg-[#FAF0E6] font-bold text-[#C85A32]')
                              : (isDark ? 'hover:bg-[#2A2724] text-[#B0A79C]' : 'hover:bg-white text-[#4A423D] hover:text-[#C85A32]')
                          }`}
                        >
                          <span className="truncate mr-2">
                            Bab {ch.nomor_bab || '—'}: {ch.judul_bab || ch.judul}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-[#C85A32] text-white px-2 py-0.5 rounded-full shrink-0">
                              Sedang Dibaca
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </article>
      </div>

      {/* Modal Generator Kartu Kutipan */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFDF8] rounded-3xl max-w-md w-full p-6 border border-[#DFCFC1] shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE0D5] mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1A1817]">
                  Kartu Kutipan Karya
                </h3>
                <p className="text-xs text-[#6B625D]">
                  Bagikan ke Instagram / WhatsApp
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-sm font-bold text-[#555] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Pilihan Tema */}
            <div className="mb-4">
              <label className="block text-xs font-serif font-bold text-[#5C544F] uppercase tracking-wider mb-2">
                Pilih Nuansa Kartu:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'terracotta', label: 'Terakota' },
                  { id: 'krem', label: 'Kertas' },
                  { id: 'sage', label: 'Sage' },
                  { id: 'gelap', label: 'Malam' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setCardTheme(th.id as CardTheme)}
                    className={`py-2 px-1 text-xs font-serif rounded-xl border text-center transition cursor-pointer ${
                      cardTheme === th.id
                        ? 'border-[#C85A32] bg-[#C85A32] text-white font-bold ring-2 ring-[#C85A32]/20'
                        : 'border-[#DFCFC1] bg-white text-[#555] hover:bg-[#FAF0E6]'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pratinjau Gambar Kartu */}
            <div className="bg-[#FAF6F0] p-2 rounded-2xl border border-[#DFCFC1] mb-5 flex items-center justify-center">
              {quotePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={quotePreviewUrl}
                  alt="Pratinjau Kartu Kutipan"
                  className="rounded-xl max-h-[300px] w-auto shadow-md object-contain"
                />
              ) : (
                <div className="py-20 text-xs text-[#8A796E] font-serif">
                  Merakit kartu kutipan...
                </div>
              )}
            </div>

            {/* Tombol Unduh & Share */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  downloadQuoteCard(
                    {
                      judul,
                      kutipan: selectedText || isiTulisan.slice(0, 200),
                      penulis,
                      kategori,
                      theme: cardTheme,
                    },
                    `kutipan-${judul.toLowerCase().replace(/\s+/g, '-')}.png`
                  )
                }
                className="py-2.5 px-4 rounded-xl bg-white border border-[#DECBC0] font-serif text-xs sm:text-sm font-semibold text-[#1A1817] hover:bg-[#FAF6F0] transition cursor-pointer"
              >
                Unduh PNG
              </button>

              <button
                type="button"
                onClick={() =>
                  shareQuoteCard({
                    judul,
                    kutipan: selectedText || isiTulisan.slice(0, 200),
                    penulis,
                    kategori,
                    theme: cardTheme,
                  })
                }
                className="py-2.5 px-4 rounded-xl bg-[#C85A32] text-white font-serif text-xs sm:text-sm font-semibold hover:bg-[#A94728] transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Kirim ke Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
