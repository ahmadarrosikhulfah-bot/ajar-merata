/* ============ LANGKAH 9–13 ============ */
function tpSelect(bind, p){
  const cur = getPath(bind);
  return `<div><label class="f">Tujuan Pembelajaran</label><select class="in" data-bind="${bind}" data-rerender>${p.atp.map((t, i) => `<option value="${t.id}" ${cur === t.id ? "selected" : ""}>TP ${i + 1}: ${esc(t.tp.slice(0, 110))}</option>`).join("")}</select></div>`;
}
function curTP(p, bind){ let id = getPath(bind); let t = p.atp.find(x => x.id === id); if (!t && p.atp[0]) { t = p.atp[0]; setPath(bind, t.id); } return t; }
function linesArea(bind, label, arr, h){ return `<div><label class="f">${label} <small>(satu baris satu butir)</small></label><textarea class="in" data-bind="${bind}" style="min-height:${h || 80}px">${esc((arr || []).map(asText).join("\n"))}</textarea></div>`; }
function toLines(v){ return Array.isArray(v) ? v.map(asText) : String(v || "").split(/\n/).map(x => x.trim()).filter(Boolean); }

/* ---- 9. Modul ajar ---- */
const MODUL_PARTS = [
  {k:"identifikasi", t:"Identifikasi", d:"murid, materi, DPL" },
  {k:"desain", t:"Desain Pembelajaran", d:"lintas disiplin, praktik pedagogis, kemitraan, lingkungan, digital"},
  {k:"pengalaman", t:"Pengalaman Belajar", d:"awal, memahami, mengaplikasi, merefleksi, penutup"},
  {k:"asesmen", t:"Asesmen", d:"awal, proses, akhir"},
  {k:"lampiran", t:"Lampiran", d:"rubrik, bahan bacaan, glosarium, alat & bahan"}
];
const FIELD_LABEL = {murid:"Kesiapan dan karakteristik murid", materi:"Analisis materi pelajaran", dpl:"Dimensi Profil Lulusan", cinta:"Panca Cinta", rangkap:"Strategi kelas rangkap",
  lintas_disiplin:"Keterkaitan lintas disiplin ilmu", topik:"Topik pembelajaran", praktik_pedagogis:"Praktik pedagogis (model, strategi, metode)", kemitraan:"Kemitraan pembelajaran", lingkungan:"Lingkungan pembelajaran", digital:"Pemanfaatan digital",
  awal:"Asesmen awal", proses:"Asesmen proses (formatif)", akhir:"Asesmen akhir (sumatif)",
  bahan_bacaan:"Bahan bacaan guru dan murid", glosarium:"Glosarium", media:"Alat, bahan, dan media dari lingkungan sekitar", rubrik:"Rubrik penilaian",
  dimensi:"Dimensi", nilai:"Nilai", wujud:"Wujud dalam pembelajaran", istilah:"Istilah", arti:"Arti", aspek:"Aspek", l1:"Perlu bimbingan", l2:"Cukup", l3:"Baik", l4:"Sangat baik",
  ke:"Pertemuan", kegiatan_awal:"Kegiatan awal", memahami:"Memahami", mengaplikasi:"Mengaplikasi", merefleksi:"Merefleksi", penutup:"Kegiatan penutup", diferensiasi:"Diferensiasi / kelas rangkap"};
