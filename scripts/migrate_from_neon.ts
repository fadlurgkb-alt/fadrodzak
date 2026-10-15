import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Muat .env atau .env.local jika ada
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    try {
      process.loadEnvFile('.env');
    } catch {
      // Abaikan jika tidak ada file .env lokal
    }
  }
}

// URL Neon source
const NEON_URL =
  process.env.NEON_DATABASE_URL ||
  "postgresql://neondb_owner:npg_V4v7LMZzhHcO@ep-icy-voice-b3y7e6kl-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// URL Local Target (dari .env.local atau default VPS)
const TARGET_URL =
  process.env.DATABASE_URL ||
  "postgres://fadrodzak_user:PasswordKuatAnda123@localhost:5432/fadrodzak_db";

const TABLES_ORDER = [
  'profil_pengguna',
  'user_gamification',
  'badges',
  'user_badges',
  'xp_history',
  'karya',
  'likes',
  'komentar',
  'tutorial',
  'buku',
  'notifikasi',
  'reaksi_sastra',
  'tafsir_bait',
  'bedah_karya',
  'user_streak',
  'conversations',
  'conversation_members',
  'messages',
  'user_blocks',
];

async function migrateData() {
  console.log('[Migrasi Neon -> VPS] Memulai migrasi data...');
  console.log('[Migrasi Neon -> VPS] Sumber Neon:', NEON_URL.split('@')[1] || 'Neon DB');
  console.log('[Migrasi Neon -> VPS] Target DB:', TARGET_URL.split('@')[1] || TARGET_URL);

  const neon = new Client({ connectionString: NEON_URL });
  const local = new Client({
    connectionString: TARGET_URL,
    ssl: TARGET_URL.includes('localhost') || TARGET_URL.includes('127.0.0.1') ? false : undefined,
  });

  try {
    await neon.connect();
    console.log('✓ Terhubung ke Neon DB');
  } catch (err: any) {
    console.error('✗ Gagal koneksi ke Neon DB:', err.message);
    process.exit(1);
  }

  try {
    await local.connect();
    console.log('✓ Terhubung ke Target PostgreSQL DB');
  } catch (err: any) {
    console.error('✗ Gagal koneksi ke Target DB:', err.message);
    await neon.end();
    process.exit(1);
  }

  let totalMigrated = 0;

  for (const table of TABLES_ORDER) {
    try {
      // Periksa apakah tabel ada di Neon
      const checkNeon = await neon.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)",
        [table]
      );
      if (!checkNeon.rows[0].exists) {
        console.log(`[${table}] Tabel tidak ada di Neon, dilewati.`);
        continue;
      }

      // Ambil semua kolom dari tabel target lokal
      const localColsRes = await local.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1",
        [table]
      );
      if (localColsRes.rows.length === 0) {
        console.warn(`[${table}] Tabel target belum dibuat di PostgreSQL lokal! Jalankan 'npm run db:migrate' dahulu.`);
        continue;
      }
      const localColSet = new Set(localColsRes.rows.map((r: any) => r.column_name));

      // Ambil data dari Neon
      const neonData = await neon.query(`SELECT * FROM "${table}"`);
      if (neonData.rows.length === 0) {
        console.log(`[${table}] Kosong di Neon (0 baris).`);
        continue;
      }

      console.log(`[${table}] Mengimpor ${neonData.rows.length} baris dari Neon...`);
      let inserted = 0;

      for (const row of neonData.rows) {
        const availableCols = Object.keys(row).filter((k) => localColSet.has(k));
        if (availableCols.length === 0) continue;

        const colNames = availableCols.map((c) => `"${c}"`).join(', ');
        const placeholders = availableCols.map((_, idx) => `$${idx + 1}`).join(', ');
        const values = availableCols.map((c) => row[c]);

        const queryText = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

        try {
          await local.query(queryText, values);
          inserted++;
        } catch (insertErr: any) {
          console.warn(`[${table}] Catatan baris:`, insertErr.message);
        }
      }

      // Reset auto-increment sequence jika ada kolom 'id'
      if (localColSet.has('id')) {
        try {
          await local.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), true)`);
        } catch {
          // Abaikan jika tabel tidak menggunakan sequence
        }
      }

      console.log(`✓ [${table}] Selesai: ${inserted}/${neonData.rows.length} baris tersimpan.`);
      totalMigrated += inserted;
    } catch (err: any) {
      console.error(`✗ [${table}] Error saat memindahkan data:`, err.message);
    }
  }

  // Tambahan: Periksa apakah ada data di .memory_store.json yang belum ada (misal bedah_karya atau tafsir_bait)
  const memoryStorePath = path.join(process.cwd(), '.memory_store.json');
  if (fs.existsSync(memoryStorePath)) {
    try {
      console.log('\n[Memeriksa .memory_store.json untuk data pelengkap...]');
      const storeRaw = fs.readFileSync(memoryStorePath, 'utf-8');
      const storeData = JSON.parse(storeRaw);

      // Bedah karya
      if (Array.isArray(storeData.bedahKarya) && storeData.bedahKarya.length > 0) {
        const countRes = await local.query('SELECT COUNT(*) FROM bedah_karya');
        if (Number(countRes.rows[0].count) === 0) {
          console.log(`[bedah_karya] Memasukkan ${storeData.bedahKarya.length} data awal kurasi sastra...`);
          for (const b of storeData.bedahKarya) {
            await local.query(
              `INSERT INTO bedah_karya (karya_id, judul, penulis_karya, kategori, kutipan_karya, mentor_nama, mentor_gelar, minggu_ke, ulasan_diksi, ulasan_rima, ulasan_rasa, ulasan_pesan, kesimpulan, rating_apresiasi)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT DO NOTHING`,
              [b.karya_id, b.judul, b.penulis_karya, b.kategori, b.kutipan_karya, b.mentor_nama, b.mentor_gelar, b.minggu_ke, b.ulasan_diksi, b.ulasan_rima, b.ulasan_rasa, b.ulasan_pesan, b.kesimpulan, b.rating_apresiasi || 5]
            );
          }
        }
      }

      // Tafsir bait
      if (Array.isArray(storeData.tafsir) && storeData.tafsir.length > 0) {
        const countRes = await local.query('SELECT COUNT(*) FROM tafsir_bait');
        if (Number(countRes.rows[0].count) === 0) {
          console.log(`[tafsir_bait] Memasukkan ${storeData.tafsir.length} tafsir bait awal...`);
          for (const t of storeData.tafsir) {
            await local.query(
              `INSERT INTO tafsir_bait (karya_id, bait_index, potongan_bait, nama_pengguna, user_id, isi_tafsir)
               VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
              [t.karya_id, t.bait_index, t.potongan_bait, t.nama_pengguna, t.user_id, t.isi_tafsir]
            );
          }
        }
      }

      // Buku awal bila kosong
      if (Array.isArray(storeData.buku) && storeData.buku.length > 0) {
        const countRes = await local.query('SELECT COUNT(*) FROM buku');
        if (Number(countRes.rows[0].count) <= 1) {
          console.log(`[buku] Memasukkan ${storeData.buku.length} buku rekomendasi perpustakaan...`);
          for (const bk of storeData.buku) {
            await local.query(
              `INSERT INTO buku (google_books_id, isbn_13, judul, penulis, penerbit, jumlah_halaman, genre, sinopsis, gambar_url)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING`,
              [bk.google_books_id, bk.isbn_13, bk.judul, bk.penulis, bk.penerbit, bk.jumlah_halaman, bk.genre, bk.sinopsis, bk.gambar_url]
            );
          }
        }
      }
    } catch (err: any) {
      console.warn('Catatan impor data pelengkap memory store:', err.message);
    }
  }

  console.log(`\n=============================================`);
  console.log(`[MIGRASI SELESAI] Semua karya & data sastra berhasil tersalin ke VPS!`);
  console.log(`=============================================\n`);

  await neon.end();
  await local.end();
}

migrateData().catch((err) => {
  console.error('Fatal error saat migrasi:', err);
  process.exit(1);
});
