/* ============ EKSPOR WORD ============ */
function wordBtns(kind, label){
  return `<button class="btn pri" data-act="wordDl" data-arg="${kind}">📄 Unduh Word${label ? ": " + esc(label) : ""}</button><button class="btn" data-act="wordCopy" data-arg="${kind}">📋 Salin untuk Word${label ? " (" + esc(label) + ")" : ""}</button>`;
}
function docShell(title, body, landscape){
  const page = landscape ? "size:29.7cm 21cm;mso-page-orientation:landscape;margin:1.5cm 1.5cm 1.5cm 1.5cm;" : "size:21cm 29.7cm;margin:2cm 2cm 2cm 2.5cm;";
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(title)}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
  <style>@page Section1{${page}} div.Section1{page:Section1}
  body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.35}
  h1{font-size:14pt;text-align:center;margin:0 0 4pt} h2{font-size:12.5pt;margin:12pt 0 4pt} h3{font-size:12pt;margin:10pt 0 3pt}
  p.sub{text-align:center;margin:0 0 10pt}
  table{border-collapse:collapse;width:100%} td,th{border:1px solid #000;padding:3pt 5pt;vertical-align:top;font-size:11pt}
  th{background:#e8e8e8} table.id td{border:none;padding:1pt 4pt} table.ttd td{border:none;text-align:center;padding:2pt}
  .c,.num{text-align:center} td.hl{background:#d9ead3;text-align:center;font-weight:bold} .small{font-size:10pt} ol,ul{margin-top:2pt;margin-bottom:2pt}</style></head>
  <body><div class="Section1">${body}</div></body></html>`;
}
function identitas(p, extra){
  const pr = state.profil;
  const rows = [[satuanLabel(p), pr.sekolah], ["Nama guru", pr.namaGuru], ["NIP/NUPTK", pr.nip], ["Mata pelajaran", mapelName(p)], ["Kelas / Fase", p.kelas + " / Fase " + faseOf(p) + (p.kelasRangkap ? " (kelas rangkap: " + p.kelasRangkap + ")" : "")], ["Tahun ajaran", pr.tahunAjaran]].concat(extra || []);
  return `<table class="id">${rows.filter(r => r[1] !== undefined).map(r => `<tr><td style="width:30%">${esc(r[0])}</td><td style="width:2%">:</td><td>${esc(r[1] || "")}</td></tr>`).join("")}</table>`;
}
function landasan(p){
  const r = regsFor(p);
  if (!r.length) return "";
  return `<h2>Landasan Regulasi</h2><ol class="small">${r.map(x => `<li>${esc(x)}</li>`).join("")}</ol>`;
}
function ttd(p){
  const pr = state.profil;
  return `<br><table class="ttd"><tr><td style="width:50%">Mengetahui,<br>Kepala ${satuanLabel(p)}</td><td>${esc(pr.kotaTtd || pr.kabupaten || "...........")}, ${fmtTgl(new Date())}<br>Guru ${esc(mapelName(p))}</td></tr>
  <tr><td><br><br><br><b><u>${esc(pr.kepala || "..............................")}</u></b><br>NIP. ${esc(pr.nipKepala || "-")}</td><td><br><br><br><b><u>${esc(pr.namaGuru || "..............................")}</u></b><br>NIP. ${esc(pr.nip || "-")}</td></tr></table>`;
}
function judul(t, p){ return `<h1>${esc(t)}</h1><p class="sub">${esc(mapelName(p))} · Kelas ${esc(p.kelas)} · Fase ${faseOf(p)} · ${esc(state.profil.sekolah || "")}</p>`; }
function rubrikTbl(rub){ return `<table><tr><th>Aspek</th>${LEVEL.map(l => `<th>${l[1]}</th>`).join("")}</tr>${(rub || []).map(r => `<tr><td>${nl2br(r.aspek)}</td>${LEVEL.map(([f]) => `<td>${nl2br(r[f])}</td>`).join("")}</tr>`).join("")}</table>`; }
function ul(arr, ordered){ const a = toLines(arr); if (!a.length) return ""; const t = ordered ? "ol" : "ul"; return `<${t}>${a.map(x => `<li>${esc(x)}</li>`).join("")}</${t}>`; }
function objHTML(o){
  return Object.keys(o).map(k => {
    const v = o[k];
    if (Array.isArray(v) && v.length && typeof v[0] === "object") { const cols = Object.keys(v[0]); return `<h3>${esc(lbl(k))}</h3><table><tr>${cols.map(c => `<th>${esc(lbl(c))}</th>`).join("")}</tr>${v.map(r => `<tr>${cols.map(c => `<td>${nl2br(asText(r[c]))}</td>`).join("")}</tr>`).join("")}</table>`; }
    return `<h3>${esc(lbl(k))}</h3><p>${nl2br(asText(v))}</p>`;
  }).join("");
}

const DOC = {};
DOC.kalender = (p) => {
  const k = hitungKalender(p);
  const sem = (s, t) => { const byM = {}; k[s].weeks.forEach(w => { const kk = w.year + "-" + String(w.month).padStart(2, "0"); (byM[kk] = byM[kk] || {m:w.month, y:w.year, n:0, ef:0, jp:0}); byM[kk].n++; if (w.jp) byM[kk].ef++; byM[kk].jp += w.jp; });
    return `<h2>${t}</h2><table><tr><th>No</th><th>Bulan</th><th>Jumlah minggu</th><th>Minggu tidak efektif</th><th>Minggu efektif</th><th>JP</th></tr>${Object.keys(byM).sort().map((kk, i) => { const b = byM[kk]; return `<tr><td class="c">${i + 1}</td><td>${BULAN_SINGKAT[b.m]} ${b.y}</td><td class="c">${b.n}</td><td class="c">${b.n - b.ef}</td><td class="c">${b.ef}</td><td class="c">${b.jp}</td></tr>`; }).join("")}<tr><th colspan="2">Jumlah</th><th>${k[s].weeks.length}</th><th>${k[s].weeks.length - k[s].efektif}</th><th>${k[s].efektif}</th><th>${k[s].total}</th></tr></table>`; };
  const jad = [1,2,3,4,5,6].filter(d => +p.jadwal[d]).map(d => HARI[d] + " " + p.jadwal[d] + " JP").join(", ");
  const lib = String(state.kalender.libur || "").split(/\n/).filter(x => x.trim());
  return {title:"Rincian Minggu dan JP Efektif", landscape:false, body: judul("RINCIAN MINGGU DAN JAM PELAJARAN EFEKTIF", p) + identitas(p, [["Jadwal mapel", jad + " (" + jpPerMinggu(p) + " JP/minggu)"]]) + landasan(p) + sem("s1", "Semester 1") + sem("s2", "Semester 2") +
    `<p><b>Jumlah JP efektif setahun: ${k.s1.total + k.s2.total} JP.</b></p><h2>Hari libur dan kegiatan tanpa KBM</h2>${ul(lib)}` + ttd(p)};
};
DOC.cp = (p) => ({title:"Capaian Pembelajaran", body: judul("CAPAIAN PEMBELAJARAN", p) + identitas(p, [["Sumber CP", p.cpSumber || cpSumberSaran(p)]]) + landasan(p) +
  (p.elemen.length ? `<table><tr><th style="width:25%">Elemen</th><th>Capaian Pembelajaran</th></tr>${p.elemen.map(e => `<tr><td>${esc(e.nama)}</td><td>${nl2br(e.teks)}</td></tr>`).join("")}</table>` : `<p>${nl2br(p.cpTeks)}</p>`) + ttd(p)});
DOC.atp = (p) => ({title:"Alur Tujuan Pembelajaran", landscape:true, body: judul("ALUR TUJUAN PEMBELAJARAN (ATP)", p) + identitas(p) + landasan(p) +
  `<table><tr><th>No</th><th>Elemen</th><th>Tujuan Pembelajaran</th><th>Materi pokok</th><th>JP</th><th>Smt</th><th>Dimensi Profil Lulusan</th>${p.kbc ? "<th>Panca Cinta</th>" : ""}</tr>${p.atp.map((t, i) => `<tr><td class="c">${i + 1}</td><td>${esc(t.elemen)}</td><td>${esc(t.tp)}</td><td>${esc(t.materi)}</td><td class="c">${t.jp}</td><td class="c">${t.semester}</td><td>${esc((t.dpl || []).join(", "))}</td>${p.kbc ? `<td>${esc((t.cinta || []).join(", "))}</td>` : ""}</tr>`).join("")}<tr><th colspan="4">Jumlah JP</th><th>${atpJP(p)}</th><th colspan="${p.kbc ? 3 : 2}"></th></tr></table>` + ttd(p)});
DOC.prota = (p) => { const k = hitungKalender(p); return {title:"Program Tahunan", body: judul("PROGRAM TAHUNAN (PROTA)", p) + identitas(p) + landasan(p) +
  `<table><tr><th>Smt</th><th>No</th><th>Tujuan Pembelajaran</th><th>Materi pokok</th><th>JP</th></tr>${[1,2].map(s => p.atp.filter(t => +t.semester === s).map((t, i, a) => `<tr>${i === 0 ? `<td class="c" rowspan="${a.length + 1}">${s}</td>` : ""}<td class="c">${p.atp.indexOf(t) + 1}</td><td>${esc(t.tp)}</td><td>${esc(t.materi)}</td><td class="c">${t.jp}</td></tr>`).join("") + (p.atp.some(t => +t.semester === s) ? `<tr><td colspan="3"><b>Jumlah semester ${s}</b> (tersedia ${k["s" + s].total} JP)</td><td class="c"><b>${atpJP(p, s)}</b></td></tr>` : "")).join("")}<tr><th colspan="4">Jumlah setahun</th><th>${atpJP(p)}</th></tr></table>` + ttd(p)}; };
DOC.promes = (p) => ({title:"Program Semester", landscape:true, body: judul("PROGRAM SEMESTER (PROMES)", p) + identitas(p) + landasan(p) + `<h2>Semester 1</h2>${promesTable(p, 1, true)}<h2>Semester 2</h2>${promesTable(p, 2, true)}<p class="small">Angka di sel = JP yang dialokasikan pada minggu tersebut. Sel kosong berarsir = minggu tanpa pelajaran mapel ini.</p>` + ttd(p)});
DOC.kktp = (p) => ({title:"KKTP", body: judul("KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)", p) + identitas(p) + landasan(p) +
  p.atp.filter(t => p.kktp[t.id]).map(t => { const k = p.kktp[t.id]; return `<h2>TP ${p.atp.indexOf(t) + 1}: ${esc(t.tp)}</h2><h3>Kriteria ketercapaian</h3>${ul(k.kriteria, true)}<h3>Rubrik</h3>${rubrikTbl(k.rubrik)}${k.tindakLanjut ? `<h3>Tindak lanjut</h3><p>${nl2br(k.tindakLanjut)}</p>` : ""}`; }).join("") +
  `<h2>Interval nilai</h2><p>${nl2br(p.kktpInterval || "")}</p>` + ttd(p)});
DOC.modul = (p) => {
  const t = curTP(p, "pkg.modulOpsi.tpId"); if (!t) return null; const m = modulOf(p, t); const pa = m.parts;
  const el = elemenList(p).find(e => e.id === t.elemenId) || {teks:p.cpTeks};
  let b = judul("MODUL AJAR PEMBELAJARAN MENDALAM", p) + identitas(p, [["Topik", m.tema || t.materi], ["Alokasi waktu", t.jp + " JP × " + p.menitJP + " menit (" + m.pertemuan + " pertemuan)"]]) + landasan(p);
  b += `<h2>A. Identifikasi</h2>${pa.identifikasi ? objHTML(pa.identifikasi) : "<p>-</p>"}`;
  if (m.dalil) b += `<h3>Dalil/ayat/kutipan (ditulis guru)</h3><p>${nl2br(m.dalil)}</p>`;
  b += `<h2>B. Desain Pembelajaran</h2><h3>Capaian Pembelajaran</h3><p>${nl2br(el.teks || "")}</p><h3>Tujuan Pembelajaran</h3><p>${esc(t.tp)}</p>${pa.desain ? objHTML(pa.desain) : ""}`;
  b += `<h2>C. Pengalaman Belajar</h2>` + ((pa.pengalaman && pa.pengalaman.pertemuan) ? pa.pengalaman.pertemuan.map(x => `<h3>Pertemuan ${esc(x.ke)}</h3><table>${["kegiatan_awal","memahami","mengaplikasi","merefleksi","penutup","diferensiasi"].filter(f => x[f]).map(f => `<tr><td style="width:22%"><b>${esc(lbl(f))}</b></td><td>${nl2br(asText(x[f]))}</td></tr>`).join("")}</table>`).join("") : "<p>-</p>");
  b += `<h2>D. Asesmen</h2>${pa.asesmen ? objHTML(pa.asesmen) : "<p>-</p>"}`;
  if (p.kktp[t.id]) b += `<h3>Kriteria ketercapaian (KKTP)</h3>${ul(p.kktp[t.id].kriteria, true)}`;
  b += `<h2>E. Lampiran</h2>${pa.lampiran ? objHTML(pa.lampiran) : "<p>-</p>"}`;
  return {title:"Modul Ajar TP " + (p.atp.indexOf(t) + 1), body: b + ttd(p)};
};
DOC.lkpd = (p) => {
  const t = curTP(p, "pkg.lkpdTp"); if (!t) return null; const L = p.lkpd[t.id]; if (!L) return null;
  return {title:"LKPD TP " + (p.atp.indexOf(t) + 1), body: `<h1>LEMBAR KERJA MURID</h1><p class="sub">${esc(L.judul)}</p>
    <table class="id"><tr><td style="width:25%">Nama</td><td>: ..............................................</td></tr><tr><td>Kelas</td><td>: ..............................................</td></tr><tr><td>Mata pelajaran</td><td>: ${esc(mapelName(p))}</td></tr></table>
    <h2>Tujuan</h2><p>${nl2br(L.tujuan)}</p><h2>Petunjuk</h2>${ul(L.petunjuk, true)}${toLines(L.alat_bahan).length ? `<h2>Alat dan bahan</h2>${ul(L.alat_bahan)}` : ""}
    ${(L.kegiatan || []).map((k, i) => `<h2>Kegiatan ${i + 1}: ${esc(k.judul)}${k.untuk && !/semua/i.test(k.untuk) ? " (" + esc(k.untuk) + ")" : ""}</h2><h3>Langkah</h3>${ul(k.langkah, true)}<h3>Jawablah</h3>${toLines(k.pertanyaan).map((q, j) => `<p>${j + 1}. ${esc(q)}</p><p>.................................................................................................................</p>`).join("")}`).join("")}
    <h2>Refleksi</h2>${toLines(L.refleksi).map(q => `<p>${esc(q)}</p><p>.................................................................................................................</p>`).join("")}`};
};
DOC.asesmen = (p) => ({title:"Rencana Asesmen", landscape:true, body: judul("RENCANA ASESMEN", p) + identitas(p) + landasan(p) + `<table><tr>${AS_COLS.map(c => `<th>${c[1]}</th>`).join("")}</tr>${p.asesmen.rows.map(r => `<tr>${AS_COLS.map(([c]) => `<td>${nl2br(r[c])}</td>`).join("")}</tr>`).join("")}</table>` + ttd(p)});
DOC.kisi = (p) => { const B = p.kisi.butir; return {title:"Kisi-kisi dan Kartu Soal", body: judul("KISI-KISI DAN KARTU SOAL", p) + identitas(p) + landasan(p) +
  `<h2>Kisi-kisi</h2><table><tr><th>No</th><th>TP</th><th>Indikator soal</th><th>Level</th><th>Bentuk</th><th>Kunci</th></tr>${B.map((b, i) => `<tr><td class="c">${i + 1}</td><td>${esc(b.tp)}</td><td>${esc(b.indikator)}</td><td class="c">${esc(b.level)}</td><td>${esc(b.bentuk)}</td><td class="c">${esc(b.kunci)}</td></tr>`).join("")}</table>
  <h2>Kartu soal</h2>${B.map((b, i) => `<table style="margin-bottom:8pt"><tr><th style="width:22%">No. soal</th><td>${i + 1}</td></tr><tr><th>TP</th><td>${esc(b.tp)}</td></tr><tr><th>Indikator</th><td>${esc(b.indikator)}</td></tr><tr><th>Level / bentuk</th><td>${esc(b.level)} / ${esc(b.bentuk)}</td></tr><tr><th>Soal</th><td>${nl2br(b.soal)}${b.opsi ? "<br>" + Object.entries(b.opsi).map(([o, v]) => esc(o) + ". " + esc(v)).join("<br>") : ""}</td></tr><tr><th>Kunci</th><td>${esc(b.kunci)}</td></tr><tr><th>Pembahasan / pedoman skor</th><td>${nl2br(b.pembahasan)}</td></tr></table>`).join("")}` + ttd(p)}; };
DOC.naskah = (p) => ({title:"Naskah Soal", body: `<h1>${esc((state.profil.sekolah || "").toUpperCase())}</h1><p class="sub">Asesmen ${esc(mapelName(p))} · Kelas ${esc(p.kelas)} · Tahun ajaran ${esc(state.profil.tahunAjaran)}</p>
  <table class="id"><tr><td style="width:20%">Nama</td><td>: ........................................</td><td style="width:20%">Kelas</td><td>: ............</td></tr></table><p><b>Petunjuk:</b> Bacalah setiap soal dengan teliti. Kerjakan yang mudah lebih dahulu.</p>
  ${p.kisi.butir.map((b, i) => `<p>${i + 1}. ${nl2br(b.soal)}</p>${b.opsi ? `<p style="margin-left:18pt">${Object.entries(b.opsi).map(([o, v]) => esc(o) + ". " + esc(v)).join("<br>")}</p>` : "<p>.................................................................................................................</p>"}`).join("")}`});
DOC.analisis = (p) => { const h = p.analisis.hasil; if (!h) return null; return {title:"Analisis Butir Soal", body: judul("ANALISIS BUTIR SOAL", p) + identitas(p) + landasan(p) + analisisHTML(h).replace(/class="tbl-wrap"/g, "").replace(/class="note info"/g, "") + ttd(p)}; };

function buildDoc(kind){
  const p = P(); syncTxtFields(p); syncKKTP(p); syncLKPD(p);
  const d = DOC[kind] && DOC[kind](p);
  if (!d) { toast("Belum ada isi untuk diunduh di langkah ini."); return null; }
  d.body = d.body.replace(/<table(?![^>]*class="(?:id|ttd)")([^>]*)>/g, '<table border="1" cellspacing="0" cellpadding="4"$1>');
  return d;
}
ACT.wordDl = (kind) => {
  const d = buildDoc(kind); if (!d) return;
  const html = docShell(d.title, d.body, d.landscape);
  const nama = (d.title + " " + mapelName(P()) + " kelas " + P().kelas).replace(/[^\w\-]+/g, "_").slice(0, 80);
  downloadBlob(new Blob(["﻿", html], {type:"application/msword"}), nama + ".doc");
  toast("Dokumen Word diunduh. Bila Word bertanya, pilih Aktifkan Pengeditan.", 3500);
};
ACT.wordCopy = (kind) => {
  const d = buildDoc(kind); if (!d) return;
  const html = docShell(d.title, d.body, d.landscape);
  const plain = d.body.replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|tr|h\d|li)>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
    navigator.clipboard.write([new ClipboardItem({"text/html": new Blob([html], {type:"text/html"}), "text/plain": new Blob([plain], {type:"text/plain"})})]).then(() => toast("Tersalin. Tempel di Word atau Google Dokumen."), () => copyRich(d.body));
  } else copyRich(d.body);
};
function copyRich(body){
  const div = document.createElement("div"); div.innerHTML = body; div.style.position = "fixed"; div.style.left = "-9999px"; document.body.appendChild(div);
  const r = document.createRange(); r.selectNodeContents(div); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  try { document.execCommand("copy"); toast("Tersalin. Tempel di Word atau Google Dokumen."); } catch (e) { toast("Gagal menyalin. Pakai Unduh Word."); }
  s.removeAllRanges(); div.remove();
}