function lbl(k){ return FIELD_LABEL[k] || k.replace(/_/g, " ").replace(/^./, c => c.toUpperCase()); }
function editObj(base, obj){
  return Object.keys(obj).map(k => {
    const v = obj[k], path = base + "." + k;
    if (Array.isArray(v) && v.length && typeof v[0] === "object") {
      const cols = Object.keys(v[0]);
      return `<label class="f" style="margin-top:8px">${esc(lbl(k))}</label><div class="tbl-wrap"><table class="t"><tr>${cols.map(c => `<th>${esc(lbl(c))}</th>`).join("")}</tr>${v.map((row, i) => `<tr>${cols.map(c => `<td><textarea class="cell-in" rows="${c === "ke" ? 1 : 3}" data-bind="${path}.${i}.${c}">${esc(asText(row[c]))}</textarea></td>`).join("")}</tr>`).join("")}</table></div>`;
    }
    return `<label class="f" style="margin-top:8px">${esc(lbl(k))}</label><textarea class="in" data-bind="${path}" style="min-height:${String(asText(v)).length > 260 ? 140 : 80}px">${esc(asText(v))}</textarea>`;
  }).join("");
}
function modulOf(p, t){ if (!p.modul[t.id]) p.modul[t.id] = {tema:t.materi || "", pertemuan:+p.modulOpsi.pertemuan || 2, dalil:"", parts:{}}; return p.modul[t.id]; }
RENDER[9] = () => {
  const p = P(); if (!p.atp.length) return `<section class="card">${head(9, "Susun modul ajar per TP dengan pendekatan pembelajaran mendalam.", null)}${needATP()}</section>`;
  const t = curTP(p, "pkg.modulOpsi.tpId"); const m = modulOf(p, t);
  const jpPer = m.pertemuan ? Math.round((+t.jp || 0) / m.pertemuan * 10) / 10 : t.jp;
  const parts = MODUL_PARTS.map((x, i) => {
    const has = !!m.parts[x.k];
    return `<div class="sec"><h4><span>${i + 1}. ${x.t} <span class="small muted">(${x.d})</span></span><button class="btn sm ai ${has ? "done" : ""}" data-act="genModul" data-arg="${x.k}">${has ? "↻ Buat ulang" : "✦ Klik " + (i + 1)}</button></h4>
      ${x.k === "desain" ? `<div class="kv small" style="margin:4px 0 8px"><div>CP elemen</div><div>${esc((elemenList(p).find(e => e.id === t.elemenId) || {teks:p.cpTeks}).teks.slice(0, 500))}</div><div>Tujuan pembelajaran</div><div>${esc(t.tp)}</div></div>` : ""}
      ${has ? editObj("pkg.modul." + t.id + ".parts." + x.k, m.parts[x.k]) : '<p class="small muted">Belum dibuat.</p>'}</div>`;
  }).join("");
  return `<section class="card">${head(9, "Modul ajar per TP dalam lima bagian: Identifikasi, Desain Pembelajaran, Pengalaman Belajar, Asesmen, dan Lampiran.", [
    "Pilih TP, lalu sesuaikan topik dan jumlah pertemuan. Alokasi waktu dihitung dari JP TP dibagi jumlah pertemuan.",
    "Tulis rencana Anda di <b>Instruksi khusus</b> (misalnya: \"pertemuan 2 belajar di pantai\") agar hasil AI sesuai kelas Anda.",
    "Tekan Klik 1 sampai Klik 5 berurutan. Setiap bagian memakai hasil bagian sebelumnya agar modul utuh.",
    "Semua isi bisa disunting langsung. Unduh Word setelah kelima bagian terisi."])}
    <div class="grid2">${tpSelect("pkg.modulOpsi.tpId", p)}
      ${inp("pkg.modul." + t.id + ".tema", "Topik / tema")}
      ${inp("pkg.modul." + t.id + ".pertemuan", "Jumlah pertemuan", {type:"number", num:true, min:1})}
      <div><label class="f">Alokasi waktu</label><div class="in" style="background:var(--paper)">${t.jp} JP × ${p.menitJP} menit · ±${jpPer} JP per pertemuan</div></div></div>
    <div style="margin-top:8px">${ta("pkg.modulOpsi.instruksi", "Instruksi khusus untuk AI (berlaku untuk semua TP)", {ph:"Contoh: murid belajar di luar kelas memakai benda di sekitar sekolah; hindari tugas yang perlu dicetak; gunakan permainan tradisional", h:70})}</div>
    ${isAgama(p) ? `<div class="note warn" style="margin-top:10px"><b>Ayat, hadis, atau kutipan kitab suci tidak dibuat oleh AI.</b> Tulis sendiri beserta sumbernya:<textarea class="in" style="margin-top:6px" data-bind="pkg.modul.${t.id}.dalil" placeholder="Contoh: QS ... ayat ... (tulis teks dan terjemahan dari mushaf/sumber sahih)">${esc(m.dalil || "")}</textarea></div>` : ""}
    ${parts}
    <div class="row" style="margin-top:12px">${wordBtns("modul")}</div></section>`;
};
ACT.genModul = (part) => {
  const p = P(); const t = curTP(p, "pkg.modulOpsi.tpId"); const m = modulOf(p, t);
  const el = elemenList(p).find(e => e.id === t.elemenId) || {nama:t.elemen, teks:p.cpTeks};
  const prev = Object.keys(m.parts).filter(k => k !== part).map(k => k.toUpperCase() + ": " + JSON.stringify(m.parts[k]).slice(0, 1800)).join("\n");
  const base = [
    "MODUL AJAR PEMBELAJARAN MENDALAM untuk satu TP.",
    "Elemen CP: " + el.nama + "\nTeks CP: " + (el.teks || "").slice(0, 1500),
    "TP: " + t.tp, "Materi pokok: " + t.materi, "Topik: " + (m.tema || t.materi),
    "DPL terkait: " + (t.dpl || []).join(", ") + (p.kbc ? "\nPanca Cinta terkait: " + (t.cinta || []).join(", ") : ""),
    "Alokasi: " + t.jp + " JP (" + p.menitJP + " menit/JP) dalam " + m.pertemuan + " pertemuan.",
    "Instruksi khusus guru: " + (p.modulOpsi.instruksi || "(tidak ada)"),
    prev ? "BAGIAN YANG SUDAH ADA (jaga konsistensi):\n" + prev : ""
  ].join("\n");
  const kbcLine = p.kbc ? ',"cinta":[{"nilai":"Cinta Ilmu","wujud":"..."}]' : "";
  const spec = {
    identifikasi: "TUGAS: tulis bagian IDENTIFIKASI.\n- murid: kesiapan, pengetahuan awal, minat, latar belakang, dan kebutuhan belajar murid (pakai catatan guru dan konteks daerah).\n- materi: jenis pengetahuan, relevansi dengan kehidupan murid di daerahnya, tingkat kesulitan, struktur materi, integrasi nilai dan karakter.\n- dpl: dimensi yang dikembangkan dan wujudnya.\n- rangkap: strategi bila kelas rangkap (tulis \"Tidak ada kelas rangkap\" bila tidak).\n" + 'FORMAT JSON: {"murid":"...","materi":"...","dpl":[{"dimensi":"...","wujud":"..."}]' + kbcLine + ',"rangkap":"..."}',
    desain: "TUGAS: tulis bagian DESAIN PEMBELAJARAN.\n- lintas_disiplin, topik, praktik_pedagogis (model/strategi/metode yang mendukung pembelajaran mendalam), kemitraan (orang tua, tokoh adat/agama, nelayan/petani, puskesmas, dsb. yang ada di sekitar), lingkungan (ruang fisik, budaya belajar; manfaatkan alam sekitar), digital (bila sarana terbatas, tulis alternatif tanpa perangkat digital).\n" + 'FORMAT JSON: {"lintas_disiplin":"...","topik":"...","praktik_pedagogis":"...","kemitraan":"...","lingkungan":"...","digital":"..."}',
    pengalaman: "TUGAS: tulis bagian PENGALAMAN BELAJAR untuk " + m.pertemuan + " pertemuan. Setiap pertemuan memuat kegiatan_awal (orientasi, apersepsi, motivasi; boleh memakai bahasa ibu murid), memahami, mengaplikasi, merefleksi, penutup, serta diferensiasi (termasuk pembedaan tingkat kelas bila kelas rangkap). Tulis langkah bernomor yang konkret dengan perkiraan menit, dan tandai prinsip [berkesadaran]/[bermakna]/[menggembirakan] di kegiatan yang relevan.\n" + 'FORMAT JSON: {"pertemuan":[{"ke":1,"kegiatan_awal":"1. ... (10 menit)","memahami":"...","mengaplikasi":"...","merefleksi":"...","penutup":"...","diferensiasi":"..."}]}',
    asesmen: "TUGAS: tulis bagian ASESMEN. Untuk awal, proses (formatif), dan akhir (sumatif): sebutkan tujuan, teknik, instrumen, dan contoh butir/tugas singkat. Instrumen harus bisa dipakai tanpa cetak (misalnya ditulis di papan, lisan, unjuk kerja).\n" + 'FORMAT JSON: {"awal":"...","proses":"...","akhir":"..."}',
    lampiran: "TUGAS: tulis bagian LAMPIRAN: rubrik penilaian 3–4 aspek, bahan bacaan ringkas untuk guru dan murid (sederhana, sesuai usia), glosarium 4–8 istilah, serta alat dan bahan dari lingkungan sekitar. Jangan mencantumkan judul buku atau tautan yang tidak pasti.\n" + 'FORMAT JSON: {"rubrik":[{"aspek":"...","l1":"...","l2":"...","l3":"...","l4":"..."}],"bahan_bacaan":"...","glosarium":[{"istilah":"...","arti":"..."}],"media":"..."}'
  }[part];
  runAI({label:"Menyusun " + MODUL_PARTS.find(x => x.k === part).t + "...", prompt: base + "\n\n" + spec, onResult: (o) => {
    if (!o || typeof o !== "object") throw new Error("bukan objek");
    if (part === "pengalaman" && !Array.isArray(o.pertemuan)) throw new Error("daftar pertemuan kosong");
    m.parts[part] = o;
  }});
};

