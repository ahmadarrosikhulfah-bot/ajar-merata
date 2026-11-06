/* ============ LANGKAH 1–4 ============ */
const RENDER = {};
const AFTER = {};
function inp(bind, label, opt){
  opt = opt || {}; const v = getPath(bind);
  return `<div><label class="f">${label}${opt.hint ? ` <small>${opt.hint}</small>` : ""}</label><input class="in" ${opt.type ? `type="${opt.type}"` : ""} data-bind="${bind}" ${opt.num ? "data-num" : ""} ${opt.live ? `data-live="${opt.live}"` : ""} value="${esc(v)}" placeholder="${esc(opt.ph || "")}" ${opt.min != null ? `min="${opt.min}"` : ""}></div>`;
}
function sel(bind, label, options, opt){
  opt = opt || {}; const v = getPath(bind);
  const o = options.map(x => { const val = Array.isArray(x) ? x[0] : x, lab = Array.isArray(x) ? x[1] : x; return `<option value="${esc(val)}" ${String(v) === String(val) ? "selected" : ""}>${esc(lab)}</option>`; }).join("");
  return `<div><label class="f">${label}${opt.hint ? ` <small>${opt.hint}</small>` : ""}</label><select class="in" data-bind="${bind}" ${opt.rerender ? "data-rerender" : ""} ${opt.after ? `data-after="${opt.after}"` : ""}>${opt.empty ? `<option value="">${esc(opt.empty)}</option>` : ""}${o}</select></div>`;
}
function ta(bind, label, opt){
  opt = opt || {};
  return `<div><label class="f">${label}${opt.hint ? ` <small>${opt.hint}</small>` : ""}</label><textarea class="in" data-bind="${bind}" ${opt.live ? `data-live="${opt.live}"` : ""} style="${opt.h ? "min-height:" + opt.h + "px" : ""}" placeholder="${esc(opt.ph || "")}">${esc(getPath(bind))}</textarea></div>`;
}
function cb(bind, label){ return `<label class="chk"><input type="checkbox" data-bind="${bind}" ${getPath(bind) ? "checked" : ""}><span>${label}</span></label>`; }

