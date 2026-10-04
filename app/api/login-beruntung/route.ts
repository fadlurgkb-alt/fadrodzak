import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getCurrentUser } from '../../../lib/auth-server';

export const dynamic = 'force-dynamic';

const SCHEDULE = [
  { day: 1, xp: 15, reward: '🪶 Tinta Perunggu' },
  { day: 2, xp: 25, reward: '📜 Inspirasi Aksara' },
  { day: 3, xp: 40, reward: '🔥 Bonus Pena Nyala' },
  { day: 4, xp: 60, reward: '📖 Gulungan Puisi' },
  { day: 5, xp: 85, reward: '✨ Aksara Perak' },
  { day: 6, xp: 120, reward: '🌟 Apresiasi Redaksi' },
  { day: 7, xp: 250, reward: '🏆 Piala Maestro Sastra' },
];

function getWIBDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getDayDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z').getTime();
  const d2 = new Date(dateStr2 + 'T00:00:00Z').getTime();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    let sessionUser = null;
    try {
      sessionUser = await getCurrentUser();
    } catch {}

    const uid = sessionUser?.uid;
    const today = getWIBDate();

    if (!uid) {
      // Guest user (belum login)
      return NextResponse.json({
        success: true,
        user_id: null,
        streak_count: 0,
        day: 1,
        is_claimed_today: false,
        current_reward: SCHEDULE[0],
        schedule: SCHEDULE.map((item) => ({
          ...item,
          status: item.day === 1 ? 'ready' : 'locked',
          isCurrent: item.day === 1,
        })),
      });
    }

    const { rows } = await pool.query(
      'SELECT * FROM user_streak WHERE user_id = $1',
      [uid]
    );

    let streak = rows[0];

    if (!streak) {
      // Akun baru pertama kali login: Mulai dari hari 1
      const initResult = await pool.query(
        `INSERT INTO user_streak (user_id, streak_count, last_active_date, total_hari_aktif, rekor_streak)
         VALUES ($1, 1, CURRENT_DATE, 1, 1)
         ON CONFLICT (user_id) DO UPDATE SET last_active_date = CURRENT_DATE
         RETURNING *`,
        [uid]
      );
      streak = initResult.rows[0] || {
        user_id: uid,
        streak_count: 1,
        last_active_date: today,
        total_hari_aktif: 1,
        rekor_streak: 1,
      };
    } else {
      const lastActive = streak.last_active_date
        ? getWIBDate(new Date(streak.last_active_date))
        : null;

      const diff = lastActive ? getDayDiff(lastActive, today) : 999;

      if (diff === 1) {
        // Login berturut-turut di hari berikutnya: tambah streak!
        const newStreak = (Number(streak.streak_count) || 0) + 1;
        const newTotalAktif = (Number(streak.total_hari_aktif) || 0) + 1;
        const newRekor = Math.max(Number(streak.rekor_streak) || 1, newStreak);

        await pool.query(
          `UPDATE user_streak
           SET streak_count = $1,
               last_active_date = CURRENT_DATE,
               total_hari_aktif = $2,
               rekor_streak = $3
           WHERE user_id = $4`,
          [newStreak, newTotalAktif, newRekor, uid]
        );

        streak.streak_count = newStreak;
        streak.last_active_date = today;
        streak.total_hari_aktif = newTotalAktif;
        streak.rekor_streak = newRekor;
      } else if (diff > 1) {
        // Terlewat lebih dari 1 hari: streak reset ke 1
        const newTotalAktif = (Number(streak.total_hari_aktif) || 0) + 1;
        await pool.query(
          `UPDATE user_streak
           SET streak_count = 1,
               last_active_date = CURRENT_DATE,
               total_hari_aktif = $1
           WHERE user_id = $2`,
          [newTotalAktif, uid]
        );

        streak.streak_count = 1;
        streak.last_active_date = today;
        streak.total_hari_aktif = newTotalAktif;
      }
      // Jika diff === 0 (hari yang sama), streak tetap sama
    }

    const currentCount = Number(streak.streak_count) || 1;
    const currentDay = ((currentCount - 1) % 7) + 1; // Putaran 1-7
    const lastClaimed = streak.last_bonus_claimed_date
      ? getWIBDate(new Date(streak.last_bonus_claimed_date))
      : null;
    const isClaimedToday = lastClaimed === today;

    const currentReward = SCHEDULE.find((s) => s.day === currentDay) || SCHEDULE[0];

    const scheduleWithStatus = SCHEDULE.map((item) => {
      let status: 'claimed' | 'ready' | 'locked' = 'locked';
      if (item.day < currentDay) {
        status = 'claimed';
      } else if (item.day === currentDay) {
        status = isClaimedToday ? 'claimed' : 'ready';
      }
      return {
        ...item,
        status,
        isCurrent: item.day === currentDay,
      };
    });

    return NextResponse.json({
      success: true,
      user_id: uid,
      streak_count: currentCount,
      day: currentDay,
      is_claimed_today: isClaimedToday,
      current_reward: currentReward,
      schedule: scheduleWithStatus,
    });
  } catch (err) {
    console.warn('[Login Beruntung API] Error GET:', err);
    return NextResponse.json({
      success: true,
      streak_count: 1,
      day: 1,
      is_claimed_today: false,
      current_reward: SCHEDULE[0],
      schedule: SCHEDULE.map((s) => ({
        ...s,
        status: s.day === 1 ? 'ready' : 'locked',
        isCurrent: s.day === 1,
      })),
    });
  }
}