/* ---- 10. LKPD ---- */
RENDER[10] = () => {
  const p = P(); if (!p.atp.length) return `<section class="card">${head(10, "Lembar kerja murid per TP.", null)}${needATP()}</section>`;
  const t = curTP(p, "pkg.lkpdTp"); const L = p.lkpd[t.id];
  let body = '<p class="small muted">Belum dibuat.</p>';
  if (L) {
    const base = "pkg.lkpd." + t.id;
    body = `${inp(base + ".judul", "Judul")}<div style="margin-top:8px">${ta(base + ".tujuan", "Tujuan", {h:60})}</div>
      <div class="grid2" style="margin-top:8px">${linesArea(base + ".petunjukTxt", "Petunjuk", L.petunjuk)}${linesArea(base + ".alatTxt", "Alat dan bahan", L.alat_bahan)}</div>
      ${(L.kegiatan || []).map((k, i) => `<div class="sec"><h4>Kegiatan ${i + 1}</h4><div class="grid2">${inp(base + ".kegiatan." + i + ".judul", "Judul kegiatan")}${inp(base + ".kegiatan." + i + ".untuk", "Untuk", {ph:"Semua murid / Kelas 3 / Kelas 4"})}</div>
        <div class="grid2" style="margin-top:8px">${linesArea(base + ".kegiatan." + i + ".langkahTxt", "Langkah", k.langkah, 100)}${linesArea(base + ".kegiatan." + i + ".pertanyaanTxt", "Pertanyaan / tugas", k.pertanyaan, 100)}</div></div>`).join("")}
      ${linesArea(base + ".refleksiTxt", "Refleksi murid", L.refleksi)}`;
  }
  return `<section class="card">${head(10, "Lembar kerja murid yang bisa ditulis di papan atau buku tulis bila tidak bisa mencetak.", [
    "Pilih TP lalu tekan Buat LKPD. Bila Anda sudah membuat modul untuk TP ini, LKPD menyesuaikan kegiatan modul.",
    "Untuk kelas rangkap, AI membuat kegiatan berbeda per tingkat kelas (lihat kolom <b>Untuk</b>).",
    "Sunting bahasa agar sesuai kemampuan membaca murid Anda."])}
    <div class="grid2">${tpSelect("pkg.lkpdTp", p)}<div style="align-self:end"><button class="btn ai ${L ? "done" : ""}" data-act="genLKPD">${L ? "↻ Buat ulang LKPD" : "✦ Buat LKPD (1 klik AI)"}</button></div></div>
    <div style="margin-top:12px">${body}</div>
    <div class="row" style="margin-top:12px">${wordBtns("lkpd")}</div></section>`;
};
function syncLKPD(p){
  Object.values(p.lkpd || {}).forEach(L => {
    [["petunjukTxt","petunjuk"],["alatTxt","alat_bahan"],["refleksiTxt","refleksi"]].forEach(([a, b]) => { if (L[a] !== undefined) { L[b] = toLines(L[a]); delete L[a]; } });
    (L.kegiatan || []).forEach(k => { if (k.langkahTxt !== undefined) { k.langkah = toLines(k.langkahTxt); delete k.langkahTxt; } if (k.pertanyaanTxt !== undefined) { k.pertanyaan = toLines(k.pertanyaanTxt); delete k.pertanyaanTxt; } });
  });
}
ACT.genLKPD = () => {
  const p = P(); const t = curTP(p, "pkg.lkpdTp"); const m = p.modul[t.id];
  const prompt = [
    "TUGAS: Susun Lembar Kerja Murid (LKPD) untuk TP berikut. Bahasa sederhana sesuai usia murid kelas " + p.kelas + ".",
    "TP: " + t.tp, "Materi: " + t.materi,
    m && m.parts.pengalaman ? "Kegiatan di modul ajar: " + JSON.stringify(m.parts.pengalaman).slice(0, 1800) : "",
    "Ketentuan: 2–3 kegiatan yang memakai benda dan situasi di sekitar murid; bisa dikerjakan di buku tulis tanpa dicetak; pertanyaan dari mudah ke menantang; ada refleksi singkat. Bila kelas rangkap, buat kegiatan terpisah per tingkat kelas dan isi kolom untuk.",
    'FORMAT JSON: {"judul":"...","tujuan":"...","petunjuk":["..."],"alat_bahan":["..."],"kegiatan":[{"judul":"...","untuk":"Semua murid","langkah":["..."],"pertanyaan":["..."]}],"refleksi":["..."]}'
  ].join("\n");
  runAI({label:"Menyusun LKPD...", prompt, onResult: (o) => {
    if (!o.kegiatan) throw new Error("kegiatan kosong");
    p.lkpd[t.id] = {judul:asText(o.judul), tujuan:asText(o.tujuan), petunjuk:toLines(o.petunjuk), alat_bahan:toLines(o.alat_bahan), kegiatan:(o.kegiatan || []).map(k => ({judul:asText(k.judul), untuk:asText(k.untuk || "Semua murid"), langkah:toLines(k.langkah), pertanyaan:toLines(k.pertanyaan)})), refleksi:toLines(o.refleksi)};
  }});
};

