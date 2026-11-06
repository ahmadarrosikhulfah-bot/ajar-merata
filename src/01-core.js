"use strict";
/* ============ KONFIGURASI AI (Gemini Canvas) ============
   Gemini Canvas mengisi kunci API secara otomatis bila apiKey dibiarkan kosong.
   Kunci bawaan Canvas hanya berlaku untuk model tertentu yang berganti dari waktu ke waktu.
   Aplikasi mencoba model di bawah satu per satu dan mengingat yang berhasil.
   Bila semua gagal, ubah daftar ini lewat Menu > Pengaturan AI, atau minta Gemini di Canvas
   "perbarui nama model di AI_MODELS ke model yang didukung Canvas saat ini". */
const apiKey = "";
/* Deteksi: berjalan di dalam Gemini Canvas atau tidak */
const IN_CANVAS = (function(){
  let src = location.href + " " + location.origin + " " + document.referrer;
  try { if (location.ancestorOrigins) for (let i = 0; i < location.ancestorOrigins.length; i++) src += " " + location.ancestorOrigins[i]; } catch (e) {}
  return /usercontent\.goog|googleusercontent\.com|gemini\.google\.com/.test(src);
})();
const USERKEY_STORE = "ajarMerata.userKey";
function userKey(){ try { return localStorage.getItem(USERKEY_STORE) || ""; } catch (e) { return ""; } }
function setUserKey(v){ try { if (v) localStorage.setItem(USERKEY_STORE, v); else localStorage.removeItem(USERKEY_STORE); } catch (e) {} }
function aiLangsung(){ return IN_CANVAS || !!userKey(); }
const AI_MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash-preview-09-2025", "gemini-2.5-flash", "gemini-flash-latest"];

const APP_VER = "1.1";
const CANVAS_URL = "https://share.gemini.google/lKV4p4D6IFDx";
const STORE_KEY = "ajarMerata.v1";
const ACUAN_DICEK = "6 November 2026";

/* ============ DATA ACUAN ============ */
const DPL = ["Keimanan dan Ketakwaan terhadap Tuhan Yang Maha Esa", "Kewargaan", "Penalaran Kritis", "Kreativitas", "Kolaborasi", "Kemandirian", "Kesehatan", "Komunikasi"];
const DPL_SHORT = ["Keimanan & Ketakwaan", "Kewargaan", "Penalaran Kritis", "Kreativitas", "Kolaborasi", "Kemandirian", "Kesehatan", "Komunikasi"];
const PANCA_CINTA = ["Cinta Allah dan Rasul-Nya", "Cinta Ilmu", "Cinta Lingkungan", "Cinta Diri dan Sesama", "Cinta Tanah Air"];

