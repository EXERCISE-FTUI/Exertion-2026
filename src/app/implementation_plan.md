# Project-Wide Responsiveness & Layout Audit

Tugas ini bertujuan untuk melakukan audit menyeluruh (pemeriksaan) terhadap semua halaman di proyek **Exertion 2026**, memperbaiki isu tata letak (tumpang tindih/overlap), dan memastikan tampilan yang responsif serta estetis di berbagai perangkat (Mobile, Tablet, Desktop).

## User Review Required

> [!IMPORTANT]
> Karena tugas ini menyentuh hampir **seluruh halaman aplikasi** (total sekitar 22 file `page.tsx` beserta komponennya), saya membaginya menjadi beberapa fase fokus. 
> 
> Silakan Anda tinjau rencana di bawah ini. Jika Anda menyetujuinya, saya akan mulai bekerja secara berurutan mulai dari Fase 1. Anda juga bisa menghentikan saya kapan saja jika ingin fokus ke halaman tertentu terlebih dahulu.

## Open Questions

> [!WARNING]
> 1. Apakah ada prioritas halaman tertentu yang ingin diselesaikan paling pertama? (Misalnya: Halaman Pendaftaran/Register sangat krusial, atau Halaman Dashboard?)
> 2. Untuk halaman **ExerMind** (sepertinya ini adalah fitur tes/game), apakah ada aturan khusus terkait ukurannya (misalnya tidak boleh diakses di HP, atau harus tetap bisa diskalakan di layar kecil)?

## Proposed Changes (Phased Approach)

Saya akan memeriksa dan memodifikasi baris kode untuk *Tailwind CSS classes* (seperti `sm:`, `md:`, `lg:`, `xl:`, `flex-wrap`, `overflow-hidden`, dsb.) untuk mengatasi elemen yang tumpang tindih.

---

### Fase 1: Halaman Autentikasi (Sisa Halaman Login)
Kita telah memperbaiki `sign-in` dan `sign-up`, tetapi halaman terkait (Lupa Password, Update Profile, dsb.) kemungkinan besar menggunakan cetakan SVG (layout bingkai) yang sama dan memiliki *bug scrollbar/tumpang tindih* yang sama.
- `src/app/(login)/forgot-password/page.tsx`
- `src/app/(login)/update-password/page.tsx`
- `src/app/(login)/update-name/page.tsx`
- `src/app/(login)/sign-up/email-verification/page.tsx`
- **Tindakan**: Menerapkan perbaikan *padding-top*, menyembunyikan scrollbar native, dan mengunci ukuran form agar responsif (seperti yang dilakukan pada `sign-in`).

---

### Fase 2: Halaman Registrasi Kompetisi (Multi-step Form)
- `src/app/register/page.tsx`
- `src/app/register/success/page.tsx`
- Komponen pendukung (`src/components/register/*`)
- **Tindakan**: Formulir registrasi biasanya rentan tumpang tindih di layar HP karena input teks yang terlalu lebar atau tombol yang saling mendesak. Saya akan mengaudit grid dan *spacing* (jarak antar elemen) agar tetap vertikal/rapi di layar kecil (`< 640px`) dan horizontal di desktop.

---

### Fase 3: Dashboard Peserta
- `src/app/dashboard/page.tsx`
- **Tindakan**: Mengecek kartu informasi tim, detail kompetisi, dan unggahan dokumen. Akan dipastikan pembungkus data tim (Team Info Box) merespons dengan baik di *mobile* menggunakan `flex-col` atau `grid-cols-1`, serta tidak tumpah/meluber keluar kontainer saat nama dokumennya sangat panjang.

---

### Fase 4: Sisa Halaman Landing Page (Home)
- `src/app/home/page.tsx`
- Komponen (`src/app/home/_components/*` seperti `Timeline`, `About`, `Header`, `Footer`)
- **Tindakan**: Kita sudah memperbaiki masalah jarak (*spacing*) dan tombol interaksi pada section Kompetisi. Saya akan memeriksa section lain seperti Timeline (sering patah di mobile) dan Our Values untuk memastikan SVG *background* menskalakan dengan sempurna pada ukuran layar tablet dan hp tanpa terpotong.

---

### Fase 5: ExerMind & Assessment (Gamification)
- `src/app/exermind/*`
- `src/app/multiple-choices/page.tsx`
- **Tindakan**: Karena ini melibatkan tata letak yang kompleks untuk tes/kuis, saya akan memastikan *timer*, tombol navigasi kuis, dan teks soal dapat terbaca di HP tanpa harus melakukan *zoom* atau gulir ke samping (horizontal scrolling).

## Verification Plan

### Automated Tests
- Menjalankan build TypeScript (`npm run build`) setelah setiap fase untuk memastikan perombakan UI tidak menyebabkan kerusakan *syntax* (seperti _error_ animasi yang terjadi sebelumnya).

### Manual Verification
- Saya akan meminta Anda (User) untuk memeriksa dan menguji UI dari *browser* dengan mengecilkan jendela (*Inspect Element -> Mobile View*) setiap kali satu fase selesai dieksekusi, sebelum saya melanjutkan ke fase berikutnya.
