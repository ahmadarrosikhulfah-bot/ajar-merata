# Ajar Merata

Aplikasi gratis untuk menyusun perangkat ajar Kurikulum Merdeka dengan pendekatan Pembelajaran Mendalam dan Kurikulum Berbasis Cinta. Aplikasi ini dibuat untuk guru di daerah 3T (tertinggal, terdepan, terluar) dan bisa dipakai guru mana pun, dari TK sampai SMA/SMK serta RA sampai MA/MAK.

Seluruh aplikasi berupa satu berkas `index.html`. Anda tidak perlu server, akun, atau biaya.

## Cara memakai

**Lewat link (paling mudah).** Buka halaman GitHub Pages proyek ini di HP atau laptop. Anda bisa langsung menyusun kalender, Prota, Promes, dan analisis soal. Untuk tombol AI, tersedia dua cara:

1. **Mode salin-prompt.** Aplikasi menyiapkan perintah. Anda menyalinnya ke Gemini, ChatGPT, atau Meta AI di WhatsApp, lalu menempelkan jawabannya kembali ke aplikasi.
2. **Kunci API Gemini pribadi.** Buat kunci gratis di [aistudio.google.com/apikey](https://aistudio.google.com/apikey), lalu tempel di Menu › Pengaturan AI. Kunci hanya tersimpan di perangkat Anda.

**Lewat Gemini Canvas (AI langsung).** Buka link Canvas yang dibagikan pengelola. Di Canvas, AI berjalan dengan akun Google Anda sendiri.

## Alur 13 langkah

| No | Langkah | AI |
|---|---|---|
| 1 | Profil guru dan sekolah, termasuk kondisi sarana dan potensi lokal | Tidak |
| 2 | Paket mengajar: jenjang, kelas, mapel, jadwal, kelas rangkap | Tidak |
| 3 | Kalender dan minggu efektif | Tidak |
| 4 | Capaian Pembelajaran (guru menempel CP resmi) | Tidak |
| 5 | Alur Tujuan Pembelajaran (ATP) | Ya |
| 6 | Program Tahunan | Tidak |
| 7 | Program Semester | Tidak |
| 8 | Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) | Ya |
| 9 | Modul Ajar Pembelajaran Mendalam (5 bagian) | Ya |
| 10 | Lembar Kerja Murid | Ya |
| 11 | Rencana Asesmen | Ya |
| 12 | Kisi-kisi, kartu soal, dan naskah soal | Ya |
| 13 | Analisis butir soal (kesukaran, daya beda, pengecoh, KR-20) | Tidak |

Setiap langkah menghasilkan dokumen Word lengkap dengan identitas, landasan regulasi, dan kolom tanda tangan.

## Fitur untuk sekolah 3T

- AI menyesuaikan kegiatan dengan listrik, internet, proyektor, dan printer yang benar-benar tersedia.
- Guru kelas rangkap mendapat kegiatan yang dibedakan per tingkat kelas.
- Potensi daerah dan bahasa ibu murid masuk ke contoh dan kegiatan awal.
- Satu guru bisa memegang beberapa paket mapel sekaligus.
- Isian tersimpan otomatis di perangkat. Berkas `.json` cadangan bisa Anda kirim lewat WhatsApp atau flashdisk.

## Acuan

Daftar acuan diperiksa per 6 November 2026 dan bisa diubah di Menu › Acuan hukum. AI dilarang mengarang nomor regulasi, judul buku, atau kutipan ayat dan hadis. Untuk dalil, guru menulis sendiri dari sumber yang sahih. Periksa status setiap regulasi di kanal resmi Kemendikdasmen dan Kemenag sebelum dokumen ditandatangani.

## Memasang di Gemini Canvas

Pakai berkas kecil `canvas.html`. Berkas ini hanya berisi tampilan dan memuat skrip aplikasi (`app.js`) dari repositori ini lewat jsDelivr, jadi Gemini tidak perlu menyalin ratusan kilobita kode.

1. Buka `canvas.html` di repositori ini, lalu tekan **Copy raw file**.
2. Di [gemini.google.com](https://gemini.google.com), nyalakan **Canvas** (menu + › Alat lainnya), tempel kodenya, lalu tulis: *Tampilkan kode HTML ini di Canvas persis apa adanya. Jangan ubah kodenya.*
3. Tekan **Share** untuk mendapat link.

Setiap perubahan yang Anda kirim ke `app.js` di cabang `main` ikut sampai ke link Canvas setelah cache jsDelivr diperbarui (paling lama sekitar 12 jam).

Bila tombol AI di Canvas menolak dengan HTTP 403 atau 404, Google sudah mengganti model yang dilayani kunci Canvas. Perbarui daftar model di Menu › Pengaturan AI, atau ubah konstanta `AI_MODELS` di `src/01-core.js`.

## Pengembangan

Kode sumber ada di folder `src/`. Jalankan `python3 build.py` untuk membuat `index.html` (versi lengkap), `app.js`, dan `canvas.html`.

## Lisensi

MIT. Anda boleh memakai, mengubah, dan membagikan aplikasi ini secara bebas.