/* ---- 11. Rencana asesmen ---- */
const AS_COLS = [["tp","TP"],["diagnostik","Asesmen awal/diagnostik"],["formatif","Asesmen formatif"],["sumatif","Asesmen sumatif"],["teknik","Teknik"],["instrumen","Instrumen"],["waktu","Waktu"]];
RENDER[11] = () => {
  const p = P();
  const rows = p.asesmen.rows.map((r, i) => `<tr>${AS_COLS.map(([c]) => `<td style="min-width:${c === "tp" ? 60 : 140}px"><textarea class="cell-in" rows="3" data-bind="pkg.asesmen.rows.${i}.${c}">${esc(r[c])}</textarea></td>`).join("")}<td class="num"><button class="btn sm ghost danger" data-act="asDel" data-arg="${i}">✕</button></td></tr>`).join("");
  return `<section class="card">${head(11, "Rencana asesmen setahun: kapan dan bagaimana kemajuan murid diperiksa untuk setiap TP.", [
    "Tekan tombol per semester. AI menyusun rencana untuk semua TP di semester itu (paling banyak 8 TP per klik; bila lebih, tekan lagi untuk sisanya).",
    "Utamakan teknik yang tidak memerlukan cetak: observasi, unjuk kerja, tanya jawab, portofolio buku tulis."])}
    ${needATP()}
    <div class="row"><button class="btn ai" data-act="genAs" data-arg="1">✦ Rencana Semester 1</button><button class="btn ai" data-act="genAs" data-arg="2">✦ Rencana Semester 2</button><button class="btn" data-act="asAdd">＋ Baris manual</button>${p.asesmen.rows.length ? '<button class="btn danger" data-act="asClear">Kosongkan</button>' : ""}</div>
    <div class="tbl-wrap" style="margin-top:10px"><table class="t"><tr>${AS_COLS.map(c => `<th>${c[1]}</th>`).join("")}<th></th></tr>${rows || `<tr><td colspan="8" class="muted">Belum ada.</td></tr>`}</table></div>
    <div class="row" style="margin-top:12px">${wordBtns("asesmen")}</div></section>`;
};
ACT.asAdd = () => { P().asesmen.rows.push({tp:"", diagnostik:"", formatif:"", sumatif:"", teknik:"", instrumen:"", waktu:""}); save(); render(); };
ACT.asDel = (i) => { P().asesmen.rows.splice(+i, 1); save(); render(); };
ACT.asClear = () => confirmModal("Kosongkan rencana asesmen?", "Semua baris akan dihapus.", "Kosongkan", () => { P().asesmen.rows = []; save(); render(); });
ACT.genAs = (sem) => {
  const p = P(); const done = p.asesmen.rows.map(r => r.tp);
  const tps = p.atp.filter(t => +t.semester === +sem && !done.includes(tpLabel(p, t))).slice(0, 8);
  if (!tps.length) { toast("Semua TP semester " + sem + " sudah ada di rencana, atau belum ada TP."); return; }
  const prompt = ["TUGAS: Susun rencana asesmen untuk TP berikut (semester " + sem + ").", tps.map(t => tpLabel(p, t) + ": " + t.tp).join("\n"),
    "Untuk tiap TP isi: diagnostik (bila perlu), formatif, sumatif (boleh \"digabung dengan TP lain\" bila wajar), teknik, instrumen, dan waktu (minggu/pertemuan). Pakai teknik yang realistis tanpa cetak bila sarana terbatas.",
    'FORMAT JSON: {"rows":[{"tp":"TP 1","diagnostik":"...","formatif":"...","sumatif":"...","teknik":"...","instrumen":"...","waktu":"..."}]}'].join("\n");
  runAI({label:"Menyusun rencana asesmen...", prompt, onResult: (o) => {
    const arr = o.rows || o.rencana || (Array.isArray(o) ? o : null); if (!Array.isArray(arr)) throw new Error("rencana kosong");
    arr.forEach(r => p.asesmen.rows.push({tp:asText(r.tp), diagnostik:asText(r.diagnostik), formatif:asText(r.formatif), sumatif:asText(r.sumatif), teknik:asText(r.teknik), instrumen:asText(r.instrumen), waktu:asText(r.waktu)}));
  }});
};