export async function POST() {
  try {
    let sessionUser = null;
    try {
      sessionUser = await getCurrentUser();
    } catch {}

    const uid = sessionUser?.uid;
    if (!uid) {
      return NextResponse.json(
        { error: 'Silakan masuk terlebih dahulu untuk mengklaim bonus harian.' },
        { status: 401 }
      );
    }

    const today = getWIBDate();

    const { rows } = await pool.query(
      'SELECT * FROM user_streak WHERE user_id = $1',
      [uid]
    );

    let streak = rows[0];
    if (!streak) {
      const initResult = await pool.query(
        `INSERT INTO user_streak (user_id, streak_count, last_active_date, total_hari_aktif, rekor_streak)
         VALUES ($1, 1, CURRENT_DATE, 1, 1)
         RETURNING *`,
        [uid]
      );
      streak = initResult.rows[0];
    }

    const currentCount = Number(streak.streak_count) || 1;
    const currentDay = ((currentCount - 1) % 7) + 1;
    const lastClaimed = streak.last_bonus_claimed_date
      ? getWIBDate(new Date(streak.last_bonus_claimed_date))
      : null;

    if (lastClaimed === today) {
      return NextResponse.json(
        { error: 'Bonus login hari ini sudah Anda klaim. Datang kembali besok!' },
        { status: 400 }
      );
    }

    const reward = SCHEDULE.find((s) => s.day === currentDay) || SCHEDULE[0];
    const bonusXp = reward.xp;

    // 1. Tambah XP ke user_gamification
    await pool.query(
      `INSERT INTO user_gamification (user_id, xp)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET xp = user_gamification.xp + $2`,
      [uid, bonusXp]
    );

    // 2. Catat ke xp_history
    try {
      await pool.query(
        `INSERT INTO xp_history (user_id, jumlah_xp, jenis, keterangan)
         VALUES ($1, $2, 'login_beruntung', $3)`,
        [uid, bonusXp, `Hadiah Login Beruntung Hari ke-${currentDay} (${reward.reward})`]
      );
    } catch {}

    // 3. Update tanggal klaim bonus terakhir
    await pool.query(
      `UPDATE user_streak
       SET last_bonus_claimed_date = CURRENT_DATE,
           last_active_date = CURRENT_DATE
       WHERE user_id = $1`,
      [uid]
    );

    // Ambil total XP terbaru
    const gamifResult = await pool.query(
      'SELECT xp FROM user_gamification WHERE user_id = $1',
      [uid]
    );
    const totalXp = gamifResult.rows[0]?.xp || bonusXp;

    return NextResponse.json({
      success: true,
      message: `Selamat! Anda berhasil mengklaim bonus Hari ke-${currentDay}: +${bonusXp} XP & ${reward.reward}!`,
      xp_awarded: bonusXp,
      total_xp: totalXp,
      streak_count: currentCount,
      day: currentDay,
      reward: reward.reward,
    });
  } catch (err) {
    console.error('[Login Beruntung API] Error POST:', err);
    return NextResponse.json(
      { error: 'Gagal mengklaim bonus harian.' },
      { status: 500 }
    );
  }
}