/* ---- 1. Profil ---- */
RENDER[1] = () => {
  return `<section class="card">${head(1, "Data ini dicetak di setiap dokumen dan membantu AI memahami kondisi sekolah Anda.", [
    "Isi nama guru, satuan pendidikan, dan kepala sekolah/madrasah untuk kolom tanda tangan.",
    "Bagian <b>Kondisi sekolah</b> menentukan jenis kegiatan yang disarankan AI. Isi sesuai keadaan sebenarnya.",
    "Tulis potensi dan kearifan lokal sekonkret mungkin (misalnya: nelayan, kebun sagu, tenun ikat, upacara adat panen)."])}
    <h3>Guru dan satuan pendidikan</h3>
    <div class="grid2">
      ${sel("profil.kementerian", "Satuan pendidikan di bawah", [["kemendikdasmen","Kemendikdasmen (TK, SD, SMP, SMA, SMK)"],["kemenag","Kementerian Agama (RA, MI, MTs, MA, MAK)"]], {rerender:true, after:"profilKem"})}
      ${inp("profil.tahunAjaran", "Tahun ajaran", {ph:"2026/2027"})}
      ${inp("profil.namaGuru", "Nama guru (dengan gelar)", {ph:"Contoh: Maria Ngadha, S.Pd."})}
      ${inp("profil.nip", "NIP / NUPTK", {hint:"(kosongkan bila tidak ada)"})}
      ${inp("profil.sekolah", "Nama sekolah / madrasah")}
      ${inp("profil.npsn", "NPSN", {hint:"(opsional)"})}
      ${inp("profil.kepala", "Nama kepala sekolah / madrasah")}
      ${inp("profil.nipKepala", "NIP kepala", {hint:"(opsional)"})}
      ${inp("profil.desa", "Desa / kecamatan")}
      ${inp("profil.kabupaten", "Kabupaten / kota")}
      ${inp("profil.provinsi", "Provinsi")}
      ${inp("profil.kotaTtd", "Tempat tanda tangan", {hint:"(nama tempat di bawah dokumen)"})}
    </div>
    <h3 style="margin-top:18px">Kondisi sekolah</h3>
    ${cb("profil.daerah3T", "Sekolah berada di daerah 3T (tertinggal, terdepan, atau terluar)")}
    <div class="grid3">
      ${sel("profil.jenis3T", "Kategori daerah", ["Tertinggal","Terdepan (perbatasan)","Terluar (pulau/pesisir terluar)","Terpencil/sulit dijangkau","Belum tahu"])}
      ${sel("profil.listrik", "Listrik", ["Ada sepanjang hari","Terbatas","Tidak ada"])}
      ${sel("profil.internet", "Internet di sekolah", ["Stabil","Tidak stabil","Tidak ada"])}
    </div>
    <div class="grid2" style="margin-top:6px">
      ${cb("profil.proyektor", "Ada proyektor/TV yang bisa dipakai")}
      ${cb("profil.printer", "Ada printer/fotokopi yang mudah dijangkau")}
      ${cb("profil.lab", "Ada laboratorium/alat praktik")}
      ${cb("profil.perpustakaan", "Ada perpustakaan atau pojok baca")}
    </div>
    <div class="grid2" style="margin-top:8px">
      ${ta("profil.potensi", "Potensi dan kearifan lokal", {ph:"Contoh: desa nelayan, hutan bakau, kebun kelapa, tenun ikat, pasar mingguan, tradisi gotong royong membangun rumah", h:90})}
      ${ta("profil.bahasaIbu", "Bahasa ibu murid", {ph:"Contoh: bahasa Manggarai; sebagian murid kelas rendah belum lancar berbahasa Indonesia", h:90})}
    </div>
  </section>`;
};
AFTER.profilKem = () => {
  const p = P(); const k = state.profil.kementerian;
  if (p.kementerian !== k && !p.mapel) { p.kementerian = k; p.jenjang = JENJANG[k][1]; p.kelas = KELAS[p.jenjang][3] || KELAS[p.jenjang][0]; p.menitJP = MENIT[p.jenjang]; p.kbc = k === "kemenag"; }
};

