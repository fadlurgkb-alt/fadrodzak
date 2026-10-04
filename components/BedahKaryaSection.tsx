'use client';

import { useState } from 'react';
import { Award, Feather, Sparkles, Send, CheckCircle2, Star, Music, Compass } from 'lucide-react';
import { BedahKaryaItem } from '../lib/db';

interface Props {
  bedahList: BedahKaryaItem[];
}

export default function BedahKaryaSection({ bedahList = [] }: Props) {
  const [selectedItem, setSelectedItem] = useState<BedahKaryaItem>(
    bedahList[0] || {
      id: 1,
      judul: 'Senja di Tepian Kali Porong',
      penulis_karya: 'Fadrodzak',
      kategori: 'Puisi',
      kutipan_karya:
        'Adakah yang lebih tabah dari batu karang, menyaksikan arus pulang saat petang datang menjelang?',
      mentor_nama: 'Dra. Siti Wardani, M.Hum',
      mentor_gelar: 'Pengasuh Bengkel Sastra & Kurator Senior',
      minggu_ke: 'Pekan IV - September 2026',
      ulasan_diksi:
        'Diksi yang dipilih hemat namun tajam. Pemilihan kata "merapuh", "saga", dan "arus pulang" saling bertaut membangun suasana nostalgik tanpa terperosok ke dalam kecengengan klise.',
      ulasan_rima:
        'Asosiasi bunyi vokal terbuka /a/ pada bait awal memberi kesan luasnya bentangan cakrawala senja, lalu ditutup dengan konsonan berat yang memberi ketegasan batin.',
      ulasan_rasa:
        'Rasa sunyi yang dialirkan sangat kontemplatif. Pembaca diajak menjadi pengamat yang hening di tepi sungai, bukan sekadar penonton pasif.',
      ulasan_pesan:
        'Ketabahan menghadapi perpisahan dan roda waktu yang tak bisa dibendung. Sebuah karya muda yang matang dan bernas.',
      kesimpulan:
        'Sangat direkomendasikan untuk dibaca berulang. Kerapian rima dan kejernihan citraan indrawi layak menjadi teladan bagi penulis pemula.',
      rating_apresiasi: 5,
      created_at: new Date(),
    }
  );

  const [ajukanJudul, setAjukanJudul] = useState('');
  const [ajukanPenulis, setAjukanPenulis] = useState('');
  const [ajukanAlasan, setAjukanAlasan] = useState('');
  const [sudahDiajukan, setSudahDiajukan] = useState(false);

  const handleAjukanKarya = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ajukanJudul.trim()) return;
    setSudahDiajukan(true);
    setAjukanJudul('');
    setAjukanPenulis('');
    setAjukanAlasan('');
    setTimeout(() => setSudahDiajukan(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bedah Karya */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#E8DED6] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#E8DED6] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C85A32] text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                Edisi Mingguan
              </span>
              <span className="text-xs text-[#6B625D] font-semibold">
                {selectedItem.minggu_ke}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2A29]">
              Bedah Karya Sastra Pilihan
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#6B625D] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8DED6]">
            <Award className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Kurator &amp; Mentor Senior</span>
          </div>
        </div>

        {bedahList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {bedahList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className={`px-3 py-1.5 rounded-xl text-xs transition whitespace-nowrap cursor-pointer ${
                  selectedItem.id === item.id
                    ? 'bg-[#C85A32] text-white font-medium'
                    : 'bg-[#FAF8F5] border border-[#E8DED6] text-[#6B625D] hover:border-[#C85A32]/40'
                }`}
              >
                {item.minggu_ke}: {item.judul}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs sm:text-sm text-[#6B625D] leading-relaxed">
          Setiap akhir pekan, satu karya anggota komunitas dipilih untuk dibedah secara santun,
          konstruktif, dan mendalam. Tempat terbaik bagi penulis pemula untuk bertumbuh dan
          mengasah kepekaan kata.
        </p>
      </div>

      {/* Kartu Telaah Mentor */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-7 border border-[#E8DED6] shadow-2xs">
        {/* Header Karya yang Dibedah */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8DED6] pb-4 mb-5">
          <div>
            <span className="text-xs font-semibold text-[#C85A32] uppercase tracking-wider">
              Karya Anggota Terpilih:
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2C2A29] mt-0.5">
              &ldquo;{selectedItem.judul}&rdquo;
            </h3>
            <p className="text-xs text-[#6B625D] mt-0.5">
              Penulis: <strong className="text-[#2C2A29]">{selectedItem.penulis_karya}</strong> ({selectedItem.kategori})
            </p>
          </div>

          {/* Profil Mentor */}
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8DED6] flex items-center gap-3 self-start">
            <div className="w-9 h-9 rounded-full bg-[#FFFDF9] text-[#C85A32] border border-[#E8DED6] flex items-center justify-center font-serif font-bold text-xs">
              SW
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C2A29]">
                {selectedItem.mentor_nama}
              </p>
              <p className="text-[11px] text-[#6B625D]">
                {selectedItem.mentor_gelar}
              </p>
            </div>
          </div>
        </div>

        {/* Kutipan Bait Utama yang Dibedah */}
        <div className="bg-[#FAF8F5] p-4 rounded-r-xl border-l-2 border-[#C85A32] mb-6 italic font-serif text-[#45413E] text-sm sm:text-base leading-relaxed">
          &ldquo;{selectedItem.kutipan_karya}&rdquo;
        </div>

        {/* 4 Pilar Analisis Sastra */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          {/* Pilar 1: Diksi */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DED6]">
            <div className="flex items-center gap-2 mb-1.5">
              <Feather className="w-3.5 h-3.5 text-[#C85A32]" />
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C2A29]">
                1. Diksi &amp; Pilihan Kata
              </h4>
            </div>
            <p className="text-xs text-[#6B625D] leading-relaxed">
              {selectedItem.ulasan_diksi}
            </p>
          </div>

          {/* Pilar 2: Rima & Matra */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DED6]">
            <div className="flex items-center gap-2 mb-1.5">
              <Music className="w-3.5 h-3.5 text-[#C85A32]" />
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C2A29]">
                2. Rima &amp; Matra Bait
              </h4>
            </div>
            <p className="text-xs text-[#6B625D] leading-relaxed">
              {selectedItem.ulasan_rima}
            </p>
          </div>

          {/* Pilar 3: Rasa & Suasana */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DED6]">
            <div className="flex items-center gap-2 mb-1.5">
              <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C2A29]">
                3. Kedalaman Rasa &amp; Atmosfer
              </h4>
            </div>
            <p className="text-xs text-[#6B625D] leading-relaxed">
              {selectedItem.ulasan_rasa}
            </p>
          </div>

          {/* Pilar 4: Pesan Filosofis */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DED6]">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C2A29]">
                4. Refleksi &amp; Makna Tersirat
              </h4>
            </div>
            <p className="text-xs text-[#6B625D] leading-relaxed">
              {selectedItem.ulasan_pesan}
            </p>
          </div>
        </div>

        {/* Kesimpulan & Rating Apresiasi Mentor */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8DED6]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#C85A32] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              Catatan Penutup Guru Sastra:
            </span>
            <div className="flex items-center gap-0.5 text-[#C85A32]">
              {[...Array(selectedItem.rating_apresiasi || 5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#45413E] leading-relaxed">
            {selectedItem.kesimpulan}
          </p>
        </div>
      </div>

      {/* Formulir Ajukan Karya */}
      <div className="bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 border border-[#E8DED6] shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <Feather className="w-4 h-4 text-[#C85A32]" />
          <h3 className="font-serif font-bold text-base text-[#2C2A29]">
            Ingin Karyamu Dibedah Pekan Depan?
          </h3>
        </div>
        <p className="text-xs text-[#6B625D] mb-4 leading-relaxed">
          Redaksi dan Mentor memilih satu karya dari kiriman anggota tiap Jumat. Kirimkan judul karyamu yang sudah terbit di Fadrodzak.
        </p>

        {sudahDiajukan ? (
          <div className="bg-[#7A8B68]/10 text-[#7A8B68] p-3.5 rounded-xl border border-[#7A8B68]/30 flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#7A8B68] shrink-0" />
            <span>Terima kasih! Karyamu telah masuk dalam daftar kurasi telaah sastra pekan depan.</span>
          </div>
        ) : (
          <form onSubmit={handleAjukanKarya} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={ajukanJudul}
                onChange={(e) => setAjukanJudul(e.target.value)}
                placeholder="Judul Karyamu yang sudah terbit..."
                className="w-full text-xs rounded-xl border border-[#E8DED6] px-3.5 py-2 outline-none focus:border-[#C85A32] bg-[#FAF8F5] text-[#2C2A29] placeholder-[#6B625D]/60"
              />
              <input
                type="text"
                required
                value={ajukanPenulis}
                onChange={(e) => setAjukanPenulis(e.target.value)}
                placeholder="Nama Pena Anda..."
                className="w-full text-xs rounded-xl border border-[#E8DED6] px-3.5 py-2 outline-none focus:border-[#C85A32] bg-[#FAF8F5] text-[#2C2A29] placeholder-[#6B625D]/60"
              />
            </div>
            <textarea
              rows={2}
              value={ajukanAlasan}
              onChange={(e) => setAjukanAlasan(e.target.value)}
              placeholder="Catatan kecil / bagian bait yang ingin mendapatkan masukan..."
              className="w-full text-xs rounded-xl border border-[#E8DED6] px-3.5 py-2 outline-none focus:border-[#C85A32] bg-[#FAF8F5] text-[#2C2A29] placeholder-[#6B625D]/60 resize-y"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C85A32] hover:bg-[#A94728] text-white text-xs font-medium shadow-2xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ajukan Telaah</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