/* scope: all | agama (mapel Agama & BP di sekolah) | madrasah | kbc | cpmadrasah */
const REGS_DEFAULT = [
  {id:"r1", scope:"all", text:"Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 12 Tahun 2024 tentang Kurikulum pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah, sebagaimana diubah dengan Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 13 Tahun 2025."},
  {id:"r2", scope:"all", text:"Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 13 Tahun 2025 tentang Perubahan atas Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 12 Tahun 2024 tentang Kurikulum pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah."},
  {id:"r3", scope:"all", text:"Keputusan Kepala Badan Standar, Kurikulum, dan Asesmen Pendidikan Nomor 046/H/KR/2025 tentang Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah."},
  {id:"r4", scope:"agama", text:"Keputusan Kepala Badan Kebijakan Pendidikan Dasar dan Menengah (BKPDM) Nomor 020 Tahun 2026 tentang Perubahan atas Keputusan Kepala Badan Standar, Kurikulum, dan Asesmen Pendidikan Nomor 046/H/KR/2025 tentang Capaian Pembelajaran pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah (Capaian Pembelajaran Pendidikan Agama dan Budi Pekerti)."},
  {id:"r5", scope:"all", text:"Panduan Pembelajaran dan Asesmen Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah, Edisi Revisi Tahun 2025, Badan Standar, Kurikulum, dan Asesmen Pendidikan."},
  {id:"r6", scope:"all", text:"Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 10 Tahun 2025 tentang Standar Kompetensi Lulusan pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah."},
  {id:"r7", scope:"all", text:"Peraturan Menteri Pendidikan Dasar dan Menengah Nomor 12 Tahun 2025 tentang Standar Isi pada Pendidikan Anak Usia Dini, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah."},
  {id:"m1", scope:"madrasah", text:"Keputusan Menteri Agama Nomor 1503 Tahun 2025 tentang Perubahan atas Keputusan Menteri Agama Nomor 450 Tahun 2024 tentang Pedoman Implementasi Kurikulum pada Raudhatul Athfal, Madrasah Ibtidaiyah, Madrasah Tsanawiyah, Madrasah Aliyah, dan Madrasah Aliyah Kejuruan."},
  {id:"m2", scope:"kbc", text:"Keputusan Menteri Agama Nomor 512 Tahun 2026 tentang Pedoman Kurikulum Berbasis Cinta."},
  {id:"m3", scope:"kbcm", text:"Keputusan Direktur Jenderal Pendidikan Islam Nomor 6077 Tahun 2025 tentang Panduan Kurikulum Berbasis Cinta."},
  {id:"m4", scope:"cpmadrasah", text:"Keputusan Direktur Jenderal Pendidikan Islam Nomor 9941 Tahun 2025 tentang Capaian Pembelajaran Mata Pelajaran Pendidikan Agama Islam dan Bahasa Arab pada Madrasah."}
];
const SCOPE_LABEL = {all:"Semua sekolah & madrasah", agama:"Khusus mapel Agama dan Budi Pekerti (sekolah)", madrasah:"Khusus madrasah (Kemenag)", kbc:"Kurikulum Berbasis Cinta", kbcm:"Kurikulum Berbasis Cinta di madrasah", cpmadrasah:"Khusus PAI & Bahasa Arab di madrasah"};

const JENJANG = {
  kemendikdasmen: ["PAUD/TK", "SD", "SMP", "SMA", "SMK"],
  kemenag: ["RA", "MI", "MTs", "MA", "MAK"]
};
const KELAS = {"PAUD/TK":["Kelompok A","Kelompok B"], RA:["Kelompok A","Kelompok B"], SD:["1","2","3","4","5","6"], MI:["1","2","3","4","5","6"], SMP:["7","8","9"], MTs:["7","8","9"], SMA:["10","11","12"], MA:["10","11","12"], SMK:["10","11","12"], MAK:["10","11","12"]};
const MENIT = {"PAUD/TK":30, RA:30, SD:35, MI:35, SMP:40, MTs:40, SMA:45, MA:45, SMK:45, MAK:45};
const AGAMA_LIST = ["Islam","Kristen","Katolik","Hindu","Buddha","Khonghucu"];
const PAI_MADRASAH = ["Al-Qur'an Hadis","Akidah Akhlak","Fikih","Sejarah Kebudayaan Islam","Bahasa Arab"];
const PAI_MA_KEAGAMAAN = ["Tafsir","Ilmu Tafsir","Hadis","Ilmu Hadis","Ushul Fikih"];