/* ---- 2. Paket ---- */
RENDER[2] = () => {
  const p = P(), opts = mapelOptions(p);
  const list = state.pkgs.map((q, i) => `<div class="row" style="justify-content:space-between;border:1px solid ${i === state.active ? "var(--teal)" : "var(--line)"};background:${i === state.active ? "var(--teal-soft)" : "#fff"};border-radius:10px;padding:8px 10px;margin:6px 0">
    <span><b>${esc(mapelName(q) || "Paket baru (belum diisi)")}</b><br><span class="small muted">${q.kementerian === "kemenag" ? "Kemenag" : "Kemendikdasmen"} · ${esc(q.jenjang)} kelas ${esc(q.kelas)} · Fase ${faseOf(q)}${q.kelasRangkap ? " · rangkap" : ""}</span></span>
    <span class="row">${i === state.active ? '<span class="pill ok">Aktif</span>' : `<button class="btn sm" data-act="pkgPick" data-arg="${i}">Pilih</button>`}${state.pkgs.length > 1 ? `<button class="btn sm danger" data-act="pkgDel" data-arg="${i}">Hapus</button>` : ""}</span></div>`).join("");
  const days = [1,2,3,4,5,6].map(d => `<div><label class="f">${HARI[d]}</label><input class="in" type="number" min="0" max="12" data-bind="pkg.jadwal.${d}" data-num data-live="jpw" value="${esc(p.jadwal[d] || 0)}"></div>`).join("");
  return `<section class="card">${head(2, "Satu paket = satu mapel di satu kelas. Guru kelas atau guru yang memegang banyak mapel cukup menambah paket.", [
    "Pilih jenjang, kelas, dan mapel. Fase terisi otomatis.",
    "Isi <b>jadwal JP per hari</b> untuk mapel ini. Angka ini dipakai untuk menghitung JP setahun di Langkah 3.",
    "Bila Anda mengajar <b>kelas rangkap</b>, tulis kelas yang digabung. AI akan membedakan kegiatan per tingkat.",
    "Centang <b>Kurikulum Berbasis Cinta</b> untuk madrasah atau mapel PAI agar Panca Cinta terintegrasi."])}
    <h3>Daftar paket</h3>${list}
    <div class="row" style="margin:6px 0 16px"><button class="btn" data-act="pkgAdd">＋ Tambah paket baru</button><button class="btn" data-act="pkgCopy">⧉ Salin paket ini</button></div>
    <h3>Rincian paket aktif</h3>
    <div class="grid2">
      ${sel("pkg.kementerian", "Kementerian", [["kemendikdasmen","Kemendikdasmen"],["kemenag","Kementerian Agama"]], {rerender:true, after:"pkgKem"})}
      ${sel("pkg.jenjang", "Jenjang", JENJANG[p.kementerian], {rerender:true, after:"pkgJenjang"})}
      ${sel("pkg.kelas", "Kelas / kelompok", KELAS[p.jenjang] || [], {rerender:true, after:"pkgKelas"})}
      <div><label class="f">Fase</label><div class="in" style="background:var(--paper)">Fase ${faseOf(p)}</div></div>
      ${sel("pkg.mapel", "Mata pelajaran", opts.concat([["__lain","Lainnya (ketik sendiri)"]]), {rerender:true, after:"pkgMapel", empty:"— pilih —"})}
      ${p.mapel === "__lain" ? inp("pkg.mapelLain", "Nama mapel", {ph:"Contoh: Bahasa Daerah Manggarai"}) : ""}
      ${p.mapel === "Pendidikan Agama dan Budi Pekerti" ? sel("pkg.agama", "Agama", AGAMA_LIST, {rerender:true, after:"pkgMapel"}) : ""}
      ${inp("pkg.menitJP", "Menit per JP", {type:"number", num:true, hint:"(SD 35 · SMP 40 · SMA/SMK 45; PAUD: durasi kegiatan)"})}
    </div>
    <h3 style="margin-top:16px">Jadwal mapel ini (JP per hari)</h3>
    <div class="grid3" style="grid-template-columns:repeat(3,1fr)">${days}</div>
    <p class="small" id="jpwInfo"><b>${jpPerMinggu(p)} JP per minggu.</b> Isi 0 untuk hari tanpa jadwal mapel ini.</p>
    <h3 style="margin-top:12px">Murid dan kelas</h3>
    <div class="grid2">
      ${inp("pkg.jumlahMurid", "Jumlah murid", {ph:"Contoh: 14"})}
      ${inp("pkg.kelasRangkap", "Kelas rangkap", {ph:"Contoh: kelas 3 (6 murid) dan kelas 4 (8 murid) digabung", hint:"(kosongkan bila tidak)"})}
    </div>
    <div style="margin-top:10px">${ta("pkg.catatanMurid", "Catatan tentang murid", {ph:"Contoh: 4 murid belum lancar membaca; banyak murid membantu orang tua melaut pada pagi hari; 1 murid berkebutuhan khusus (low vision)", h:80})}</div>
    <div class="note ${p.kbc ? "ok" : "info"}" style="margin-top:12px">${cb("pkg.kbc", "<b>Integrasikan Kurikulum Berbasis Cinta (Panca Cinta)</b> — dianjurkan untuk madrasah dan mapel PAI.")}</div>
  </section>`;
};
LIVE.jpw = () => { const el = document.getElementById("jpwInfo"); if (el) el.innerHTML = `<b>${jpPerMinggu(P())} JP per minggu.</b> Isi 0 untuk hari tanpa jadwal mapel ini.`; renderNav(); };
AFTER.pkgKem = () => { const p = P(); p.jenjang = JENJANG[p.kementerian][1]; p.kelas = KELAS[p.jenjang][0]; p.mapel = ""; p.menitJP = MENIT[p.jenjang]; p.kbc = p.kementerian === "kemenag"; };
AFTER.pkgJenjang = () => { const p = P(); p.kelas = KELAS[p.jenjang][0]; p.menitJP = MENIT[p.jenjang]; if (!mapelOptions(p).includes(p.mapel) && p.mapel !== "__lain") p.mapel = ""; };
AFTER.pkgKelas = () => { const p = P(); if (!mapelOptions(p).includes(p.mapel) && p.mapel !== "__lain") p.mapel = ""; };
AFTER.pkgMapel = () => { const p = P(); if (p.kementerian === "kemenag" || (isAgamaSekolah(p) && p.agama === "Islam")) p.kbc = true; p.cpSumber = ""; };
ACT.pkgPick = (i) => { state.active = +i; save(); renderAll(); };
ACT.pkgAdd = () => { const q = newPkg(); q.kementerian = state.profil.kementerian; q.jenjang = P().jenjang; q.kelas = P().kelas; q.menitJP = P().menitJP; q.kbc = q.kementerian === "kemenag"; state.pkgs.push(q); state.active = state.pkgs.length - 1; save(); renderAll(); toast("Paket baru dibuat. Pilih mapelnya."); };
ACT.pkgCopy = () => { const q = JSON.parse(JSON.stringify(P())); q.id = uid(); q.mapel = ""; q.mapelLain = ""; q.cpTeks = ""; q.elemen = []; q.atp = []; q.kktp = {}; q.modul = {}; q.lkpd = {}; q.asesmen = {rows:[]}; q.kisi = {tpIds:[], jumlah:10, bentuk:"Pilihan ganda", butir:[]}; q.analisis = {kunci:"", data:"", hasil:null}; state.pkgs.push(q); state.active = state.pkgs.length - 1; save(); renderAll(); toast("Kelas, jadwal, dan catatan murid disalin. Pilih mapelnya."); };
ACT.pkgDel = (i) => confirmModal("Hapus paket?", "Semua isian paket <b>" + esc(mapelName(state.pkgs[+i]) || "ini") + "</b> akan hilang.", "Hapus", () => { state.pkgs.splice(+i, 1); state.active = 0; save(); renderAll(); });