/* ---- 12. Kisi-kisi & kartu soal ---- */
RENDER[12] = () => {
  const p = P(); const K = p.kisi;
  const pick = p.atp.map((t, i) => `<label class="chk"><input type="checkbox" data-kisipick="${t.id}" ${K.tpIds.includes(t.id) ? "checked" : ""}><span><b>TP ${i + 1}</b> ${esc(t.tp)}</span></label>`).join("");
  const items = K.butir.map((b, i) => {
    const base = "pkg.kisi.butir." + i;
    return `<div class="sec"><h4><span>Soal ${i + 1} <span class="small muted">${esc(b.tp)} · ${esc(b.level)} · ${esc(b.bentuk)}</span></span><button class="btn sm danger" data-act="soalDel" data-arg="${i}">Hapus</button></h4>
      ${inp(base + ".indikator", "Indikator soal")}
      <div style="margin-top:6px">${ta(base + ".soal", "Soal / stimulus", {h:70})}</div>
      ${b.opsi ? `<div class="grid2" style="margin-top:6px">${Object.keys(b.opsi).map(o => inp(base + ".opsi." + o, "Pilihan " + o)).join("")}</div>` : ""}
      <div class="grid2" style="margin-top:6px">${inp(base + ".kunci", "Kunci jawaban")}${inp(base + ".level", "Level kognitif")}</div>
      <div style="margin-top:6px">${ta(base + ".pembahasan", "Pembahasan / pedoman penskoran", {h:60})}</div></div>`;
  }).join("");
  return `<section class="card">${head(12, "Opsional, untuk guru yang memakai tes tertulis. Menghasilkan kisi-kisi, kartu soal, naskah soal, dan kunci.", [
    "Centang TP yang diujikan, pilih bentuk dan jumlah soal (paling banyak 10 per klik).",
    "Klik lagi untuk menambah soal. Soal baru ditambahkan di bawah yang lama.",
    "Unduh <b>Naskah soal</b> (tanpa kunci) untuk murid, dan <b>Kisi-kisi &amp; kartu soal</b> untuk arsip guru."])}
    ${needATP()}
    <div class="sec"><h4>Pilih TP yang diujikan</h4>${pick || '<p class="muted small">Belum ada TP.</p>'}
      <div class="grid3" style="margin-top:8px">${sel("pkg.kisi.bentuk", "Bentuk soal", ["Pilihan ganda","Pilihan ganda kompleks","Isian singkat","Uraian","Campuran"])}${inp("pkg.kisi.jumlah", "Jumlah soal per klik", {type:"number", num:true, min:1})}${sel("pkg.kisi.level", "Sebaran level", ["Seimbang (pemahaman, aplikasi, penalaran)","Lebih banyak pemahaman","Lebih banyak penalaran (HOTS)"])}</div>
      <button class="btn ai" data-act="genSoal" style="margin-top:8px">✦ Buat soal</button></div>
    <h3>Butir soal (${K.butir.length})</h3>${items || '<p class="muted small">Belum ada.</p>'}
    <div class="row" style="margin-top:12px">${wordBtns("kisi")}${wordBtns("naskah", "Naskah soal (murid)")}</div></section>`;
};
document.addEventListener("input", ev => {
  const id = ev.target.dataset && ev.target.dataset.kisipick; if (!id) return;
  const K = P().kisi; K.tpIds = K.tpIds.filter(x => x !== id); if (ev.target.checked) K.tpIds.push(id); save();
});
ACT.soalDel = (i) => { P().kisi.butir.splice(+i, 1); save(); render(); };
ACT.genSoal = () => {
  const p = P(), K = p.kisi; const tps = p.atp.filter(t => K.tpIds.includes(t.id));
  if (!tps.length) { toast("Centang minimal satu TP."); return; }
  const n = Math.min(10, Math.max(1, +K.jumlah || 5));
  const prompt = ["TUGAS: Buat " + n + " butir soal " + K.bentuk + " beserta kisi-kisinya untuk TP berikut. Sebaran level: " + (K.level || "seimbang") + ".",
    tps.map(t => tpLabel(p, t) + ": " + t.tp).join("\n"),
    "Ketentuan: konteks soal dekat dengan kehidupan murid di daerahnya; bahasa sederhana; satu kunci yang benar untuk pilihan ganda (4 pilihan A–D) dengan pengecoh yang masuk akal; level ditulis L1 (pemahaman), L2 (aplikasi), atau L3 (penalaran). Untuk soal non-pilihan-ganda, isi opsi dengan null dan tulis pedoman penskoran di pembahasan. Hindari soal yang memerlukan gambar.",
    K.butir.length ? "Hindari mengulang soal yang sudah ada: " + K.butir.map(b => b.soal).join(" | ").slice(0, 1200) : "",
    'FORMAT JSON: {"butir":[{"tp":"TP 1","indikator":"Disajikan ..., murid dapat ...","level":"L2","bentuk":"Pilihan ganda","soal":"...","opsi":{"A":"...","B":"...","C":"...","D":"..."},"kunci":"B","pembahasan":"..."}]}'].join("\n");
  runAI({label:"Menyusun soal...", prompt, onResult: (o) => {
    const arr = o.butir || o.soal || (Array.isArray(o) ? o : null); if (!Array.isArray(arr) || !arr.length) throw new Error("soal kosong");
    arr.forEach(b => K.butir.push({tp:asText(b.tp), indikator:asText(b.indikator), level:asText(b.level), bentuk:asText(b.bentuk || K.bentuk), soal:asText(b.soal), opsi:b.opsi && typeof b.opsi === "object" ? Object.fromEntries(Object.entries(b.opsi).map(([a, v]) => [a, asText(v)])) : null, kunci:asText(b.kunci), pembahasan:asText(b.pembahasan)}));
  }});
};