function mapelOptions(p){
  const j = p.jenjang, k = +p.kelas || 0, kemenag = p.kementerian === "kemenag";
  if (j === "PAUD/TK") return ["Fase Fondasi (terpadu): Nilai Agama dan Budi Pekerti, Jati Diri, Dasar-dasar Literasi, Matematika, Sains, Teknologi, Rekayasa, dan Seni"];
  if (j === "RA") return ["Fase Fondasi (terpadu): Nilai Agama dan Budi Pekerti, Jati Diri, Dasar-dasar Literasi, Matematika, Sains, Teknologi, Rekayasa, dan Seni", "PAI dan Bahasa Arab (RA)"];
  let L = [];
  if (kemenag) L = L.concat(PAI_MADRASAH);
  else L.push("Pendidikan Agama dan Budi Pekerti", "Pendidikan Kepercayaan terhadap Tuhan Yang Maha Esa dan Budi Pekerti");
  L.push("Pendidikan Pancasila", "Bahasa Indonesia", "Matematika");
  if (["SD","MI"].includes(j)) { L.push("Ilmu Pengetahuan Alam dan Sosial (IPAS)", "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)", "Seni Musik", "Seni Rupa", "Seni Tari", "Seni Teater", "Bahasa Inggris"); if (k >= 5) L.push("Koding dan Kecerdasan Artifisial"); }
  if (["SMP","MTs"].includes(j)) L.push("Ilmu Pengetahuan Alam (IPA)", "Ilmu Pengetahuan Sosial (IPS)", "Bahasa Inggris", "PJOK", "Informatika", "Seni Musik", "Seni Rupa", "Seni Tari", "Seni Teater", "Prakarya", "Koding dan Kecerdasan Artifisial");
  if (["SMA","MA","SMK","MAK"].includes(j)) {
    L.push("Bahasa Inggris", "PJOK", "Sejarah", "Seni dan Budaya");
    if (["SMA","MA"].includes(j)) {
      if (k === 10) L.push("Ilmu Pengetahuan Alam (IPA)", "Ilmu Pengetahuan Sosial (IPS)", "Informatika");
      else L.push("Fisika","Kimia","Biologi","Ekonomi","Geografi","Sosiologi","Antropologi","Informatika","Matematika Tingkat Lanjut","Bahasa Indonesia Tingkat Lanjut","Bahasa Inggris Tingkat Lanjut");
      L.push("Koding dan Kecerdasan Artifisial");
      if (kemenag && k >= 11) L = L.concat(PAI_MA_KEAGAMAAN);
    } else {
      L.push("Informatika", "Projek Ilmu Pengetahuan Alam dan Sosial", "Dasar-dasar Program Keahlian", "Konsentrasi Keahlian", "Projek Kreatif dan Kewirausahaan", "Mata Pelajaran Pilihan");
    }
  }
  L.push("Muatan Lokal");
  return [...new Set(L)];
}
function faseOf(p){
  if (["PAUD/TK","RA"].includes(p.jenjang)) return "Fondasi";
  const k = +p.kelas;
  if (k <= 2) return "A"; if (k <= 4) return "B"; if (k <= 6) return "C"; if (k <= 9) return "D"; if (k === 10) return "E"; return "F";
}
function isAgamaSekolah(p){ return p.kementerian !== "kemenag" && /Agama dan Budi Pekerti|Kepercayaan/.test(p.mapel); }
function isPAIMadrasah(p){ return p.kementerian === "kemenag" && (PAI_MADRASAH.concat(PAI_MA_KEAGAMAAN).includes(p.mapel) || /PAI dan Bahasa Arab/.test(p.mapel)); }
function isAgama(p){ return isAgamaSekolah(p) || isPAIMadrasah(p); }
function mapelName(p){
  if (!p) return "";
  if (p.mapel === "__lain") return p.mapelLain || "Mapel lainnya";
  if (p.mapel === "Pendidikan Agama dan Budi Pekerti") return "Pendidikan Agama " + (p.agama || "Islam") + " dan Budi Pekerti";
  return p.mapel || "";
}
function cpSumberSaran(p){
  if (isPAIMadrasah(p)) return "Keputusan Dirjen Pendis No. 9941 Tahun 2025 (CP PAI & Bahasa Arab Madrasah)";
  if (isAgamaSekolah(p)) return "Keputusan Kepala BKPDM No. 020 Tahun 2026 (perubahan CP Agama & BP)";
  return "Keputusan Kepala BSKAP No. 046/H/KR/2025";
}
function regApplies(r, p){
  if (!p) return r.scope === "all";
  switch (r.scope) {
    case "all": return true;
    case "agama": return isAgamaSekolah(p);
    case "madrasah": return p.kementerian === "kemenag";
    case "kbc": return !!p.kbc;
    case "kbcm": return !!p.kbc && p.kementerian === "kemenag";
    case "cpmadrasah": return isPAIMadrasah(p);
    default: return true;
  }
}
function regsFor(p){
  const out = state.regs.filter(r => r.checked && regApplies(r, p)).map(r => r.text);
  (state.regsCustom || []).filter(r => r.checked && r.text.trim()).forEach(r => out.push(r.text.trim()));
  return out;
}
function satuanLabel(p){ return (p && p.kementerian === "kemenag") ? "Madrasah" : "Sekolah"; }

