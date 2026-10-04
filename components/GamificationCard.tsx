import {
  getLevelInfo,
} from '../lib/gamification';
import { Star, Shield, BookOpen, Coffee, Award } from 'lucide-react';

type Props = {
  xp: number;
  role?: string;
  isDonatur?: boolean;
  reputasi?: number;
  badges?: unknown[];
};

export default function GamificationCard({
  xp = 0,
  role = 'user',
  isDonatur = false,
  reputasi = 0,
}: Props) {
  const safeXp = typeof xp === 'number' && !isNaN(xp) ? Math.max(0, xp) : 0;
  const safeReputasi = typeof reputasi === 'number' && !isNaN(reputasi) ? Math.max(0, reputasi) : 0;

  const level = getLevelInfo(safeXp);

  let progress = 100;

  if (level.nextXp) {
    progress =
      ((safeXp - level.minXp) /
        (level.nextXp - level.minXp)) *
      100;
  }

  progress = Math.max(0, Math.min(isNaN(progress) ? 0 : progress, 100));

  return (
    <section className="mt-6 space-y-4">
      {/* LEVEL / PERJALANAN AKSARA */}
      <div className="bg-[#FFFDF9] border border-[#E8DED6] rounded-2xl p-5 shadow-2xs">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#C85A32] font-semibold">
              Perjalanan Aksara
            </p>

            <h2 className="text-lg font-serif font-bold text-[#2C2A29] mt-0.5">
              {level.nama}
            </h2>

            <p className="text-xs text-[#6B625D] mt-0.5">
              Tingkat {level.level}
            </p>
          </div>

          <div className="px-2.5 py-1 rounded-lg border border-[#E8DED6] bg-[#FAF8F5] text-xs font-semibold text-[#C85A32]">
            {xp} XP
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-2 bg-[#E8DED6]/70 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#C85A32] transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {level.nextXp ? (
          <div className="flex justify-between gap-3 mt-2 text-[11px] text-[#6B625D]">
            <span>{xp} XP</span>
            <span className="text-right">
              {level.nextXp - xp} XP lagi menuju tingkat berikutnya
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#C85A32] mt-2 font-medium flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#C85A32]" /> Tingkat tertinggi telah tercapai.
          </p>
        )}
      </div>

      {/* ROLE KHUSUS */}
      {(role !== 'user' || isDonatur) && (
        <div className="flex flex-wrap gap-2">
          {role === 'admin' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#2C2A29] text-white text-xs font-medium">
              <Shield className="w-3.5 h-3.5" /> Penjaga Titah
            </span>
          )}

          {role === 'mentor' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-[#7A8B68]" /> Guru Sastra
            </span>
          )}

          {isDonatur && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFFDF9] border border-[#E8DED6] text-[#C85A32] text-xs font-medium shadow-2xs">
              <Coffee className="w-3.5 h-3.5" /> Sahabat Aksara
            </span>
          )}
        </div>
      )}

      {/* REPUTASI */}
      <div className="bg-[#FFFDF9] border border-[#E8DED6] rounded-2xl p-4 shadow-2xs">
        <p className="text-[10px] uppercase tracking-wider text-[#C85A32] font-semibold mb-1.5">
          Reputasi Sastra
        </p>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8DED6] flex items-center justify-center text-[#C85A32]">
            <Star className="w-4 h-4 fill-[#C85A32]/20" />
          </div>

          <div>
            <p className="text-lg font-serif font-bold text-[#2C2A29]">
              {safeReputasi.toFixed(1)}
            </p>
            <p className="text-xs text-[#6B625D]">
              Penilaian kontribusi dan apresiasi komunitas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}