/* ---- 3. Kalender ---- */
RENDER[3] = () => {
  const p = P();
  return `<section class="card">${head(3, "Hitung minggu efektif dan JP yang benar-benar tersedia. Hasilnya menjadi batas JP di ATP dan dasar Promes.", [
    "Isi tanggal awal dan akhir tiap semester sesuai kalender pendidikan dari dinas/kanwil daerah Anda.",
    "Tulis hari libur dan kegiatan yang meniadakan pelajaran, <b>satu baris satu kegiatan</b>: <code>DD-MM-YYYY Keterangan</code> atau <code>DD-MM-YYYY sampai DD-MM-YYYY Keterangan</code>.",
    "Masukkan juga minggu asesmen sumatif akhir semester bila pada minggu itu pelajaran biasa ditiadakan.",
    "JP dihitung dari jadwal mapel di Langkah 2. Kalender berlaku untuk semua paket; jadwal berbeda per paket."])}
    ${jpPerMinggu(p) ? "" : `<div class="note warn">Jadwal JP mapel ini masih 0. Isi dulu di <b>Langkah 2</b>. <button class="btn sm" data-act="go" data-arg="2">Buka Langkah 2</button></div>`}
    <div class="grid2">
      ${inp("kalender.s1Mulai", "Semester 1 mulai", {type:"date", live:"kal"})}
      ${inp("kalender.s1Akhir", "Semester 1 berakhir", {type:"date", live:"kal"})}
      ${inp("kalender.s2Mulai", "Semester 2 mulai", {type:"date", live:"kal"})}
      ${inp("kalender.s2Akhir", "Semester 2 berakhir", {type:"date", live:"kal"})}
    </div>
    <div style="margin-top:10px">${ta("kalender.libur", "Hari libur & kegiatan tanpa KBM", {live:"kal", h:150, ph:"17-08-2026 HUT Kemerdekaan RI\n07-12-2026 sampai 12-12-2026 Asesmen sumatif akhir semester"})}</div>
    <div id="kalOut">${kalSummary(p)}</div>
    <div class="row" style="margin-top:10px">${wordBtns("kalender")}</div>
  </section>`;
};
function kalSummary(p){
  const k = hitungKalender(p);
  const bad = k.bad.length ? `<div class="note bad">Baris berikut tidak terbaca dan diabaikan:<br>${k.bad.map(esc).join("<br>")}</div>` : "";
  const tbl = (s, title) => {
    const byM = {}; k[s].weeks.forEach(w => { const kk = w.year + "-" + String(w.month).padStart(2, "0"); (byM[kk] = byM[kk] || {m:w.month, y:w.year, n:0, ef:0, jp:0}); byM[kk].n++; if (w.jp > 0) byM[kk].ef++; byM[kk].jp += w.jp; });
    const rows = Object.keys(byM).sort().map(kk => { const b = byM[kk]; return `<tr><td>${BULAN_SINGKAT[b.m]} ${b.y}</td><td class="num">${b.n}</td><td class="num">${b.n - b.ef}</td><td class="num">${b.ef}</td><td class="num">${b.jp}</td></tr>`; }).join("");
    return `<h3 style="margin-top:14px">${title}</h3><div class="tbl-wrap"><table class="t"><tr><th>Bulan</th><th class="num">Minggu</th><th class="num">Tidak efektif</th><th class="num">Efektif</th><th class="num">JP</th></tr>${rows || '<tr><td colspan="5" class="muted">Tanggal belum lengkap.</td></tr>'}<tr><th>Jumlah</th><th class="num">${k[s].weeks.length}</th><th class="num">${k[s].weeks.length - k[s].efektif}</th><th class="num">${k[s].efektif}</th><th class="num">${k[s].total}</th></tr></table></div>`;
  };
  return bad + tbl("s1", "Semester 1 (ganjil)") + tbl("s2", "Semester 2 (genap)") +
    `<div class="note info"><b>JP tersedia setahun: ${k.s1.total + k.s2.total} JP</b> (Semester 1: ${k.s1.total} JP · Semester 2: ${k.s2.total} JP). Minggu dihitung efektif bila ada minimal satu pertemuan mapel ini.</div>`;
}
LIVE.kal = () => { const el = document.getElementById("kalOut"); if (el) el.innerHTML = kalSummary(P()); renderNav(); };

