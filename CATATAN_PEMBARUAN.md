# 📜 Catatan Pembaruan Proyek Fadrodzak (Release Notes)
**Platform Sastra & Komunitas Aksara Nusantara**

Dokumen ini merangkum seluruh pembaruan, perbaikan bug, optimalisasi performa, dan fitur-fitur baru yang telah berhasil diimplementasikan sejak proyek ini dikembangkan bersama **Antigravity**.

---

## 🎨 1. Desain Visual & Pengalaman Membaca (Reading Experience)
* **Palet Warna Bookpaper Alami:** Mengganti warna putih polos yang menyilaukan menjadi nuansa kertas buku klasik (*warm bookpaper* `#F5EFEB` dan krem gading `#FAF8F5`) dengan aksen terakota nusantara (`#C85A32`).
* **Dua Tema Membaca Eksklusif Baru:**
  * ☕ **Tema Kopi Tumpah (*Coffee Spill*):** Nuansa hangat menyerupai aroma kopi yang meresap ke serat kertas antik.
  * 📝 **Tema Kertas Catatan Bergaris (*Notebook Lined*):** Menghadirkan garis-garis biru halus khas buku catatan sastrawan era klasik.
* **Hierarki Tipografi Editorial:** Memperbesar skala judul naskah secara megah, memperhalus jarak antar-bait, dan merancang toolbar membaca yang tenang (*calm toolbar*) agar mata pembaca tidak lelah.
* **Pemutar Suara Suasana Imersif (Ambient Sound):** Suasana gerimis hujan, desau angin, dan malam sastra yang menemani pembaca saat menyelami naskah.
* **Generator Kartu Kutipan:** Fitur sorot teks untuk langsung mengubah kalimat puitis menjadi kartu gambar kutipan berestetika tinggi yang siap dibagikan ke Instagram Story atau WhatsApp.

---

## ✍️ 2. Fitur Kepenulisan & Mesin Novel Bersambung (Author Engine)
* **Fitur Edit Naskah Mandiri:** Tombol "Baca" di profil digantikan dengan menu **"Edit"** (`/karya/[id]/edit`) agar penulis dapat sewaktu-waktu merevisi salah tik (*typo*) atau mempercantik alur ceritanya.
* **Mesin Lanjut Bab Otomatis (+ Bab Baru):** Untuk naskah berkategori *Novel & Cerita Bersambung*, sistem otomatis menampilkan tombol **`+ Bab [N+1]`**. Penulis tidak perlu lagi mengetik ulang judul seri atau sinopsis cerita dari awal.
* **Validasi Sampul 2MB:** Proteksi ukuran gambar sampul maksimal 2MB di sisi server untuk menjaga kecepatan muat halaman dan mencegah lonjakan kuota database.

---

## 📱 3. Perombakan Total Halaman Profil (Mobile-App Native Redesign)
* **Tampilan Bersih Ala Aplikasi Seluler:** Mengubah halaman profil dari daftar gulung panjang (*endless scroll*) menjadi kartu profil modern yang rapi.
* **Bento Stats Bar (3 Kolom Ringkas):**
  * 📚 **Karya Ditulis**
  * ❤️ **Apresiasi Suka**
  * ⚡ **Poin Aksara (XP)**
* **Navigasi Tab Tersegmentasi (Segmented Tabs):**
  * ✍️ **Tab "Karya Saya" (Default):** Penulis langsung disuguhkan karya-karyanya di baris pertama, lengkap dengan tombol `+ Bab`, `Edit`, `Baca`, dan konfirmasi `Hapus`.
  * 🔖 **Tab "Rak Bacaan":** Menampung karya dan bab novel yang disimpan untuk dibaca kembali.
  * 🏆 **Tab "Prestasi":** Mengelompokkan statistik gamifikasi, level aksara, nyala pena harian (*streak*), dan lencana kehormatan.
* **Pembersihan Total Fitur Usang:** Menghapus seluruh tautan dan dependensi fitur *Book Corner* yang sudah tidak digunakan.

---

## 🧭 4. Navigasi & Tata Letak Responsif (Desktop & Mobile)
* **Navigasi Atas Desktop yang Rapi:** Menambahkan tombol **Belajar**, **Tulis**, dan tombol **Profil** berikon di baris atas (Header) khusus pengguna komputer/laptop, tanpa mengorbankan kebersihan antarmuka ponsel.
* **Perbaikan Panel Chat Merpati (Dove Chat):**
  * Mengatasi masalah jendela chat yang sebelumnya tertutup bilah navigasi bawah ponsel.
  * Menerapkan `100dvh` (Dynamic Viewport Height) sehingga kolom ketik chat tetap aman dan dapat diklik di semua ukuran layar dan saat zoom browser 125%.
* **Widget "Lanjutkan Membaca" (Last Read Widget):** Menampilkan banner pengingat bab terakhir yang sedang dibaca di halaman utama, dibangun dengan `useSyncExternalStore` yang 100% bebas dari masalah *hydration mismatch*.

---

## 🛡️ 5. Keamanan Data, Performa & UX Mikro
* **Proteksi Anti-Spam Apresiasi:** Mencegah manipulasi angka suka dengan cookie durasi 30 hari serta jeda proteksi (*cooldown* 3 detik) pada apresiasi mikro rasa sastra.
* **Pembersihan Berantai (Cascading Delete):** Saat sebuah karya dihapus oleh penulis, semua data reaksi, komentar, dan tafsir bait yang terkait ikut terhapus secara bersih tanpa merusak integritas database.
* **Sistem Notifikasi Toast Halus:** Memberikan respon visual elegan saat menyalin tautan karya, menyimpan rak bacaan, mengirim apresiasi rasa, dan mengirim tafsir bait.
* **Pemuatan Gambar Cepat (Lazy Loading & Async Decoding):** Mengurangi beban transfer data internet dengan memuat thumbnail feed dan foto profil secara bertahap saat digulir.
* **Standarisasi Format Waktu:** Menyeragamkan seluruh pembacaan waktu obrolan dan karya sastra menggunakan pustaka tanggal terpusat (`lib/date.ts`).

---

## 🔍 6. SEO & Kompatibilitas Mesin Pencari Google
* **Penyegaran Peta Situs (`app/sitemap.ts`):** 
  * Membersihkan rute 404/usang.
  * Menghilangkan duplikasi rute `/belajar`.
  * Menghasilkan struktur XML standar W3C yang valid (HTTP 200 OK).
* **Standarisasi `robots.txt`:** Menghilangkan direktif usang (*Host*) agar patuh pada standar Googlebot terbaru.
* **Stabilitas Build Next.js 16:** Memastikan seluruh modul terkompilasi bersih tanpa *warning* maupun *error* pada kompilasi Webpack di Vercel.
