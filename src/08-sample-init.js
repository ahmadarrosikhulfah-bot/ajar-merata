/* ============ DATA CONTOH ============ */
function loadSample(){
  state = defaultState();
  Object.assign(state.profil, {kementerian:"kemendikdasmen", namaGuru:"Maria Ngadha, S.Pd.", nip:"-", sekolah:"SD Negeri Contoh Pesisir (fiktif)", npsn:"", kepala:"Yohanes Bata, S.Pd.", nipKepala:"-",
    desa:"Desa Tanjung Harapan", kabupaten:"Kabupaten Contoh", provinsi:"Nusa Tenggara Timur", kotaTtd:"Tanjung Harapan", daerah3T:true, jenis3T:"Terluar (pulau/pesisir terluar)",
    listrik:"Terbatas", internet:"Tidak ada", proyektor:false, printer:false, lab:false, perpustakaan:true,
    potensi:"Desa nelayan di pesisir; hutan bakau; rumput laut; kebun kelapa dan jagung; tenun ikat; gotong royong menarik perahu", bahasaIbu:"Bahasa daerah setempat; sebagian murid kelas 3 belum lancar berbahasa Indonesia"});
  const p = newPkg();
  Object.assign(p, {kementerian:"kemendikdasmen", jenjang:"SD", kelas:"4", mapel:"Ilmu Pengetahuan Alam dan Sosial (IPAS)", menitJP:35, jadwal:{1:0,2:3,3:0,4:2,5:0,6:0},
    jumlahMurid:"14", kelasRangkap:"Kelas 3 (6 murid) dan kelas 4 (8 murid) belajar di satu ruang", catatanMurid:"Banyak murid membantu orang tua melaut atau ke kebun sepulang sekolah; 3 murid belum lancar membaca; murid senang belajar di luar kelas.", kbc:false,
    cpSumber:"Keputusan Kepala BSKAP No. 046/H/KR/2025",
    cpTeks:"Pemahaman IPAS\n[CONTOH UNTUK MENCOBA APLIKASI — bukan kutipan CP resmi. Ganti dengan teks CP resmi.] Murid mengidentifikasi bagian tumbuhan dan fungsinya, wujud zat dan perubahannya, gaya dan pengaruhnya dalam kehidupan sehari-hari, serta keragaman budaya, kearifan lokal, dan potensi daerah tempat tinggalnya.\n\nKeterampilan Proses\n[CONTOH] Murid mengamati fenomena di sekitarnya, mengajukan pertanyaan, melakukan penyelidikan sederhana, mencatat data, menarik kesimpulan, dan mengomunikasikan hasilnya secara lisan dan tertulis."});
  p.elemen = [
    {id:"e1", nama:"Pemahaman IPAS", teks:"[CONTOH] Murid mengidentifikasi bagian tumbuhan dan fungsinya, wujud zat dan perubahannya, gaya dan pengaruhnya dalam kehidupan sehari-hari, serta keragaman budaya, kearifan lokal, dan potensi daerah tempat tinggalnya."},
    {id:"e2", nama:"Keterampilan Proses", teks:"[CONTOH] Murid mengamati fenomena di sekitarnya, mengajukan pertanyaan, melakukan penyelidikan sederhana, mencatat data, menarik kesimpulan, dan mengomunikasikan hasilnya secara lisan dan tertulis."}
  ];
  const T = (e, tp, materi, jp, sem, dpl) => ({id:uid(), elemenId:e, elemen:e === "e1" ? "Pemahaman IPAS" : "Keterampilan Proses", tp, materi, jp, semester:sem, dpl, cinta:[]});
  p.atp = [
    T("e1", "Murid mampu menyebutkan bagian tumbuhan (akar, batang, daun, bunga, buah) dan fungsinya dengan mengamati tumbuhan di sekitar sekolah, seperti kelapa dan bakau.", "Bagian tumbuhan dan fungsinya", 30, 1, ["Penalaran Kritis","Komunikasi"]),
    T("e2", "Murid mampu mengamati dan mencatat pertumbuhan tanaman jagung selama dua minggu dalam tabel sederhana.", "Pengamatan dan pencatatan data", 20, 1, ["Kemandirian","Penalaran Kritis"]),
    T("e1", "Murid mampu menjelaskan cara tumbuhan bakau menyesuaikan diri dengan lingkungan pantai dan manfaat bakau bagi desa.", "Adaptasi tumbuhan; manfaat hutan bakau", 30, 1, ["Penalaran Kritis","Kewargaan"]),
    T("e1", "Murid mampu membedakan wujud zat padat, cair, dan gas melalui benda di rumah dan di laut.", "Wujud zat", 30, 1, ["Penalaran Kritis","Kolaborasi"]),
    T("e1", "Murid mampu menjelaskan perubahan wujud zat (mencair, membeku, menguap, mengembun) melalui percobaan sederhana membuat garam dari air laut.", "Perubahan wujud zat", 35, 2, ["Penalaran Kritis","Kreativitas"]),
    T("e1", "Murid mampu menunjukkan pengaruh gaya (dorongan dan tarikan) pada gerak benda melalui kegiatan menarik perahu dan permainan tradisional.", "Gaya dan gerak", 30, 2, ["Kolaborasi","Kesehatan"]),
    T("e1", "Murid mampu menceritakan keragaman budaya dan kearifan lokal desanya, seperti tenun ikat dan gotong royong.", "Keragaman budaya dan kearifan lokal", 35, 2, ["Kewargaan","Komunikasi"]),
    T("e2", "Murid mampu menyajikan hasil penyelidikan sederhana tentang potensi daerah (rumput laut atau kelapa) secara lisan dan tulisan.", "Mengomunikasikan hasil penyelidikan", 20, 2, ["Komunikasi","Kreativitas"])
  ];
  p.analisis = {kunci:"ABCDA BDCAB", data:"Ani; ABCDABDCAB\nBeni; ABCDABDCAA\nCika; ABCCABDCBB\nDion; ABDDABCCAB\nEka; CBCDABDDAB\nFani; ABCDACDCAB\nGusti; DBCAABDCBA\nHana; ABCDBBDCAB\nIwan; BACDABACAB\nJoni; ACCDABDCCB\nKiki; ABCDABDCAB\nLinus; ADBCABDBAD\nMega; ABCDABDCAB\nNoni; BBCDDBDCAC", hasil:null};
  state.pkgs = [p]; state.active = 0; state.step = 1;
}

/* ============ MULAI ============ */
(function init(){
  if (!document.getElementById("steps")) { document.body.insertAdjacentHTML("beforeend", '<p style="padding:24px">Ajar Merata gagal dimuat. Muat ulang halaman ini.</p>'); return; }
  const had = load();
  if (!had) { try { localStorage.setItem(STORE_KEY + ".test", "1"); localStorage.removeItem(STORE_KEY + ".test"); } catch (e) { storageOK = false; } }
  applyFont();
  render();
  if (!state.ui.welcomed) openWelcome();
})();
