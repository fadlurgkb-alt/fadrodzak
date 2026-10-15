/**
 * FADRODZAK BOT SASTRA CRON JOB (v3.0 - DYNAMIC NEVER-ENDING ENGINE)
 * Berjalan otomatis setiap 3 jam untuk menerbitkan karya sastra berkualitas tiada henti
 */

const API_BASE_URL = (process.env.API_BASE_URL || 'https://fadrodzak.my.id').replace(/\/+$/, '');

const PENULIS_LIST = [
  { nama: 'Aksara Senja', status: 'Penikmat Kopi & Puisi Malam', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Dewi Lestari Sukma', status: 'Penjelajah Sajak Nusantara', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Bayu Samudra Kata', status: 'Penyair Pesisir & Ombak Jiwa', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Rintik Hujan', status: 'Pengamat Kesunyian Kota', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Pena Pengelana', status: 'Pustakawan Hati & Cerpenis', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Kala Jingga', status: 'Pegiat Catatan Sastra Modern', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Arka Nirwana', status: 'Filosofi Aksara & Pantunis', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Siti Nurhaliza Sastra', status: 'Pencinta Hikayat Melayu & Pantun', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Rangga Prawira', status: 'Penenun Sajak & Esais', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Kirana Lazuardi', status: 'Pengelana Kata & Sastrawan Muda', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Danu Wicaksana', status: 'Pemerhati Kearifan Lokal', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Maya Saraswati', status: 'Penenun Hikayat Lembayung', trakteer: 'https://fadrodzak.my.id' },
  { nama: 'Ilham Swara', status: 'Penyair Malam & Penjelajah Sunyi', trakteer: 'https://fadrodzak.my.id' }
];

// =========================================================================
// 1. SERIAL CERBUNG / NOVEL MULTI-BAB
// =========================================================================
const SERIAL_CERITA = [
  {
    namaCerita: 'Gadis Penenun Benang Emas',
    sinopsis: 'Rengganis mewarisi alat tenun ramalan di perbatasan hutan keramat. Setiap kain yang ia sulam menyimpan ramalan masa depan, hingga seorang pengelana terluka mengetuk pintunya di malam badai.',
    genre: 'Fantasi Sastra',
    statusCerita: 'Ongoing',
    chapters: [
      {
        nomorBab: 2,
        judulBab: 'Bab 2: Tamu dari Lembah Kabut',
        isi: `Pintu kayu berderit pelan saat Rengganis mengangkat palang pengunci. Udara lembap bercampur aroma tembaga menusuk hidungnya seketika.\n\nDi ambang pintu, seorang pemuda tersungkur. Jemari tangannya menggenggam sebilah belati berukir lambang rajawali perak—lambang kesatria istana timur yang telah lama musnah dari ingatan penduduk desa.\n\n"Tolong... jangan biarkan mereka mengambil gulungan sutra biru," bisik pemuda itu parau sebelum jatuh tak sadarkan diri di atas lantai papan pondok.\n\nRengganis tertegun. Di dada pemuda itu, darah merembes membasahi kain tenun berwarna biru laut—persis seperti sehelai kain yang baru saja selesai ia tenun tadi sore sebelum senja tenggelam.`
      },
      {
        nomorBab: 3,
        judulBab: 'Bab 3: Rajutan yang Menyembuhkan Luka',
        isi: `Malam semakin larut di lereng Gunung Seribu. Suara gemercik air tempayan beradu dengan desis rebusan rempah akar wangi yang disiapkan Rengganis.\n\nDengan jemari yang cekatan, ia menyeka luka di pundak pengelana asing itu. Anehnya, bekas tebasan pedang tersebut perlahan merapat bukan hanya karena obat dedaunan, melainkan saat sehelai benang sutra emas disematkan di atas perbannya.\n\nKetika fajar menyingsing di pucuk-pucuk cemara, sang pemuda membuka matanya. Pandangannya yang tajam menatap alat tenun kuno di sudut bilik. "Kamu... penjaga Benang Takdir yang dicari oleh prajurit Lembah Kabut?" tanyanya dengan napas berat.`
      },
      {
        nomorBab: 4,
        judulBab: 'Bab 4: Rahasia Prasasti Sutra Biru',
        isi: `Pemuda itu memperkenalkan diri sebagai Arya, pengawal setia pustaka kerajaan timur yang berhasil lolos dari kepungan pengkhianat istana.\n\nArya merogoh kantong pelana kulitnya dan mengeluarkan sebuah tabung bambu berpahat aksara Jawa Kuno. Di dalamnya, tersimpan sehelai kain sutra biru yang seratnya berpendar lembut saat disentuh cahaya lilin.\n\n"Prasasti ini tidak bisa dibaca oleh mata biasa," ujar Arya lirih. "Hanya keturunan penenun pertama yang sanggup meraba seratnya dan menemukan jalan menuju Gerbang Aksara Abadi."\n\nRengganis menatap kain itu lekat-lekat. Jantungnya berdegup kencang ketika pola tenunan kuno itu terasa persis seperti degup nadinya sendiri.`
      },
      {
        nomorBab: 5,
        judulBab: 'Bab 5: Jejak Kuda di Tepi Hutan Larangan',
        isi: `Deru derap tapak kuda memecah kesunyian lembah sebelum kabut pagi benar-benar terangkat. Tiga orang penunggang kuda berselubung jubah kelabu berhenti tepat di persimpangan jalan setapak menuju pondok Rengganis.\n\n"Mereka sudah menemukan jejakku," bisik Arya seraya bersiap mencabut belati peraknya.\n\nNamun Rengganis menahan lengan sang pengawal. "Di tanah ini, hutan mendengar lebih dulu sebelum mata mereka melihat. Biarkan aku menenun kabut pelindung." Rengganis menggerakkan kayu tenunnya tiga ketukan cepat. Seketika kabut tebal merayap naik dari celah jurang, menelan jalan setapak dan menyamarkan pondok kayu itu dari pandangan para pengejar.`
      }
    ]
  },
  {
    namaCerita: 'Melodi di Ujung Senja',
    sinopsis: 'Pertemuan tak terduga antara Alana si pemain biola yang kehilangan inspirasi dan Danu sang arsitek perantau di dalam gerbong kereta menuju Yogyakarta.',
    genre: 'Romansa Realisme',
    statusCerita: 'Ongoing',
    chapters: [
      {
        nomorBab: 2,
        judulBab: 'Bab 2: Kopi Hangat dan Nada yang Hilang',
        isi: `Uap tipis membubung dari cangkir kertas berisi kopi susu tubruk. Aroma kopi robusta memenuhi ruang sempit di antara kursi 14A dan 14B kelas ekonomi kereta Senja Utama.\n\n"Kamu seorang musisi?" tanya Danu memecah keheningan, matanya menatap kotak biola beludru hitam yang diletakkan Alana di bawah kakinya.\n\n"Hanya seseorang yang sedang belajar mendengar kembali suara hatinya," jawab Alana pelan, jemarinya meremas ujung lengan sweternya yang hangat.\n\nDanu tertawa kecil tanpa nada mengejek. "Arsitek dan musisi rupanya tidak jauh berbeda. Kami sama-sama menyusun jeda. Bangunan butuh ruang kosong untuk bernapas, begitu juga irama lagu, bukan?"\n\nAlana menoleh. Untuk pertama kalinya setelah berbulan-bulan buntu, sebuah melodi baru melintas jernih di kepalanya.`
      },
      {
        nomorBab: 3,
        judulBab: 'Bab 3: Peron Stasiun Tugu Tengah Malam',
        isi: `Lonceng kedatangan berdenting khas mengiringi desis rem lokomotif saat kereta Senja Utama merapat di Stasiun Tugu Yogyakarta. Udara malam yang sejuk menyambut para penumpang yang bergegas turun.\n\nAlana menenteng kotak biolanya, sementara Danu membantunya membawakan tas ransel kanvas menuruni bordes peron.\n\n"Terima kasih untuk kopinya dan obrolan tentang 'ruang jeda'," kata Alana tersenyum tulus di bawah temaram lampu peron bernuansa kolonial.\n\nDanu merogoh saku jaketnya, menyerahkan selembar sketsa pensil di atas serbet kertas: gambar jendela kereta berembun dengan not balok yang melayang bebas. "Semoga biolamu menemukan kembali lagunya di kota ini, Alana."`
      },
      {
        nomorBab: 4,
        judulBab: 'Bab 4: Alunan Gesekan Biola di Sudut Kotagede',
        isi: `Tiga hari berselang, gerimis sore membasahi gang-gang sempit berdinding bata tua di Kotagede. Di beranda sebuah rumah joglo tempat Alana menginap, ia akhirnya membuka kotak biolanya yang berdebu.\n\nBulu busur biola menyentuh senar G perlahan. Sebuah nada rendah yang hangat menggema di udara basah. Alana memejamkan mata, membiarkan kenangan tentang deru roda kereta dan perbincangan malam itu memandu jemarinya.\n\nDari balik pagar kayu di seberang jalan, seorang pemuda berjaket kanvas cokelat yang sedang meneliti ukiran ventilasi rumah kuno tiba-tiba berhenti melangkah. Danu mengenali lagu itu—melodi yang dulu hanya berbentuk sketsa di serbet kertas.`
      }
    ]
  },
  {
    namaCerita: 'Penjaga Mercusuar Selat Sunda',
    sinopsis: 'Kisah Pak Harun yang telah empat puluh tahun merawat lentera mercusuar di pulau karang terpencil, mencatat rahasia para pelaut dan bisikan samudra.',
    genre: 'Drama Sastra',
    statusCerita: 'Ongoing',
    chapters: [
      {
        nomorBab: 1,
        judulBab: 'Bab 1: Lentera yang Tak Pernah Padam',
        isi: `Angin barat bertiup kencang menghempaskan buih ombak ke dinding batu karang setinggi tiga puluh meter. Di puncak menara putih setinggi empat puluh depa, Pak Harun menyalakan sumbu minyak mercusuar dengan korek api kayu.\n\nCahaya kuning keemasan berputar perlahan membelah kepekatan malam Selat Sunda, memberi aba-aba bagi kapal-kapal kargo dan perahu nelayan yang berlayar di batas gelombang.\n\n"Laut ini tidak pernah benar-benar tidur," gumam Pak Harun seraya membuka buku catatan log bersampul kanvas kusam yang telah mencatat ribuan badai selama empat dekade pengabdiannya.`
      },
      {
        nomorBab: 2,
        judulBab: 'Bab 2: Botol Kaca di Bibir Karang',
        isi: `Keesokan paginya saat air laut surut, Pak Harun menuruni tangga karang berlumut untuk memeriksa jaring penampung air tawar. Di antara celah karang tajam, sebotol kaca hijau lumut terdampar bersama rumpun rumput laut.\n\nDi dalamnya terdapat secarik kertas perkamen dengan segel lilin merah. Tidak ada koordinat kapal karam, melainkan sepenggal sajak bertinta hitam yang masih terbaca jelas:\n\n'Bagi siapa saja yang melihat cahaya di ujung tanjung, ketahuilah bahwa rindu seorang pelaut selalu pulang ke pelabuhan tempat ia pertama kali belajar mencintai.'\n\nPak Harun tersenyum tipis. Lautan tua itu ternyata selalu menyimpan cara untuk mengembalikan kata-kata kepada pemiliknya.`
      }
    ]
  }
];

// =========================================================================
// 2. GENERATOR PUISI (KAYA DIKSI, REFLEKTIF, BERJIWA)
// =========================================================================
const PUISI_THEMES = [
  {
    judulPrefix: ['Catatan Embun', 'Permenungan Senja', 'Sketsa Sunyi', 'Fragmen Waktu', 'Elegi Angin', 'Nyanyian Aksara', 'Gema Hening', 'Resonansi Rindu', 'Bait-Bait Malam', 'Lembayung Harapan'],
    judulSuffix: ['di Tepian Danau', 'di Batas Kota', 'pada Sehelai Daun Gugur', 'di Bawah Langit Hujan', 'di Sudut Beranda', 'Menjelang Fajar', 'di Ruang Perenungan', 'yang Pulang ke Hati', 'di Ujung Lorong Kenangan'],
    stanzas: [
      [
        'Di antara helai waktu yang melipat hari,\nkita belajar bahwa tak semua tanya butuh dijawab segera.\nKadang kala, cukup membiarkan angin membimbing resah\nmenjadi ketenangan yang mengendap di dasar dada.',
        'Ada jejak gerimis di pelataran kenangan,\nmenghapus debu-debu prasangka yang sempat bersarang.\nKita memandang ufuk dengan mata yang memaafkan,\nsebab hidup adalah jembatan menuju pulang.'
      ],
      [
        'Malam menggelar tirai hitam bertabur bintang,\nmengingatkan betapa kecilnya kita di hadapan semesta.\nNamun dalam sebait doa yang dipanjatkan tenang,\nseisi bumi terasa teduh tak terkira.',
        'Jangan biarkan kata-kata kehilangan jiwanya,\nrawatlah ia dengan ketulusan dan kejujuran rasa.\nSebab karya yang ditulis dengan kebenaran sanubari\nakan tetap bernyawa melintasi peradaban manusia.'
      ],
      [
        'Gemercik air di sungai kecil itu mengalir tanpa beban,\nmenyerahkan takdirnya pada muara yang sabar menanti.\nBegitulah seharusnya kita melangkah di jalan kehidupan,\ntabah saat terjal, rendah hati saat tinggi.',
        'Di tepian senja yang membungkus keheningan desa,\nkita simpan secuil syukur atas napas hari ini.\nEsok adalah lembaran baru yang menunggu digubah,\nmenjadi kidung kebaikan yang tak bertepi.'
      ],
      [
        'Aroma tanah basah selepas hujan petang,\nselalu sanggup membangkitkan ingatan yang tertidur lelap.\nBukan tentang luka masa lalu yang mengekang,\nmelainkan ketegaran yang membuat langkah kian mantap.',
        'Tataplah lilin kecil yang menyala di meja tulis,\nsederhana namun sanggup mengusir gulita gulita gulita.\nMenulislah, agar pikiranmu tak tergerus zaman,\nagar budi pekertimu abadi menjadi pelita.'
      ]
    ]
  }
];

// =========================================================================
// 3. GENERATOR PANTUN (BERIMA A-B-A-B DENGAN SAMPIRAN NUSANTARA)
// =========================================================================
const PANTUN_COLLECTIONS = [
  {
    judul: 'Pantun Budi Pekerti & Lentera Ilmu',
    isi: `Pohon beringin rindang daunnya,\nTempat berteduh musafir lelah.\nIndah pekerti tinggi ilmunya,\nDi mana berada membawa berkah.\n\nBunga melati harum semerbak,\nDipetik dara di tepi kolam.\nTutur yang manis hati tak retak,\nBagaikan embun penyejuk malam.`
  },
  {
    judul: 'Pantun Perantau & Kehangatan Kampung Halaman',
    isi: `Kayuh perahu ke Pulau Bangka,\nSinggah sejenak membeli lada.\nMeski jauh badan berkelana,\nTanah kelahiran selalu di dada.\n\nPucuk pauh selasih jantan,\nTumbuh subur di taman kota.\nBudi pekerti jadi ikatan,\nSahabat sejati teman cerita.`
  },
  {
    judul: 'Pantun Aksara & Warisan Sastra Nusantara',
    isi: `Burung camar terbang melayang,\nHinggap di dahan pohon cemara.\nMari membaca dengan senang,\nAksara indah warisan negara.\n\nKain songket tenunan Melayu,\nDipakai anggun hari raya.\nBahasa sastra tak lekang layu,\nMekar abadi sepanjang masa.`
  },
  {
    judul: 'Pantun Semangat Pagi & Meniti Cita',
    isi: `Fajar terbit menyapa bumi,\nEmbun berkilau di rumput liar.\nMari melangkah teguhkan hati,\nRajin berkarya pantang berputus asa.\n\nBilah bambu dibuat pagar,\nKokoh menahan angin kencang.\nHati yang tulus jiwa yang bugar,\nMenyambut esok masa depan terang.`
  },
  {
    judul: 'Pantun Sahabat Sejati & Kejujuran Jiwa',
    isi: `Pergi ke pasar membeli kurma,\nKurma manis dari Madinah.\nJika berteman saling menjaga,\nHati damai hidup berlimpah rahmat.\n\nBulan purnama terang benderang,\nBintang bertabur di cakrawala.\nOrang jujur disayang orang,\nLangkah mantap tenang sentosa.`
  }
];

// =========================================================================
// 4. GENERATOR CERPEN REFLEKTIF
// =========================================================================
const CERPEN_COLLECTIONS = [
  {
    judul: 'Sepotong Roti dan Secangkir Teh di Kedai Sudut Jalan',
    isi: `Hujan gerimis membungkus trotoar Jalan Malioboro saat Pak Samsul menyeka meja kayu jati di kedai teh kecil miliknya. Jarum jam antik di dinding menunjukkan pukul empat sore.\n\nSeorang gadis muda dengan tas ransel kanvas basah melangkah masuk, mencari tempat duduk paling pojok dekat jendela kaca. Matanya memandang cangkir teh melati yang mengepul hangat dengan tatapan yang menyiratkan kepenatan hidup.\n\n"Terkadang," ujar Pak Samsul ramah seraya meletakkan sepiring roti bakar selai srikaya, "jalan yang sedang kita lalui bukan buntu, Nak. Ia hanya sedang menyuruh kita berhenti sejenak untuk menikmati harumnya hujan."\n\nGadis itu menatap lelaki tua tersebut, lalu tersenyum tipis. Untuk pertama kalinya dalam minggu itu, pundaknya terasa lebih ringan.`
  },
  {
    judul: 'Lonceng Senja di Toko Buku Tua',
    isi: `Dentang lonceng kuningan berbunyi pelan saat pintu kaca Toko Buku 'Lentera Aksara' didorong terbuka. Udara beraroma kertas tua dan vanila seketika menyambut siapa saja yang melangkah ke dalamnya.\n\nBu Marta, wanita paruh baya penjaga toko, tersenyum ramah dari balik tumpukan novel sastra. Di hadapannya, seorang pemuda memegang sebuah buku antologi sajak Chairil Anwar dengan sampul yang sudah robek ujungnya.\n\n"Buku ini tidak untuk dijual, Nak," kata Bu Marta lembut. "Buku ini adalah buku titipan bagi siapa saja yang sedang mencari alasan untuk terus menulis."\n\nPemuda itu membuka halaman pertama. Di sana tertulis tangan sebuah pesan: 'Kata-katamu adalah pelita bagi orang lain yang sedang tersesat dalam gelap. Jangan padamkan apinya.'`
  },
  {
    judul: 'Arloji Kuno Pemutar Kenangan',
    isi: `Di bengkel arloji kecil berukuran dua kali tiga meter di Pasar Senen, kakek Darmo tekun mengamati roda-roda gerigi mikro menggunakan lup lensa kecil di matanya.\n\nSeorang pria muda datang membawa arloji saku buatan Swiss tahun 1950-an milik almarhum ayahnya. "Bisa diperbaiki, Kek? Arloji ini berhenti berdetik sejak sepuluh tahun lalu."\n\nKakek Darmo membersihkan pegasnya dengan tetesan minyak zaitun. Beberapa menit kemudian, suara detik halus kembali terdengar: tik... tok... tik... tok...\n\n"Waktu tidak pernah benar-benar berhenti, anak muda," ucap Kakek Darmo tersenyum bijak. "Yang berhenti seringkali adalah kesadaran kita untuk mensyukuri detik yang sedang berjalan hari ini."`
  }
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function kirimKaryaDenganRetry(payload, maxRetry = 3) {
  const targetUrl = `${API_BASE_URL}/api/karya`;

  for (let attempt = 1; attempt <= maxRetry; attempt++) {
    console.log(`[Percobaan ${attempt}/${maxRetry}] Mengunggah: "${payload.judul}" (${payload.kategori}) oleh ${payload.nama_pengguna}...`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Fadrodzak-Bot-Sastra/3.0 (Dynamic-Cron)'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await res.text();

      if (res.ok) {
        let resultJson = {};
        try {
          resultJson = JSON.parse(responseText);
        } catch {
          resultJson = { raw: responseText };
        }
        console.log(`✅ [SUKSES] Karya berhasil terbit otomatis di Fadrodzak!`);
        console.log(`ID Terbit: ${resultJson.id || 'N/A'}, Judul: "${payload.judul}"`);
        return true;
      } else {
        console.warn(`⚠️ [HTTP ${res.status}] Gagal pada percobaan ${attempt}: ${responseText}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Network Error] Gagal pada percobaan ${attempt}: ${err.message || err}`);
    }

    if (attempt < maxRetry) {
      const delayMs = attempt * 3000;
      console.log(`Menunggu ${delayMs / 1000} detik sebelum mencoba kembali...`);
      await sleep(delayMs);
    }
  }

  return false;
}

async function ambilDaftarJudulYangSudahAda() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/karya`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Fadrodzak-Bot-Sastra/3.0'
      }
    });
    if (!res.ok) return [];
    const list = await res.json();
    if (Array.isArray(list)) {
      return list.map((item) => (item.judul || '').trim().toLowerCase());
    }
  } catch (err) {
    console.warn(`[Bot Warning] Tidak dapat mengambil daftar karya dari web: ${err.message}`);
  }
  return [];
}

/**
 * ENGINE PEMBUAT KARYA DINAMIS TAK TERBATAS
 */
function buatKaryaBaru(existingTitles) {
  // 1. Coba cari bab lanjutan serial cerbung yang belum diterbitkan
  for (const serial of SERIAL_CERITA) {
    for (const chap of serial.chapters) {
      const judulLengkap = `${serial.namaCerita} — ${chap.judulBab}`;
      if (!existingTitles.includes(judulLengkap.toLowerCase())) {
        return {
          judul: judulLengkap,
          isi: chap.isi,
          kategori: 'Novel & Cerbung',
          namaCerita: serial.namaCerita,
          nomorBab: chap.nomorBab,
          judulBab: chap.judulBab,
          sinopsis: serial.sinopsis,
          statusCerita: serial.statusCerita,
          genre: serial.genre
        };
      }
    }
  }

  // 2. Coba cari Pantun yang belum diterbitkan
  for (const p of PANTUN_COLLECTIONS) {
    if (!existingTitles.includes(p.judul.toLowerCase())) {
      return {
        judul: p.judul,
        isi: p.isi,
        kategori: 'Pantun'
      };
    }
  }

  // 3. Coba cari Cerpen yang belum diterbitkan
  for (const c of CERPEN_COLLECTIONS) {
    if (!existingTitles.includes(c.judul.toLowerCase())) {
      return {
        judul: c.judul,
        isi: c.isi,
        kategori: 'Cerpen'
      };
    }
  }

  // 4. GENERATOR PUISI DINAMIS (Kombinasi Metafora & Refleksi Tanpa Batas)
  const tema = PUISI_THEMES[0];
  let judulPuisi = '';
  let isiPuisi = '';

  for (let attempt = 0; attempt < 50; attempt++) {
    const prefix = tema.judulPrefix[Math.floor(Math.random() * tema.judulPrefix.length)];
    const suffix = tema.judulSuffix[Math.floor(Math.random() * tema.judulSuffix.length)];
    const candidateTitle = `${prefix} ${suffix}`;

    if (!existingTitles.includes(candidateTitle.toLowerCase())) {
      judulPuisi = candidateTitle;
      const stanzaGroup = tema.stanzas[Math.floor(Math.random() * tema.stanzas.length)];
      isiPuisi = stanzaGroup.join('\n\n');
      break;
    }
  }

  if (judulPuisi) {
    return {
      judul: judulPuisi,
      isi: isiPuisi,
      kategori: 'Puisi'
    };
  }

  // Fallback unik dengan timestamp sastra bila ribuan kombinasi sudah terpakai
  const tanggalCantik = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return {
    judul: `Catatan Aksara Lembayung (${tanggalCantik})`,
    isi: `Di pelataran waktu yang tenang,\nkita merangkai kembali benang-benang harapan yang sempat terurai.\n\nBukan tentang seberapa jauh kita telah melangkah,\nmelainkan seberapa tulus hati kita saat berserah.\n\nAksara adalah pelita di tengah malam yang dingin,\nmenjaga nyala budi pekerti tetap terang di sanubari.`,
    kategori: 'Puisi'
  };
}

async function main() {
  console.log(`=== FADRODZAK DYNAMIC BOT SASTRA RUNNER ===`);
  console.log(`Waktu eksekusi: ${new Date().toISOString()}`);
  console.log(`Target URL: ${API_BASE_URL}`);

  // 1. Ambil seluruh judul yang sudah ada di platform
  const existingTitles = await ambilDaftarJudulYangSudahAda();
  console.log(`Ditemukan ${existingTitles.length} karya aktif di platform.`);

  // 2. Buat karya baru secara dinamis
  const karya = buatKaryaBaru(existingTitles);
  const penulis = PENULIS_LIST[Math.floor(Math.random() * PENULIS_LIST.length)];

  console.log(`Naskah baru yang akan diterbitkan: "${karya.judul}" [${karya.kategori}]`);

  const payload = {
    judul: karya.judul,
    isi_tulisan: karya.isi,
    isiTulisan: karya.isi,
    kategori: karya.kategori,
    nama_pengguna: penulis.nama,
    namaPengguna: penulis.nama,
    status_penulis: penulis.status,
    statusPenulis: penulis.status,
    link_trakteer: penulis.trakteer,
    linkTrakteer: penulis.trakteer,
    nomor_bab: karya.nomorBab || null,
    nomorBab: karya.nomorBab || null,
    judul_bab: karya.judulBab || null,
    judulBab: karya.judulBab || null,
    nama_cerita: karya.namaCerita || null,
    namaCerita: karya.namaCerita || null,
    sinopsis: karya.sinopsis || null,
    status_cerita: karya.statusCerita || null,
    statusCerita: karya.statusCerita || null
  };

  const sukses = await kirimKaryaDenganRetry(payload);

  if (sukses) {
    console.log(`=== BOT SELESAI DENGAN STATUS BERHASIL ===`);
    process.exit(0);
  } else {
    console.error(`❌ [FATAL] Gagal menerbitkan karya setelah seluruh percobaan retry.`);
    process.exit(1);
  }
}

main();