/* ---- 4. CP ---- */
RENDER[4] = () => {
  const p = P();
  if (!p.cpSumber) p.cpSumber = cpSumberSaran(p);
  const sumberOpts = ["Keputusan Kepala BSKAP No. 046/H/KR/2025", "Keputusan Kepala BKPDM No. 020 Tahun 2026 (perubahan CP Agama & BP)", "Keputusan Dirjen Pendis No. 9941 Tahun 2025 (CP PAI & Bahasa Arab Madrasah)", "Kurikulum muatan lokal daerah/satuan pendidikan"];
  const el = p.elemen.map((e, i) => `<div class="elem"><div class="row" style="justify-content:space-between"><b>Elemen ${i+1}</b><button class="btn sm danger" data-act="elDel" data-arg="${i}">Hapus</button></div>
    <input class="in" style="margin:6px 0" data-bind="pkg.elemen.${i}.nama" value="${esc(e.nama)}" placeholder="Nama elemen">
    <textarea class="in" data-bind="pkg.elemen.${i}.teks" placeholder="Teks CP elemen ini">${esc(e.teks)}</textarea></div>`).join("");
  return `<section class="card">${head(4, "CP adalah sumber semua dokumen berikutnya. Aplikasi tidak mengarang isi CP: salin teks resminya.", [
    "Buka dokumen CP resmi untuk mapel dan fase Anda (lihat sumber di bawah), salin bagian <b>Capaian Pembelajaran per elemen</b>.",
    "Tempel di kotak teks. Pisahkan tiap elemen dengan <b>satu baris kosong</b>, dan tulis nama elemen di baris pertama tiap bagian.",
    "Tekan <b>Pecah per elemen</b>. Memecah CP per elemen membuat ATP lebih rinci dan jawaban AI tidak terpotong.",
    "Untuk mapel Agama dan Budi Pekerti di sekolah, pakai CP hasil perubahan Kepka BKPDM 020/2026. Untuk PAI dan Bahasa Arab di madrasah, pakai Kepdirjen Pendis 9941/2025."])}
    ${needPkgInfo()}
    <div class="grid2">${sel("pkg.cpSumber", "Sumber dasar hukum CP", sumberOpts.includes(p.cpSumber) ? sumberOpts : sumberOpts.concat([p.cpSumber]))}<div><label class="f">Disarankan untuk paket ini</label><div class="in" style="background:var(--paper)">${esc(cpSumberSaran(p))}</div></div></div>
    <div class="note info small">Unduh dokumen CP dari kanal resmi Kemendikdasmen (untuk sekolah) atau Kemenag/Ditjen Pendis (untuk madrasah). Untuk CP Agama dan Budi Pekerti, BKPDM menegaskan bahwa perubahan 2026 hanya berlaku bagi mapel agama; mapel lain tetap memakai Kepka BSKAP 046/H/KR/2025.</div>
    <label class="f" style="margin-top:8px">Teks CP resmi — ${esc(mapelName(p) || "mapel")} Fase ${faseOf(p)}</label>
    <textarea class="in" data-bind="pkg.cpTeks" style="min-height:200px" placeholder="Nama Elemen 1&#10;Pada akhir Fase ..., murid mampu ...&#10;&#10;Nama Elemen 2&#10;...">${esc(p.cpTeks)}</textarea>
    <div class="row" style="margin:8px 0 14px"><button class="btn pri" data-act="cpSplit">✂ Pecah per elemen (baris kosong)</button><button class="btn" data-act="elAdd">＋ Tambah elemen manual</button></div>
    <h3>Elemen CP (${p.elemen.length})</h3>
    ${el || '<p class="small muted">Belum ada elemen. Anda tetap bisa lanjut: ATP akan dibuat dari seluruh teks CP sebagai satu elemen.</p>'}
    <div class="row" style="margin-top:10px">${wordBtns("cp")}</div>
  </section>`;
};
ACT.cpSplit = () => {
  const p = P(); const txt = p.cpTeks.trim();
  if (!txt) { toast("Tempel teks CP terlebih dahulu."); return; }
  const blocks = txt.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  p.elemen = blocks.map((b, i) => { const lines = b.split(/\n/); return lines.length > 1 && lines[0].length < 120 ? {id:uid(), nama:lines[0].replace(/[:：]\s*$/, "").trim(), teks:lines.slice(1).join("\n").trim()} : {id:uid(), nama:"Elemen " + (i + 1), teks:b}; });
  save(); render(); toast(p.elemen.length + " elemen dibuat. Periksa nama elemennya.");
};
ACT.elAdd = () => { P().elemen.push({id:uid(), nama:"", teks:""}); save(); render(); };
ACT.elDel = (i) => { P().elemen.splice(+i, 1); save(); render(); };
