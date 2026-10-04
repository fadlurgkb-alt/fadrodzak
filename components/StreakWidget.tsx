'use client';

import { useState, useEffect } from 'react';
import { Flame, Gift, Check, ChevronRight, X, Sparkles, Loader2, Award, BookOpen, Feather } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScheduleItem {
  day: number;
  xp: number;
  reward: string;
  status: 'claimed' | 'ready' | 'locked';
  isCurrent: boolean;
}

interface LoginBeruntungData {
  streak_count: number;
  day: number;
  is_claimed_today: boolean;
  current_reward: {
    day: number;
    xp: number;
    reward: string;
  };
  schedule: ScheduleItem[];
}

export default function StreakWidget({ initialCount = 3 }: { initialCount?: number }) {
  const [data, setData] = useState<LoginBeruntungData>({
    streak_count: Math.max(initialCount, 3),
    day: 3,
    is_claimed_today: false,
    current_reward: {
      day: 3,
      xp: 40,
      reward: 'Bonus Pena Nyala',
    },
    schedule: [
      { day: 1, xp: 15, reward: 'Tinta Perunggu', status: 'claimed', isCurrent: false },
      { day: 2, xp: 25, reward: 'Inspirasi Aksara', status: 'claimed', isCurrent: false },
      { day: 3, xp: 40, reward: 'Bonus Pena Nyala', status: 'ready', isCurrent: true },
      { day: 4, xp: 60, reward: 'Gulungan Puisi', status: 'locked', isCurrent: false },
      { day: 5, xp: 85, reward: 'Aksara Perak', status: 'locked', isCurrent: false },
      { day: 6, xp: 120, reward: 'Apresiasi Redaksi', status: 'locked', isCurrent: false },
      { day: 7, xp: 250, reward: 'Lencana Maestro', status: 'locked', isCurrent: false },
    ],
  });

  const [isClaiming, setIsClaiming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/login-beruntung');
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.success) {
            setData({
              streak_count: Math.max(json.streak_count || 3, 3),
              day: json.day || 3,
              is_claimed_today: !!json.is_claimed_today,
              current_reward: json.current_reward || {
                day: 3,
                xp: 40,
                reward: 'Bonus Pena Nyala',
              },
              schedule: json.schedule || [],
            });
          }
        }
      } catch (err) {
        console.warn('[StreakWidget] Sinkronisasi offline:', err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClaimBonus = async () => {
    if (data.is_claimed_today || isClaiming) return;

    setIsClaiming(true);
    try {
      const res = await fetch('/api/login-beruntung', {
        method: 'POST',
      });
      const resJson = await res.json();

      if (res.ok && resJson.success) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#C85A32', '#A94728', '#7A8B68', '#FAF8F5'],
        });

        setData((prev) => ({
          ...prev,
          is_claimed_today: true,
          schedule: prev.schedule.map((item) =>
            item.day === prev.day ? { ...item, status: 'claimed' } : item
          ),
        }));

        setClaimSuccessMessage(
          `Selamat! Anda memperoleh +${resJson.xp_awarded} XP & ${resJson.reward}!`
        );
      } else {
        setClaimSuccessMessage(resJson.error || 'Gagal mengklaim bonus.');
      }
    } catch {
      setClaimSuccessMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsClaiming(false);
    }
  };

  const count = data.streak_count;
  let streakTitle = 'Pena Nyala';

  if (count >= 30) {
    streakTitle = 'Sang Maestro Aksara';
  } else if (count >= 14) {
    streakTitle = 'Pujangga Tekun';
  } else if (count >= 7) {
    streakTitle = 'Pena Tak Padam';
  }

  return (
    <>
      <div className="bg-[#FFFDF9] rounded-2xl p-5 border border-[#E8DED6] shadow-2xs mb-8 space-y-4">
        {/* Status Streak */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8DED6] flex items-center justify-center shadow-2xs shrink-0">
              <Flame className="w-6 h-6 text-[#C85A32]" />
              <span className="absolute -bottom-1 -right-1 bg-[#C85A32] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                {count}d
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#2C2A29]">
                  {count} Hari Berturut-turut
                </h3>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-lg border border-[#E8DED6] bg-[#FAF8F5] text-[#C85A32]">
                  {streakTitle}
                </span>
              </div>

              <p className="text-xs text-[#6B625D] mt-0.5">
                {data.is_claimed_today
                  ? 'Pena Tak Padam! Bonus login hari ini sudah masuk ke akun Anda.'
                  : 'Hadiah Login Beruntung siap Anda klaim hari ini.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {!data.is_claimed_today ? (
              <button
                onClick={handleClaimBonus}
                disabled={isClaiming}
                className="px-3.5 py-2 bg-[#C85A32] hover:bg-[#A94728] text-white rounded-xl text-xs font-medium shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {isClaiming ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Gift className="w-3.5 h-3.5" />
                )}
                <span>Klaim +{data.current_reward?.xp || 40} XP</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#7A8B68]/10 text-[#7A8B68] text-xs font-medium rounded-xl border border-[#7A8B68]/30">
                <Check className="w-3.5 h-3.5" />
                <span>Bonus Terklaim</span>
              </div>
            )}

            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-2 bg-[#FAF8F5] hover:bg-white border border-[#E8DED6] text-[#6B625D] rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Lihat Jadwal Hadiah 7 Hari"
            >
              <span>Jadwal Bonus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner Mini */}
        <div className="bg-[#FAF8F5] border border-[#E8DED6] rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#6B625D]">
            <Sparkles className="w-4 h-4 text-[#C85A32] shrink-0" />
            <span>
              <strong>Login Beruntung:</strong> Pertahankan streak membaca &amp; menulis agar penamu tak padam.
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-[#C85A32] font-semibold hover:underline shrink-0 text-[11px] cursor-pointer"
          >
            Lihat Jadwal →
          </button>
        </div>
      </div>

      {/* Modal Kalender 7 Hari */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#FFFDF9] p-6 shadow-xl border border-[#E8DED6] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E8DED6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center border border-[#C85A32]/20">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C2A29]">
                    Hadiah Login Beruntung
                  </h3>
                  <p className="text-xs text-[#6B625D]">
                    Klaim bonus setiap hari untuk tingkatkan XP sastramu!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setClaimSuccessMessage(null);
                }}
                className="text-[#6B625D] hover:text-[#2C2A29] p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {claimSuccessMessage && (
              <div className="bg-[#FAF8F5] border border-[#7A8B68]/30 text-[#7A8B68] text-xs p-3 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#7A8B68]" />
                <span>{claimSuccessMessage}</span>
              </div>
            )}

            {/* Grid 7 Hari */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {(data.schedule || []).map((item) => {
                const isClaimed = item.status === 'claimed';
                const isReady = item.status === 'ready';

                return (
                  <div
                    key={item.day}
                    className={`rounded-xl p-3 border text-center flex flex-col justify-between transition ${
                      item.day === 7 ? 'col-span-2 sm:col-span-2 bg-[#FAF8F5] border-[#C85A32]/40' : ''
                    } ${
                      isReady
                        ? 'bg-[#FFFDF9] border-[#C85A32] ring-1 ring-[#C85A32]'
                        : isClaimed
                        ? 'bg-[#FAF8F5] border-[#E8DED6] opacity-80'
                        : 'bg-[#FFFDF9] border-[#E8DED6]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-[#6B625D] font-semibold block uppercase tracking-wider">
                        Hari ke-{item.day}
                      </span>
                      <p className="text-xs font-bold text-[#2C2A29] mt-0.5">
                        +{item.xp} XP
                      </p>
                      <p className="text-[11px] text-[#6B625D] mt-1 line-clamp-2 leading-tight">
                        {item.reward}
                      </p>
                    </div>

                    <div className="mt-2.5">
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#7A8B68] bg-[#7A8B68]/10 px-2 py-0.5 rounded-md font-semibold">
                          <Check className="w-3 h-3" /> Terklaim
                        </span>
                      ) : isReady ? (
                        <button
                          onClick={handleClaimBonus}
                          disabled={isClaiming}
                          className="w-full py-1 bg-[#C85A32] hover:bg-[#A94728] text-white text-[11px] font-semibold rounded-lg transition cursor-pointer"
                        >
                          {isClaiming ? 'Mengambil...' : 'Klaim'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#6B625D]/60 bg-[#FAF8F5] px-2 py-0.5 rounded-md">
                          Terkunci
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setClaimSuccessMessage(null);
                }}
                className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#E8DED6] border border-[#E8DED6] text-[#2C2A29] rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
