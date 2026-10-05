import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, parseJwtPayload } from '@/lib/firebase-admin';
import { SESSION_COOKIE_NAME, getCurrentUser } from '@/lib/auth-server';
import pool from '@/lib/db';

const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 hari

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken: string = body.idToken || body.token || '';
    const clientUser = body.user || {};

    let userUid = '';
    let userEmail = '';
    let userName = '';
    let userPicture = '';

    // 1. Verifikasi ID Token Firebase melalui Firebase Admin
    if (idToken) {
      try {
        const verified = await adminAuth.verifyIdToken(idToken);
        if (verified && verified.uid) {
          userUid = String(verified.uid);
          userEmail = verified.email ? String(verified.email) : '';
          userName = verified.name ? String(verified.name) : '';
          userPicture = verified.picture ? String(verified.picture) : '';
        }
      } catch (err) {
        console.warn('[Session Route] verifyIdToken notice:', err);
      }

      // Fallback decoder jika verifikasi lokal preview
      if (!userUid) {
        const jwt = parseJwtPayload(idToken);
        if (jwt && (jwt.user_id || jwt.sub)) {
          userUid = String(jwt.user_id || jwt.sub);
          userEmail = jwt.email ? String(jwt.email) : '';
          userName = jwt.name ? String(jwt.name) : '';
          userPicture = jwt.picture ? String(jwt.picture) : '';
        }
      }
    }

    // 2. Jika ada data nama/foto dari client object dan belum terisi dari token
    if (clientUser?.uid) {
      if (!userUid) userUid = String(clientUser.uid);
      if (!userName && (clientUser.displayName || clientUser.name)) {
        userName = String(clientUser.displayName || clientUser.name);
      }
      if (!userEmail && clientUser.email) {
        userEmail = String(clientUser.email);
      }
      if (!userPicture && (clientUser.photoURL || clientUser.picture)) {
        userPicture = String(clientUser.photoURL || clientUser.picture);
      }
    }

    if (!userUid) {
      return NextResponse.json(
        { error: 'ID Token tidak valid atau identitas pengguna tidak ditemukan' },
        { status: 400 }
      );
    }

    if (!userName) {
      userName = userEmail ? userEmail.split('@')[0] : 'Penulis Sastra';
    }

    // 3. Buat Session Cookie resmi
    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      { expiresIn: EXPIRES_IN_MS },
      {
        uid: userUid,
        email: userEmail,
        name: userName,
        picture: userPicture,
      }
    );

    // 4. Auto-Provisioning Database PostgreSQL (Neon) untuk Akun Unik
    try {
      // a. Profil Pengguna (jangan timpa nama/foto jika user sudah edit sebelumnya)
      const existingProfil = await pool.query(
        'SELECT user_id, nama, foto_url FROM profil_pengguna WHERE user_id = $1 LIMIT 1',
        [userUid]
      );

      if (existingProfil.rows.length === 0) {
        await pool.query(
          `INSERT INTO profil_pengguna (user_id, email, nama, foto_url, status_badge, bio, link_donasi)
           VALUES ($1, $2, $3, $4, 'Pelajar Sastra', 'Pena baru di ruang sastra Fadrodzak.', '')`,
          [userUid, userEmail, userName, userPicture]
        );
      } else {
        // Update hanya jika field di database masih kosong
        await pool.query(
          `UPDATE profil_pengguna
           SET
             email = COALESCE(NULLIF(email, ''), $2),
             nama = CASE WHEN (nama IS NULL OR nama = '' OR nama = 'Penulis Sastra') AND $3 != '' THEN $3 ELSE nama END,
             foto_url = CASE WHEN (foto_url IS NULL OR foto_url = '') AND $4 != '' THEN $4 ELSE foto_url END
           WHERE user_id = $1`,
          [userUid, userEmail, userName, userPicture]
        );
      }

      // b. Gamifikasi Pengguna (role 'admin' otomatis untuk fadlur.gkb@gmail.com)
      const userRole = userEmail === 'fadlur.gkb@gmail.com' ? 'admin' : 'user';
      await pool.query(
        `INSERT INTO user_gamification (user_id, xp, role, is_donatur, reputasi, account_status)
         VALUES ($1, 0, $2, false, 0, 'active')
         ON CONFLICT (user_id) DO UPDATE SET role = CASE WHEN $2 = 'admin' THEN 'admin' ELSE user_gamification.role END`,
        [userUid, userRole]
      );

      // c. Pemberian Badge Beta Tester jika BETA_TESTER_BADGE_ENABLED=true
      if (process.env.BETA_TESTER_BADGE_ENABLED === 'true') {
        const badgeCheck = await pool.query(
          `SELECT id FROM badges WHERE kode = 'beta_tester' LIMIT 1`
        );
        let badgeId = badgeCheck.rows[0]?.id;
        if (!badgeId) {
          const newBadge = await pool.query(
            `INSERT INTO badges (kode, nama, deskripsi, icon, rarity)
             VALUES ('beta_tester', 'Beta Tester', 'Perintis awal generasi pertama Fadrodzak.', '🧪', 'rare')
             ON CONFLICT (kode) DO UPDATE SET nama = EXCLUDED.nama
             RETURNING id`
          );
          badgeId = newBadge.rows[0]?.id;
        }

        if (badgeId) {
          await pool.query(
            `INSERT INTO user_badges (user_id, badge_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [userUid, badgeId]
          );
        }
      }

      // d. Pemberian Badge Eksklusif: Perintis Fadrodzak (Founding Member untuk 500 pengguna pertama)
      try {
        const countRes = await pool.query('SELECT COUNT(*)::int as count FROM profil_pengguna');
        const userCount = Number(countRes.rows[0]?.count || 0);
        if (userCount <= 500) {
          const perintisCheck = await pool.query(
            `SELECT id FROM badges WHERE kode = 'perintis_fadrodzak' LIMIT 1`
          );
          let perintisBadgeId = perintisCheck.rows[0]?.id;
          if (!perintisBadgeId) {
            const insBadge = await pool.query(
              `INSERT INTO badges (kode, nama, deskripsi, icon, rarity)
               VALUES ('perintis_fadrodzak', 'Perintis Fadrodzak', '500 Penulis & Pembaca Perintis Generasi Awal Fadrodzak.', '🪶', 'legendary')
               ON CONFLICT (kode) DO UPDATE SET nama = EXCLUDED.nama
               RETURNING id`
            );
            perintisBadgeId = insBadge.rows[0]?.id;
          }
          if (perintisBadgeId) {
            await pool.query(
              `INSERT INTO user_badges (user_id, badge_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [userUid, perintisBadgeId]
            );
          }
        }
      } catch (perintisErr) {
        console.warn('[Session Route] Notice badge perintis:', perintisErr);
      }

      // e. Catat referral jika pengguna mendaftar melalui tautan rujukan teman
      const cookieStoreRef = await cookies();
      const refCode = cookieStoreRef.get('fadrodzak_ref')?.value;
      if (refCode && refCode !== userUid) {
        try {
          await pool.query(
            `INSERT INTO referrals (referrer_id, referred_id, status)
             VALUES ($1, $2, 'registered')
             ON CONFLICT (referred_id) DO NOTHING`,
            [refCode, userUid]
          );
        } catch (refErr) {
          console.warn('[Session Route] Notice referral insert:', refErr);
        }
      }
    } catch (dbErr) {
      console.warn('[Session Route] Database provisioning notice:', dbErr);
    }

    // 5. Simpan Session Cookie di Browser
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: Math.floor(EXPIRES_IN_MS / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json(
      {
        status: 'success',
        uid: userUid,
        email: userEmail,
        name: userName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Session Route Error]:', error);
    return NextResponse.json(
      { error: (error as Error)?.message || 'Gagal memproses sesi autentikasi' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const profilRes = await pool.query(
      'SELECT nama, foto_url, status_badge, bio, link_donasi FROM profil_pengguna WHERE user_id = $1 LIMIT 1',
      [user.uid]
    );
    const profil = profilRes.rows[0];

    return NextResponse.json({
      authenticated: true,
      user_id: user.uid,
      user: {
        uid: user.uid,
        email: user.email,
        name: profil?.nama || user.name,
        picture: profil?.foto_url || user.picture,
        status_badge: profil?.status_badge || 'Pelajar Sastra',
        bio: profil?.bio || '',
        link_donasi: profil?.link_donasi || '',
      },
    });
  } catch (error) {
    console.error('[Session GET Error]:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('[Session DELETE Error]:', error);
    return NextResponse.json({ error: 'Gagal logout' }, { status: 500 });
  }
}