/* ============ STATE ============ */
function uid(){ return Math.random().toString(36).slice(2, 9); }
function newPkg(){
  return {id:uid(), kementerian:(state && state.profil && state.profil.kementerian) || "kemendikdasmen", jenjang:"SD", kelas:"4", mapel:"", mapelLain:"", agama:"Islam",
    jadwal:{1:0,2:0,3:0,4:0,5:0,6:0}, menitJP:35, jumlahMurid:"", kelasRangkap:"", catatanMurid:"", kbc:false,
    cpSumber:"", cpTeks:"", elemen:[], atp:[], kktp:{}, modul:{}, modulOpsi:{pertemuan:2, instruksi:""}, lkpd:{},
    asesmen:{rows:[]}, kisi:{tpIds:[], jumlah:10, bentuk:"Pilihan ganda", butir:[]}, analisis:{kunci:"", data:"", hasil:null}};
}
function defaultState(){
  return {
    ver: APP_VER,
    profil:{kementerian:"kemendikdasmen", namaGuru:"", nip:"", sekolah:"", npsn:"", kepala:"", nipKepala:"", desa:"", kabupaten:"", provinsi:"", kotaTtd:"",
      daerah3T:true, jenis3T:"Tertinggal", listrik:"Terbatas", internet:"Tidak stabil", proyektor:false, printer:false, lab:false, perpustakaan:true,
      potensi:"", bahasaIbu:"", tahunAjaran:"2026/2027"},
    kalender:{s1Mulai:"2026-07-13", s1Akhir:"2026-12-19", s2Mulai:"2027-01-04", s2Akhir:"2027-06-26",
      libur:"17-08-2026 HUT Kemerdekaan RI\n21-12-2026 sampai 02-01-2027 Libur semester ganjil\n28-06-2027 sampai 10-07-2027 Libur kenaikan kelas"},
    pkgs:[], active:0, step:1,
    regs: REGS_DEFAULT.map(r => Object.assign({checked: true}, r)),
    regsCustom: [],
    ai:{models: AI_MODELS.slice(), lastOk:"", alwaysManual:false},
    ui:{fs:0, welcomed:false},
    savedAt:"", exportedAt:""
  };
}
let state = null;
state = defaultState();
state.pkgs.push(newPkg());

function applyFont(){ const h = document.documentElement; h.classList.toggle("fs1", state.ui.fs === 1); h.classList.toggle("fs2", state.ui.fs === 2); }
function P(){ return state.pkgs[state.active] || state.pkgs[0]; }

/* ============ HELPERS ============ */
function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function nl2br(s){ return esc(s).replace(/\n/g, "<br>"); }
function asText(v){ if (v == null) return ""; if (Array.isArray(v)) return v.map(asText).join("\n"); if (typeof v === "object") return Object.values(v).map(asText).join("\n"); return String(v); }
function getPath(path){
  const parts = path.split("."); let o = parts[0] === "pkg" ? P() : state; if (parts[0] === "pkg") parts.shift();
  for (const k of parts) { if (o == null) return undefined; o = o[k]; } return o;
}
function setPath(path, val){
  const parts = path.split("."); let o = parts[0] === "pkg" ? P() : state; if (parts[0] === "pkg") parts.shift();
  for (let i = 0; i < parts.length - 1; i++) { if (o[parts[i]] == null) o[parts[i]] = {}; o = o[parts[i]]; }
  o[parts[parts.length - 1]] = val;
}
function toast(msg, ms){ const d = document.createElement("div"); d.className = "toast"; d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), ms || 2600); }
function fmtTgl(d){ const b = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"]; return d.getDate() + " " + b[d.getMonth()] + " " + d.getFullYear(); }
function parseISO(s){ if (!s) return null; const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null; }
function parseDMY(s){ const m = /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/.exec(s.trim()); return m ? new Date(+m[3], +m[2]-1, +m[1]) : null; }
function key(d){ return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate() + n); return x; }
const BULAN_SINGKAT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

