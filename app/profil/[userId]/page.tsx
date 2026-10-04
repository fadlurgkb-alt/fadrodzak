import pool from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/seo';
import { formatWaktuRelatif, formatWaktuLengkap } from '@/lib/date';
import KaryaSnippetPreview from '@/components/KaryaSnippetPreview';
import { ArrowLeft, MessageSquare, BookOpen, Heart, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface KaryaItem {
  id: number;
  judul: string;
  kategori: string;
  isi_tulisan: string;
  created_at: string | Date;
}

interface UserProfileData {
  nama?: string;
  email?: string;
  foto_url?: string;
  status_badge?: string;
  bio?: string;
}

interface UserGamificationData {
  xp?: number;
  role?: string;
  is_donatur?: boolean;
  reputasi?: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const targetUserId = decodeURIComponent(resolvedParams.userId);

  try {
    const { rows } = await pool.query(
      'SELECT nama, bio, foto_url FROM profil_pengguna WHERE user_id = $1 LIMIT 1',
      [targetUserId]
    );
    const profile = rows[0];
    if (!profile) {
      return {
        title: 'Profil Penulis Tidak Ditemukan | Fadrodzak',
      };
    }

    const nama = profile.nama || 'Penulis Sastra';
    const pageTitle = `${nama} — Profil Penulis`;
    const description = `Lihat profil, karya sastra, lencana, dan perjalanan literasi ${nama} di Fadrodzak.`;
    const canonicalUrl = `${SITE_URL}/profil/${encodeURIComponent(targetUserId)}`;
    const imageUrl = profile.foto_url || `${SITE_URL}/pwa-512x512.png`;

    return {
      title: pageTitle,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'profile',
        locale: 'id_ID',
        url: canonicalUrl,
        siteName: 'Fadrodzak',
        title: `${pageTitle} | Fadrodzak`,
        description,
        images: [
          {
            url: imageUrl,
            alt: `Foto profil ${nama}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pageTitle} | Fadrodzak`,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Profil Penulis',
    };
  }
}

async function startConversationAction(targetUserId: string) {
  'use server';
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }
  if (currentUser.uid === targetUserId) {
    return;
  }

  const existing = await pool.query(
    `SELECT m1.conversation_id 
     FROM conversation_members m1
     JOIN conversation_members m2 ON m1.conversation_id = m2.conversation_id
     WHERE m1.user_id = $1 AND m2.user_id = $2
     GROUP BY m1.conversation_id
     HAVING COUNT(m1.conversation_id) = 2`,
    [currentUser.uid, targetUserId]
  );

  let convId = 0;
  if (existing.rows.length > 0) {
    convId = existing.rows[0].conversation_id;
  } else {
    const client = await pool.connect();
    try {
      const convRes = await client.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
      convId = convRes.rows[0].id;
      await client.query(
        `INSERT INTO conversation_members (conversation_id, user_id, last_read_at) VALUES 
         ($1, $2, CURRENT_TIMESTAMP), 
         ($1, $3, CURRENT_TIMESTAMP)`,
        [convId, currentUser.uid, targetUserId]
      );
    } finally {
      client.release();
    }
  }

  redirect(`/chat/${convId}`);
}

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = await params;
  const targetUserId = decodeURIComponent(resolvedParams.userId);

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.uid === targetUserId) {
    redirect('/profil');
  }

  let profileRows: UserProfileData[] = [];
  let gamificationRows: UserGamificationData[] = [];
  let karyaRows: KaryaItem[] = [];

  try {
    const [pRes, gRes, kRes] = await Promise.all([
      pool.query('SELECT * FROM profil_pengguna WHERE user_id = $1', [targetUserId]),
      pool.query('SELECT * FROM user_gamification WHERE user_id = $1', [targetUserId]),
      pool.query('SELECT * FROM karya WHERE user_id = $1 ORDER BY created_at DESC', [targetUserId]),
    ]);
    profileRows = (pRes.rows as UserProfileData[]) || [];
    gamificationRows = (gRes.rows as UserGamificationData[]) || [];
    karyaRows = (kRes.rows as KaryaItem[]) || [];
  } catch (err) {
    console.warn('[UserProfilePage] Notice membaca profil user lain:', err);
  }

  if (profileRows.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-serif font-bold text-[#2C2A29]">Profil Penulis Tidak Ditemukan</h2>
          <p className="text-[#6B625D]">Penulis ini belum mendaftar atau profil tidak tersedia.</p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-medium hover:bg-[#A94728] transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const profile = profileRows[0];
  const gamification = gamificationRows[0] || { xp: 0, role: 'user', is_donatur: false, reputasi: 0 };

  const jsonLdProfile = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profile.nama || 'Penulis Sastra',
      description: profile.bio || 'Penulis di komunitas aksara Fadrodzak.',
      image: profile.foto_url || undefined,
      url: `${SITE_URL}/profil/${encodeURIComponent(targetUserId)}`,
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 text-[#2C2A29]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProfile) }}
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#C85A32] hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Beranda Sastra
          </Link>
          {currentUser && (
            <form action={async () => {
              'use server';
              await startConversationAction(targetUserId);
            }}>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-medium hover:bg-[#A94728] transition shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Kirim Pesan
              </button>
            </form>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-[#FFFDF9] rounded-2xl p-6 sm:p-8 border border-[#E8DED6] shadow-2xs text-center relative overflow-hidden">
          <div className="relative flex flex-col items-center">
            {profile.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.foto_url}
                alt={`Foto profil ${profile.nama || 'Penulis'}, anggota Fadrodzak`}
                className="w-24 h-24 rounded-full object-cover border border-[#E8DED6] shadow-2xs mb-4"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#FAF8F5] border border-[#E8DED6] shadow-2xs mb-4 flex items-center justify-center text-[#C85A32] font-serif font-bold text-2xl">
                {profile.nama ? profile.nama.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2A29] mb-1">
              {profile.nama || 'Penulis Sastra'}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs bg-[#FAF8F5] border border-[#E8DED6] text-[#C85A32] px-3 py-0.5 rounded-lg font-medium">
                {profile.status_badge || 'Pelajar Sastra'}
              </span>
              {gamification.role === 'admin' && (
                <span className="text-xs bg-[#FAF8F5] border border-[#E8DED6] text-[#2C2A29] px-3 py-0.5 rounded-lg font-medium">
                  Pengurus Komunitas
                </span>
              )}
            </div>

            <p className="text-sm text-[#6B625D] font-serif italic max-w-md mx-auto mb-6">
              &ldquo;{profile.bio || 'Pena baru di ruang sastra Fadrodzak.'}&rdquo;
            </p>

            <div className="flex items-center justify-center gap-6 border-t border-[#E8DED6] pt-4 w-full text-xs text-[#6B625D]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#7A8B68]" />
                <span>{karyaRows.length} Karya</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#C85A32] fill-[#C85A32]/20" />
                <span>{gamification.reputasi} Reputasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Works */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#2C2A29] px-1">
            Karya Terbitan {profile.nama}
          </h2>

          {karyaRows.length === 0 ? (
            <div className="bg-[#FFFDF9] rounded-2xl p-8 border border-[#E8DED6] text-center">
              <p className="text-[#6B625D] text-sm">Penulis ini belum menerbitkan karya sastra.</p>
            </div>
          ) : (
            (karyaRows as KaryaItem[]).map((karya) => (
              <article
                key={karya.id}
                className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#E8DED6] shadow-2xs hover:border-[#C85A32]/30 transition"
              >
                <div className="flex items-center justify-between text-xs text-[#6B625D] mb-2">
                  <span className="text-[#C85A32] font-semibold">{karya.kategori}</span>
                  <time
                    dateTime={karya.created_at ? new Date(karya.created_at).toISOString() : undefined}
                    className="hover:text-[#C85A32] transition"
                    title={formatWaktuLengkap(karya.created_at)}
                  >
                    {formatWaktuRelatif(karya.created_at)}
                  </time>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#2C2A29] mb-2">
                  <Link href={`/karya/${karya.id}`} className="hover:text-[#C85A32] transition">
                    {karya.judul}
                  </Link>
                </h3>
                <KaryaSnippetPreview
                  isiTulisan={karya.isi_tulisan}
                  kategori={karya.kategori}
                  maxPoemLines={3}
                />
                <Link
                  href={`/karya/${karya.id}`}
                  className="text-xs font-semibold text-[#C85A32] hover:underline"
                >
                  Baca Selengkapnya &rarr;
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
