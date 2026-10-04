'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award, Sparkles, ArrowRight, Clock, User } from 'lucide-react';
import BedahKaryaSection from '../../components/BedahKaryaSection';
import { BedahKaryaItem } from '../../lib/db';

interface TutorialItem {
  id: number;
  judul: string;
  kategori: string;
  isi_materi: string;
  penulis: string;
  waktu_baca: string;
  created_at: Date;
}

interface Props {
  tutorials: TutorialItem[];
  bedahList: BedahKaryaItem[];
  initialTab?: 'materi' | 'bedah';
}

export default function BelajarTabsClient({
  tutorials = [],
  bedahList = [],
  initialTab = 'bedah',
}: Props) {
  const [activeTab, setActiveTab] = useState<'materi' | 'bedah'>(initialTab);

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex border-b border-[#E8DED6] mb-8 max-w-md mx-auto justify-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('bedah')}
          className={`pb-3 text-sm font-medium flex items-center justify-center gap-2 transition relative cursor-pointer ${
            activeTab === 'bedah'
              ? 'text-[#C85A32] font-semibold'
              : 'text-[#6B625D] hover:text-[#2C2A29]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Bedah Karya Mingguan</span>
          {activeTab === 'bedah' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C85A32]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('materi')}
          className={`pb-3 text-sm font-medium flex items-center justify-center gap-2 transition relative cursor-pointer ${
            activeTab === 'materi'
              ? 'text-[#C85A32] font-semibold'
              : 'text-[#6B625D] hover:text-[#2C2A29]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Materi &amp; Tuntunan</span>
          {activeTab === 'materi' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C85A32]" />
          )}
        </button>
      </div>

      {/* Konten Tab Aktif */}
      {activeTab === 'bedah' ? (
        <BedahKaryaSection bedahList={bedahList} />
      ) : (
        <div className="space-y-4">
          <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E8DED6] shadow-2xs mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#C85A32]" />
              <h3 className="font-serif font-bold text-base text-[#2C2A29]">
                Tuntunan &amp; Pedoman Penulisan Sastra
              </h3>
            </div>
            <p className="text-xs text-[#6B625D] leading-relaxed">
              Kumpulan materi fundamental untuk mengasah daya bahasa, penulisan puisi, cerpen, serta analisis sastra dari mentor dan redaksi Fadrodzak.
            </p>
          </div>

          {tutorials.length === 0 ? (
            <p className="text-center text-[#6B625D] italic py-12">
              Belum ada materi pelajaran yang diunggah.
            </p>
          ) : (
            tutorials.map((item) => (
              <article
                key={item.id}
                className="bg-[#FFFDF9] p-5 sm:p-6 rounded-2xl shadow-2xs border border-[#E8DED6] transition hover:border-[#C85A32]/40"
              >
                <div className="flex items-center justify-between text-xs text-[#6B625D] mb-2">
                  <span className="bg-[#FAF8F5] text-[#C85A32] border border-[#E8DED6] px-2 py-0.5 rounded-lg font-semibold text-[10px] uppercase tracking-wider">
                    {item.kategori}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#6B625D]">
                      <Clock className="w-3 h-3 text-[#C85A32]" />
                      {item.waktu_baca}
                    </span>
                    <span className="flex items-center gap-1 text-[#6B625D]">
                      <User className="w-3 h-3 text-[#6B625D]" />
                      {item.penulis}
                    </span>
                  </div>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2 text-[#2C2A29] leading-snug">
                  {item.judul}
                </h3>

                <p className="text-xs sm:text-sm text-[#45413E] leading-relaxed line-clamp-3 mb-4">
                  {item.isi_materi}
                </p>

                <div className="pt-3 border-t border-[#E8DED6] flex items-center justify-between">
                  <Link
                    href={`/belajar/${item.id}`}
                    className="text-[#C85A32] text-xs font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Pelajari Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
