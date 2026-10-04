import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const karyaId = Number.parseInt(resolvedParams.id, 10);
    if (!Number.isInteger(karyaId) || karyaId <= 0) {
      return NextResponse.json({ error: 'ID karya tidak valid' }, { status: 400, headers: corsHeaders });
    }

    const body = await request.json().catch(() => ({})); 

    // KUNCI PERBAIKAN: Menangkap ejaan snake_case komentar
    const namaPengguna = String(body.nama_pengguna || body.namaPengguna || "Anonim").trim().slice(0, 100);
    const isiKomentar = String(body.isi_komentar || body.isiKomentar || "").trim();

    if (!isiKomentar) {
      return NextResponse.json({ error: 'Isi komentar tidak boleh kosong' }, { status: 400, headers: corsHeaders });
    }

    await pool.query(
      'INSERT INTO komentar (karya_id, nama_pengguna, isi_komentar) VALUES ($1, $2, $3)',
      [karyaId, namaPengguna, isiKomentar]
    );

    await pool.query(
      'UPDATE karya SET jumlah_komentar = COALESCE(jumlah_komentar, 0) + 1 WHERE id = $1',
      [karyaId]
    );

    const countResult = await pool.query(
      'SELECT GREATEST(COALESCE(k.jumlah_komentar, 0), (SELECT COUNT(*)::int FROM komentar c WHERE c.karya_id = k.id)) AS total FROM karya k WHERE k.id = $1',
      [karyaId]
    );
    const totalKomentar = countResult.rows[0]?.total || 1;

    return NextResponse.json({ message: 'Komentar terkirim!', total_komentar: totalKomentar }, { status: 201, headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: 'Gagal mengirim komentar' }, { status: 500, headers: corsHeaders });
  }
}