/* ---- 13. Analisis butir soal ---- */
RENDER[13] = () => {
  const p = P(); const A = p.analisis;
  return `<section class="card">${head(13, "Hitung tingkat kesukaran, daya beda, efektivitas pengecoh, dan reliabilitas dari jawaban murid. Semua dihitung di perangkat, tanpa AI.", [
    "Isi <b>kunci jawaban</b> berurutan, misalnya <code>ABCDA BDCAB</code> (spasi diabaikan). Tombol di bawah bisa mengambil kunci dari soal pilihan ganda di Langkah 12.",
    "Isi <b>jawaban murid</b>, satu baris satu murid: <code>Nama; ABCDABDCAB</code>. Untuk soal non-pilihan-ganda, tulis skor 1/0 per butir (misalnya <code>Nama; 1101101110</code>) dan kosongkan kunci.",
    "Tekan <b>Analisis</b>. Hasil dapat diunduh sebagai Word."])}
    ${inp("pkg.analisis.kunci", "Kunci jawaban", {ph:"ABCDABDCAB"})}
    <div class="row" style="margin:6px 0 10px"><button class="btn sm" data-act="kunciDariSoal">Ambil kunci dari Langkah 12</button></div>
    ${ta("pkg.analisis.data", "Jawaban murid (satu baris satu murid)", {h:180, ph:"Ani; ABCDABDCAB\nBeni; ABCCABDCAA"})}
    <div class="row" style="margin-top:8px"><button class="btn pri" data-act="analisis">Analisis</button></div>
    <div id="anOut">${A.hasil ? analisisHTML(A.hasil) : ""}</div>
    <div class="row" style="margin-top:12px">${wordBtns("analisis")}</div></section>`;
};
ACT.kunciDariSoal = () => { const p = P(); const k = p.kisi.butir.filter(b => b.opsi).map(b => (b.kunci || "?").trim().charAt(0).toUpperCase()).join(""); if (!k) { toast("Belum ada soal pilihan ganda di Langkah 12."); return; } p.analisis.kunci = k; save(); render(); };
function hitungAnalisis(kunciRaw, dataRaw){
  const kunci = String(kunciRaw || "").toUpperCase().replace(/[^A-Z]/g, "");
  const rows = String(dataRaw || "").split(/\n/).map(l => l.trim()).filter(Boolean).map(l => {
    const m = /^(.*?)[;,\t|]\s*(.+)$/.exec(l) || /^(\S+)\s+(.+)$/.exec(l);
    return m ? {nama:m[1].trim(), jwb:m[2].toUpperCase().replace(/[\s,;]/g, "")} : null;
  }).filter(Boolean);
  if (!rows.length) throw new Error("Belum ada jawaban murid yang terbaca.");
  const mode = kunci ? "pg" : "skor";
  const n = kunci ? kunci.length : Math.max(...rows.map(r => r.jwb.length));
  if (!n) throw new Error("Jumlah butir 0.");
  const murid = rows.map(r => {
    const s = []; for (let i = 0; i < n; i++) { const c = r.jwb.charAt(i); s.push(mode === "pg" ? (c && c === kunci[i] ? 1 : 0) : (c === "1" ? 1 : 0)); }
    return {nama:r.nama, jwb:r.jwb, s, total:s.reduce((a, b) => a + b, 0)};
  });
  const N = murid.length, sorted = murid.slice().sort((a, b) => b.total - a.total);
  const g = Math.max(1, Math.round(N * 0.27)); const up = sorted.slice(0, g), lo = sorted.slice(-g);
  const items = []; let sumpq = 0;
  for (let i = 0; i < n; i++) {
    const benar = murid.reduce((a, m) => a + m.s[i], 0); const pp = benar / N; sumpq += pp * (1 - pp);
    const D = (up.reduce((a, m) => a + m.s[i], 0) - lo.reduce((a, m) => a + m.s[i], 0)) / g;
    const kes = pp < 0.3 ? "Sukar" : pp <= 0.7 ? "Sedang" : "Mudah";
    const db = D < 0 ? "Negatif" : D < 0.2 ? "Jelek" : D < 0.4 ? "Cukup" : D < 0.7 ? "Baik" : "Baik sekali";
    let peng = "";
    if (mode === "pg") {
      const opts = {}; murid.forEach(m => { const c = m.jwb.charAt(i) || "-"; opts[c] = (opts[c] || 0) + 1; });
      const letters = [...new Set(["A","B","C","D"].concat(Object.keys(opts).filter(x => /[A-E]/.test(x))))].sort();
      peng = letters.map(L => { const pct = Math.round((opts[L] || 0) / N * 100); return L + ":" + pct + "%" + (L === kunci[i] ? "*" : (pct < 5 ? "!" : "")); }).join(" ");
    }
    const kep = (D < 0.2 || pp < 0.1 || pp > 0.95) ? (D < 0 ? "Buang/ganti" : "Revisi") : "Pakai";
    items.push({no:i + 1, benar, p:pp, kes, D, db, peng, kep});
  }
  const tot = murid.map(m => m.total), mean = tot.reduce((a, b) => a + b, 0) / N;
  const varr = tot.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (N > 1 ? N - 1 : 1);
  const kr20 = n > 1 && varr > 0 ? (n / (n - 1)) * (1 - sumpq / varr) : null;
  return {mode, n, N, g, items, murid:murid.map(m => ({nama:m.nama, total:m.total, nilai:Math.round(m.total / n * 100)})), mean, kr20};
}
function analisisHTML(h){
  const it = h.items.map(x => `<tr><td class="num">${x.no}</td><td class="num">${x.benar}</td><td class="num">${x.p.toFixed(2)}</td><td>${x.kes}</td><td class="num">${x.D.toFixed(2)}</td><td>${x.db}</td>${h.mode === "pg" ? `<td class="small">${esc(x.peng)}</td>` : ""}<td><b>${x.kep}</b></td></tr>`).join("");
  const mu = h.murid.map((m, i) => `<tr><td class="num">${i + 1}</td><td>${esc(m.nama)}</td><td class="num">${m.total}</td><td class="num">${m.nilai}</td></tr>`).join("");
  const rel = h.kr20 == null ? "-" : h.kr20.toFixed(2) + (h.kr20 >= 0.7 ? " (reliabel)" : " (kurang reliabel)");
  return `<div class="note info" style="margin-top:12px"><b>${h.N} murid · ${h.n} butir.</b> Rata-rata skor ${h.mean.toFixed(1)} · Reliabilitas KR-20: ${rel}. Kelompok atas/bawah masing-masing ${h.g} murid (27%).</div>
    <h3>Analisis per butir</h3><div class="tbl-wrap"><table class="t"><tr><th class="num">No</th><th class="num">Benar</th><th class="num">p</th><th>Kesukaran</th><th class="num">D</th><th>Daya beda</th>${h.mode === "pg" ? "<th>Sebaran jawaban</th>" : ""}<th>Keputusan</th></tr>${it}</table></div>
    <p class="small muted">p = proporsi murid yang menjawab benar (sukar &lt; 0,30; sedang 0,30–0,70; mudah &gt; 0,70). D = selisih proporsi benar kelompok atas dan bawah. * = kunci; ! = pengecoh dipilih kurang dari 5% murid (kurang berfungsi). Pada kelas kecil (di bawah 20 murid), angka ini hanya petunjuk awal.</p>
    <h3>Nilai murid</h3><div class="tbl-wrap"><table class="t"><tr><th class="num">No</th><th>Nama</th><th class="num">Skor</th><th class="num">Nilai</th></tr>${mu}</table></div>`;
}
ACT.analisis = () => { const A = P().analisis; try { A.hasil = hitungAnalisis(A.kunci, A.data); save(); render(); toast("Analisis selesai."); } catch (e) { toast(e.message, 3500); } };