/* ============ SIMPAN ============ */
let storageOK = true, saveTimer = null;
function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    state.savedAt = new Date().toISOString();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); storageOK = true; } catch (e) { storageOK = false; }
    renderSaveBar();
  }, 400);
}
function saveNow(){
  clearTimeout(saveTimer); state.savedAt = new Date().toISOString();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); storageOK = true; } catch (e) { storageOK = false; }
}
window.addEventListener("pagehide", saveNow);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveNow(); });
function load(){
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) { const s = JSON.parse(raw); applyLoaded(s); return true; } } catch (e) { storageOK = false; }
  return false;
}
function applyLoaded(s){
  const d = defaultState();
  state = Object.assign(d, s);
  state.profil = Object.assign(d.profil, s.profil || {});
  state.kalender = Object.assign(d.kalender, s.kalender || {});
  state.ai = Object.assign(d.ai, s.ai || {});
  state.ui = Object.assign(d.ui, s.ui || {});
  // gabungkan daftar regulasi: pertahankan centang lama, tambahkan yang baru
  const old = {}; (s.regs || []).forEach(r => old[r.id] = r);
  state.regs = REGS_DEFAULT.map(r => Object.assign({}, r, {checked: old[r.id] ? !!old[r.id].checked : true}));
  if (!Array.isArray(state.pkgs) || !state.pkgs.length) state.pkgs = [newPkg()];
  state.pkgs = state.pkgs.map(p => Object.assign(newPkg(), p));
  if (state.active >= state.pkgs.length) state.active = 0;
}
function downloadJSON(){
  state.exportedAt = new Date().toISOString();
  const nama = (state.profil.namaGuru || "guru").replace(/[^\w]+/g, "-").slice(0, 30);
  downloadBlob(new Blob([JSON.stringify(state, null, 1)], {type:"application/json"}), "ajar-merata-" + nama + "-" + key(new Date()) + ".json");
  save(); renderSaveBar();
}
function downloadBlob(blob, name){
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function openJSON(){
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { const s = JSON.parse(rd.result); if (!s.profil || !s.pkgs) throw new Error("bukan berkas Ajar Merata"); applyLoaded(s); save(); closeLayer(); renderAll(); toast("Berkas dibuka. Silakan lanjutkan pekerjaan."); } catch (e) { alertModal("Berkas tidak bisa dibuka", "Pastikan yang dipilih adalah berkas .json hasil unduhan Ajar Merata. (" + e.message + ")"); } };
    rd.readAsText(f);
  };
  inp.click();
}
function renderSaveBar(){
  const el = document.getElementById("saveBar"); if (!el) return;
  const t = state.savedAt ? new Date(state.savedAt) : null;
  const jam = t ? "pukul " + String(t.getHours()).padStart(2,"0") + "." + String(t.getMinutes()).padStart(2,"0") : "siap";
  el.innerHTML = storageOK
    ? `<span><span class="dot"></span> Tersimpan otomatis di perangkat ini (${jam})</span><span class="hint" style="opacity:.85">· Unduh berkas .json sebagai cadangan atau untuk pindah HP/laptop.</span><button class="btn sm" style="margin-left:auto" data-act="downloadJSON">⬇ Unduh .json</button>`
    : `<span><span class="dot warn"></span> Penyimpanan otomatis tidak tersedia di sini. Unduh .json sebelum menutup halaman.</span><button class="btn sm" style="margin-left:auto" data-act="downloadJSON">⬇ Unduh .json</button>`;
}
