/* ============ LANGKAH 5–8 ============ */
function tpLabel(p, t){ return "TP " + (p.atp.indexOf(t) + 1); }
function elemenList(p){ return p.elemen.length ? p.elemen : [{id:"__all", nama:"Seluruh CP", teks:p.cpTeks}]; }
function budgetBox(p){
  const k = hitungKalender(p), a1 = atpJP(p, 1), a2 = atpJP(p, 2);
  const c = (a, b) => `<span class="${a > b ? "over" : ""}">${a} / ${b} JP</span>`;
  return `<div class="budget"><span>Semester 1: ${c(a1, k.s1.total)}</span><span>Semester 2: ${c(a2, k.s2.total)}</span><span>Setahun: ${c(a1 + a2, k.s1.total + k.s2.total)}</span></div>
  ${(a1 > k.s1.total || a2 > k.s2.total) ? '<div class="note bad small">JP di ATP melebihi JP kalender. <button class="btn sm pri" data-act="fitJP">⚖ Sesuaikan JP dengan kalender</button> <span class="muted">atau ubah JP/semester di tabel.</span></div>' : ""}`;
}

/* Sesuaikan JP sekumpulan TP agar jumlahnya = target (proporsional, minimal 1 JP) */
function scaleJP(list, target){
  const sum = list.reduce((a, t) => a + (+t.jp || 0), 0);
  if (!list.length || !sum || target <= 0) return;
  list.forEach(t => { t.jp = Math.max(1, Math.round((+t.jp || 0) * target / sum)); });
  let diff = target - list.reduce((a, t) => a + t.jp, 0);
  const order = list.slice().sort((a, b) => b.jp - a.jp);
  for (let i = 0; diff !== 0 && i < 1000; i++) { const t = order[i % order.length]; if (diff > 0) { t.jp++; diff--; } else if (t.jp > 1) { t.jp--; diff++; } }
}
function fitJPKalender(p){
  const k = hitungKalender(p); let changed = false;
  [1, 2].forEach(sem => { const list = p.atp.filter(t => +t.semester === sem), avail = k["s" + sem].total;
    if (avail > 0 && list.length && atpJP(p, sem) > avail) { scaleJP(list, avail); changed = true; } });
  return changed;
}
ACT.fitJP = () => { const p = P(); syncTxtFields(p); if (fitJPKalender(p)) { save(); render(); toast("JP sudah disesuaikan dengan kalender."); } else toast("JP sudah sesuai kalender."); };

/* ---- 5. ATP ---- */
RENDER[5] = () => {
  const p = P(); const els = elemenList(p);
  if (!p.atpOpsi) p.atpOpsi = {elemen:els[0].id, semester:"auto", jp:""};
  if (!els.find(e => e.id === p.atpOpsi.elemen)) p.atpOpsi.elemen = els[0].id;
  const k = hitungKalender(p); const sisa = Math.max(0, k.s1.total + k.s2.total - atpJP(p));
  const rows = p.atp.map((t, i) => `<tr>
    <td class="num">${i + 1}</td>
    <td><textarea class="cell-in" data-bind="pkg.atp.${i}.elemen" rows="2">${esc(t.elemen)}</textarea></td>
    <td style="min-width:230px"><textarea class="cell-in" data-bind="pkg.atp.${i}.tp" rows="3">${esc(t.tp)}</textarea></td>
    <td style="min-width:150px"><textarea class="cell-in" data-bind="pkg.atp.${i}.materi" rows="2">${esc(t.materi)}</textarea></td>
    <td class="num"><input class="cell-in" style="width:56px;text-align:center" type="number" min="0" data-bind="pkg.atp.${i}.jp" data-num data-live="budget" value="${esc(t.jp)}"></td>
    <td class="num"><select class="cell-in" data-bind="pkg.atp.${i}.semester" data-live="budget"><option value="1" ${+t.semester === 1 ? "selected" : ""}>1</option><option value="2" ${+t.semester === 2 ? "selected" : ""}>2</option></select></td>
    <td style="min-width:140px"><textarea class="cell-in" data-bind="pkg.atp.${i}.dplTxt" rows="2" placeholder="pisahkan dengan koma">${esc((t.dpl || []).join(", "))}</textarea></td>
    ${p.kbc ? `<td style="min-width:120px"><textarea class="cell-in" data-bind="pkg.atp.${i}.cintaTxt" rows="2">${esc((t.cinta || []).join(", "))}</textarea></td>` : ""}
    <td class="num"><button class="btn sm ghost" data-act="tpUp" data-arg="${i}" title="Naik">↑</button><button class="btn sm ghost" data-act="tpDown" data-arg="${i}" title="Turun">↓</button><button class="btn sm ghost danger" data-act="tpDel" data-arg="${i}" title="Hapus">✕</button></td></tr>`).join("");
  const elOpts = els.map(e => [e.id, e.nama || "(elemen tanpa nama)"]);
  const curEl = els.find(e => e.id === p.atpOpsi.elemen) || els[0];
  const sudah = p.atp.filter(t => t.elemenId === curEl.id).length;
  return `<section class="card">${head(5, "Turunkan CP menjadi Tujuan Pembelajaran yang berurutan. ATP adalah pusat: Prota, Promes, KKTP, modul, dan soal dibangun dari sini.", [
    "Pilih satu elemen CP, isi perkiraan JP untuk elemen itu, lalu tekan <b>Buat ATP elemen ini</b>. Ulangi untuk elemen lain.",
    "Periksa setiap TP: apakah kata kerjanya bisa diamati? apakah lingkup materinya jelas? Sunting langsung di tabel.",
    "Atur JP dan semester sampai angka di kotak anggaran tidak merah.",
    "AI gagal? Anda bisa mengetik TP sendiri dengan <b>Tambah TP manual</b>."])}
    ${needPkgInfo()}
    ${!p.cpTeks.trim() ? `<div class="note warn">Teks CP masih kosong. Isi di <b>Langkah 4</b> agar ATP sesuai CP resmi. <button class="btn sm" data-act="go" data-arg="4">Buka Langkah 4</button></div>` : ""}
    <div class="sec"><h4>Anggaran JP dari kalender</h4><div id="budgetBox">${budgetBox(p)}</div></div>
    <div class="sec"><h4>Buat ATP dengan AI</h4>
      <div class="grid3">
        ${sel("pkg.atpOpsi.elemen", "Elemen CP", elOpts, {rerender:true})}
        ${sel("pkg.atpOpsi.semester", "Semester", [["auto","Atur otomatis"],["1","Semester 1"],["2","Semester 2"]])}
        ${inp("pkg.atpOpsi.jp", "Perkiraan JP elemen ini", {type:"number", ph:"Sisa JP: " + sisa})}
      </div>
      <p class="small muted pre" style="max-height:90px;overflow:auto;margin:8px 0">${esc((curEl.teks || "").slice(0, 600))}</p>
      <button class="btn ai ${sudah ? "done" : ""}" data-act="genATP">${sudah ? "↻ Buat ulang ATP elemen ini (" + sudah + " TP akan diganti)" : "✦ Buat ATP elemen ini (1 klik AI)"}</button>
    </div>
    <h3>Tabel ATP (${p.atp.length} TP)</h3>
    <div class="tbl-wrap"><table class="t"><tr><th class="num">No</th><th>Elemen</th><th>Tujuan Pembelajaran</th><th>Materi pokok</th><th class="num">JP</th><th class="num">Smt</th><th>DPL</th>${p.kbc ? "<th>Panca Cinta</th>" : ""}<th class="num">Atur</th></tr>
      ${rows || `<tr><td colspan="${p.kbc ? 9 : 8}" class="muted">Belum ada TP.</td></tr>`}</table></div>
    <div class="row" style="margin-top:8px"><button class="btn" data-act="tpAdd">＋ Tambah TP manual</button></div>
    <div class="row" style="margin-top:12px">${wordBtns("atp")}</div>
  </section>`;
};
LIVE.budget = () => { const b = document.getElementById("budgetBox"); if (b) b.innerHTML = budgetBox(P()); };
function syncTxtFields(p){
  p.atp.forEach(t => {
    if (t.dplTxt !== undefined) { t.dpl = t.dplTxt.split(",").map(x => x.trim()).filter(Boolean); delete t.dplTxt; }
    if (t.cintaTxt !== undefined) { t.cinta = t.cintaTxt.split(",").map(x => x.trim()).filter(Boolean); delete t.cintaTxt; }
    t.semester = +t.semester || 1; t.jp = +t.jp || 0;
  });
}
ACT.tpAdd = () => { const p = P(); p.atp.push({id:uid(), elemenId:"", elemen:p.elemen[0] ? p.elemen[0].nama : "", tp:"", materi:"", jp:4, semester:1, dpl:[], cinta:[]}); save(); render(); };
ACT.tpDel = (i) => { const p = P(); const t = p.atp[+i]; confirmModal("Hapus TP?", esc(t.tp || "TP ini") + "<br><span class='small muted'>KKTP, modul, dan LKPD untuk TP ini ikut terhapus.</span>", "Hapus", () => { delete p.kktp[t.id]; delete p.modul[t.id]; delete p.lkpd[t.id]; p.atp.splice(+i, 1); save(); render(); }); };
ACT.tpUp = (i) => { const a = P().atp; i = +i; if (i > 0) { [a[i-1], a[i]] = [a[i], a[i-1]]; save(); render(); } };
ACT.tpDown = (i) => { const a = P().atp; i = +i; if (i < a.length - 1) { [a[i+1], a[i]] = [a[i], a[i+1]]; save(); render(); } };
ACT.genATP = () => {
  const p = P(); syncTxtFields(p);
  if (!stepDone(2)) { toast("Lengkapi Langkah 2 dulu."); return; }
  const els = elemenList(p); const el = els.find(e => e.id === p.atpOpsi.elemen) || els[0];
  if (!(el.teks || "").trim()) { toast("Teks CP elemen ini kosong. Isi di Langkah 4."); return; }
  const k = hitungKalender(p);
  const sisaEl = els.filter(e => !p.atp.some(t => t.elemenId === e.id) || e.id === el.id).length || 1;
  const sisaJP = Math.max(0, k.s1.total + k.s2.total - atpJP(p) + p.atp.filter(t => t.elemenId === el.id).reduce((a, t) => a + (+t.jp || 0), 0));
  const target = +p.atpOpsi.jp || Math.round(sisaJP / sisaEl) || 20;
  const semRule = p.atpOpsi.semester === "auto" ? "Bagi TP ke semester 1 dan 2 secara wajar sesuai urutan dan JP yang tersedia." : "Semua TP untuk semester " + p.atpOpsi.semester + ".";
  const prompt = [
    "TUGAS: Turunkan Capaian Pembelajaran elemen berikut menjadi Tujuan Pembelajaran (TP) yang berurutan sebagai Alur Tujuan Pembelajaran.",
    "Elemen: " + el.nama, "Teks CP elemen:\n" + el.teks,
    "Anggaran: sekitar " + target + " JP untuk elemen ini. JP kalender: Semester 1 = " + k.s1.total + " JP, Semester 2 = " + k.s2.total + " JP. " + semRule,
    "Ketentuan:",
    "- Setiap TP memuat kompetensi dengan kata kerja operasional yang dapat diamati dan lingkup materi yang jelas. Boleh menyertakan konteks lokal murid.",
    "- Urutkan dari yang mendasar ke yang kompleks. Satu TP biasanya 2–12 JP. Jumlah JP semua TP mendekati anggaran.",
    "- Seluruh kompetensi dalam teks CP harus tercakup; jangan menambah kompetensi di luar CP.",
    "- dpl: pilih 1–3 dimensi yang paling relevan, tulis persis dari daftar: " + DPL_SHORT.join(", ") + ".",
    p.kbc ? "- cinta: pilih 1–2 nilai yang relevan, tulis persis dari daftar: " + PANCA_CINTA.join(", ") + "." : "- cinta: kosongkan ([]).",
    'FORMAT JSON: {"tp":[{"tp":"Murid mampu ...","materi":"...","jp":6,"semester":1,"dpl":["Penalaran Kritis"],"cinta":[]}]}'
  ].join("\n");
  const go = () => runAI({label:"Menyusun ATP elemen " + el.nama + "...", prompt, onResult: (o) => {
    const arr = o.tp || o.TP || o.atp || (Array.isArray(o) ? o : null); if (!Array.isArray(arr) || !arr.length) throw new Error("daftar TP kosong");
    const keep = p.atp.filter(t => t.elemenId !== el.id);
    const neu0 = arr.map(x => ({id:uid(), elemenId:el.id, elemen:el.nama, tp:asText(x.tp || x.tujuan), materi:asText(x.materi || x.materi_pokok), jp:+x.jp || 2, semester:p.atpOpsi.semester === "auto" ? (+x.semester === 2 ? 2 : 1) : +p.atpOpsi.semester, dpl:Array.isArray(x.dpl) ? x.dpl.map(String) : [], cinta:Array.isArray(x.cinta) ? x.cinta.map(String) : []}));
    const neu = neu0; scaleJP(neu, target);
    // sisipkan sesuai urutan elemen
    const order = els.map(e => e.id); const all = keep.concat(neu);
    all.sort((a, b) => { const ia = order.indexOf(a.elemenId), ib = order.indexOf(b.elemenId); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    p.atp = all;
    fitJPKalender(p);
    const ids = new Set(all.map(t => t.id));
    ["kktp","modul","lkpd"].forEach(f => Object.keys(p[f]).forEach(id => { if (!ids.has(id)) delete p[f][id]; }));
  }});
  if (p.atp.some(t => t.elemenId === el.id)) confirmModal("Buat ulang ATP elemen ini?", "TP lama dari elemen <b>" + esc(el.nama) + "</b> akan diganti.", "Ya, buat ulang", go); else go();
};

/* ---- 6. Prota ---- */
RENDER[6] = () => {
  const p = P(); syncTxtFields(p); const k = hitungKalender(p);
  const body = [1, 2].map(sem => {
    const tps = p.atp.filter(t => +t.semester === sem);
    const r = tps.map(t => `<tr><td class="num">${p.atp.indexOf(t) + 1}</td><td>${esc(t.elemen)}</td><td>${esc(t.tp)}</td><td>${esc(t.materi)}</td><td class="num">${t.jp}</td></tr>`).join("");
    return `<tr><th colspan="5">Semester ${sem}</th></tr>${r || '<tr><td colspan="5" class="muted">Belum ada TP.</td></tr>'}<tr><td colspan="4"><b>Jumlah semester ${sem}</b> <span class="small muted">(tersedia ${k["s" + sem].total} JP)</span></td><td class="num"><b>${atpJP(p, sem)}</b></td></tr>`;
  }).join("");
  return `<section class="card">${head(6, "Prota disusun otomatis dari ATP. Ubah isi di Langkah 5 bila perlu.", null)}
    ${needATP()}
    <div class="tbl-wrap"><table class="t"><tr><th class="num">No</th><th>Elemen</th><th>Tujuan Pembelajaran</th><th>Materi pokok</th><th class="num">JP</th></tr>${body}
    <tr><th colspan="4">Jumlah setahun</th><th class="num">${atpJP(p)}</th></tr></table></div>
    <div class="row" style="margin-top:12px">${wordBtns("prota")}</div></section>`;
};

/* ---- 7. Promes ---- */
function promesTable(p, sem, forWord){
  const pr = sebarPromes(p)[sem]; const W = pr.weeks;
  if (!W.length) return '<p class="muted">Tanggal semester belum diisi di Langkah 3.</p>';
  const months = []; W.forEach(w => { const last = months[months.length - 1]; if (last && last.m === w.month && last.y === w.year) last.n++; else months.push({m:w.month, y:w.year, n:1}); });
  const th1 = months.map(m => `<th class="num" colspan="${m.n}">${BULAN_SINGKAT[m.m]} ${String(m.y).slice(2)}</th>`).join("");
  const th2 = W.map(w => `<th class="num" style="${w.jp ? "" : "background:#e9e4d6"}">${w.mInMonth}</th>`).join("");
  const rows = pr.rows.map(r => `<tr><td class="num">${p.atp.indexOf(r.tp) + 1}</td><td style="min-width:${forWord ? 0 : 200}px">${esc(r.tp.tp)}</td><td class="num">${r.tp.jp}</td>${W.map(w => r.cells[w.start] ? `<td class="hl">${r.cells[w.start]}</td>` : `<td class="num" style="${w.jp ? "" : "background:#f1ede2"}"></td>`).join("")}</tr>${r.kurang ? `<tr><td></td><td colspan="${W.length + 2}" style="color:#b3261e">⚠ ${r.kurang} JP belum terjadwal</td></tr>` : ""}`).join("");
  const tot = `<tr><th></th><th>JP tersedia per minggu</th><th class="num">${W.reduce((a, w) => a + w.jp, 0)}</th>${W.map(w => `<th class="num">${w.jp || "-"}</th>`).join("")}</tr>`;
  return `<table class="t"><tr><th rowspan="2" class="num">No</th><th rowspan="2">Tujuan Pembelajaran</th><th rowspan="2" class="num">JP</th>${th1}</tr><tr>${th2}</tr>${rows || `<tr><td colspan="${W.length + 3}" class="muted">Belum ada TP di semester ini.</td></tr>`}${tot}</table>`;
}
RENDER[7] = () => {
  const p = P(); syncTxtFields(p);
  return `<section class="card">${head(7, "TP disebar ke minggu efektif sesuai urutan ATP dan JP per minggu. Kolom abu-abu adalah minggu tanpa pelajaran.", [
    "Penyebaran dihitung ulang otomatis setiap ATP atau kalender berubah.",
    "Bila muncul tanda ⚠ JP belum terjadwal, kurangi JP TP di Langkah 5 atau pindahkan TP ke semester lain.",
    "Dokumen Word Promes dicetak mendatar (landscape)."])}
    ${needATP()}
    <h3>Semester 1</h3><div class="tbl-wrap">${promesTable(p, 1)}</div>
    <h3 style="margin-top:14px">Semester 2</h3><div class="tbl-wrap">${promesTable(p, 2)}</div>
    <div class="row" style="margin-top:12px">${wordBtns("promes")}</div></section>`;
};

/* ---- 8. KKTP ---- */
const LEVEL = [["l1","Perlu bimbingan"],["l2","Cukup"],["l3","Baik"],["l4","Sangat baik"]];
RENDER[8] = () => {
  const p = P(); syncTxtFields(p);
  if (!p.kktpPilih) p.kktpPilih = [];
  if (p.kktpInterval == null) p.kktpInterval = "0–60: perlu bimbingan (remedial) · 61–70: cukup · 71–85: baik · 86–100: sangat baik (pengayaan). Sesuaikan dengan ketetapan satuan pendidikan.";
  const pick = p.atp.map((t, i) => `<label class="chk"><input type="checkbox" data-kpick="${t.id}" ${p.kktpPilih.includes(t.id) ? "checked" : ""}><span><b>TP ${i + 1}</b> ${esc(t.tp)} ${p.kktp[t.id] ? '<span class="pill ok">ada</span>' : ""}</span></label>`).join("");
  const list = p.atp.filter(t => p.kktp[t.id]).map(t => {
    const k = p.kktp[t.id], i = p.atp.indexOf(t);
    const rub = (k.rubrik || []).map((r, ri) => `<tr><td><textarea class="cell-in" data-bind="pkg.kktp.${t.id}.rubrik.${ri}.aspek">${esc(r.aspek)}</textarea></td>${LEVEL.map(([f]) => `<td><textarea class="cell-in" rows="3" data-bind="pkg.kktp.${t.id}.rubrik.${ri}.${f}">${esc(r[f])}</textarea></td>`).join("")}</tr>`).join("");
    return `<div class="sec"><h4><span>TP ${i + 1}: ${esc(t.tp)}</span><button class="btn sm danger" data-act="kktpDel" data-arg="${t.id}">Hapus</button></h4>
      <label class="f">Kriteria ketercapaian (satu baris satu kriteria)</label><textarea class="in" data-bind="pkg.kktp.${t.id}.kriteriaTxt">${esc((k.kriteria || []).join("\n"))}</textarea>
      <label class="f" style="margin-top:8px">Rubrik</label><div class="tbl-wrap"><table class="t"><tr><th>Aspek</th>${LEVEL.map(l => `<th>${l[1]}</th>`).join("")}</tr>${rub}</table></div>
      <label class="f" style="margin-top:8px">Tindak lanjut</label><textarea class="in" data-bind="pkg.kktp.${t.id}.tindakLanjut">${esc(k.tindakLanjut || "")}</textarea></div>`;
  }).join("");
  return `<section class="card">${head(8, "Kriteria untuk menilai apakah TP sudah tercapai, lengkap dengan rubrik empat tingkat.", [
    "Centang TP yang ingin dibuatkan KKTP (paling banyak 4 per klik agar jawaban AI tidak terpotong).",
    "Tekan <b>Buat KKTP</b>, lalu sunting kriteria dan rubrik sesuai kelas Anda.",
    "Interval nilai di bawah dapat diubah sesuai ketetapan sekolah/madrasah."])}
    ${needATP()}
    <div class="sec"><h4>Pilih TP <span class="row"><button class="btn sm" data-act="kPickNone">Kosongkan</button><button class="btn sm" data-act="kPickTodo">Pilih yang belum ada</button></span></h4>${pick || '<p class="muted small">Belum ada TP.</p>'}
      <button class="btn ai" data-act="genKKTP" style="margin-top:8px">✦ Buat KKTP untuk TP terpilih</button></div>
    ${ta("pkg.kktpInterval", "Interval nilai dan tindak lanjut umum", {h:60})}
    <h3 style="margin-top:14px">KKTP tersusun (${Object.keys(p.kktp).length})</h3>${list || '<p class="muted small">Belum ada.</p>'}
    <div class="row" style="margin-top:12px">${wordBtns("kktp")}</div></section>`;
};
document.addEventListener("input", ev => {
  const id = ev.target.dataset && ev.target.dataset.kpick; if (!id) return;
  const p = P(); p.kktpPilih = p.kktpPilih.filter(x => x !== id); if (ev.target.checked) p.kktpPilih.push(id); save();
});
ACT.kPickNone = () => { P().kktpPilih = []; save(); render(); };
ACT.kPickTodo = () => { const p = P(); p.kktpPilih = p.atp.filter(t => !p.kktp[t.id]).slice(0, 4).map(t => t.id); save(); render(); };
ACT.kktpDel = (id) => { delete P().kktp[id]; save(); render(); };
function syncKKTP(p){ Object.values(p.kktp).forEach(k => { if (k.kriteriaTxt !== undefined) { k.kriteria = k.kriteriaTxt.split(/\n/).map(x => x.trim()).filter(Boolean); delete k.kriteriaTxt; } }); }
ACT.genKKTP = () => {
  const p = P(); const tps = p.atp.filter(t => p.kktpPilih.includes(t.id));
  if (!tps.length) { toast("Centang minimal satu TP."); return; }
  if (tps.length > 4) { toast("Pilih paling banyak 4 TP per klik."); return; }
  const prompt = [
    "TUGAS: Susun Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) untuk setiap TP berikut, memakai pendekatan rubrik empat tingkat.",
    tps.map((t, i) => "[" + (i + 1) + "] " + t.tp + " (materi: " + t.materi + ")").join("\n"),
    "Ketentuan: 3–5 kriteria per TP yang dapat diamati; rubrik 3–4 aspek; deskripsi tiap tingkat konkret dan berbeda jelas; tindak lanjut singkat untuk murid yang belum dan sudah mencapai. Untuk kelas rangkap, kriteria tetap per TP.",
    'FORMAT JSON: {"kktp":[{"no":1,"kriteria":["..."],"rubrik":[{"aspek":"...","l1":"Perlu bimbingan: ...","l2":"Cukup: ...","l3":"Baik: ...","l4":"Sangat baik: ..."}],"tindakLanjut":"..."}]}',
    "Isi l1–l4 tanpa awalan nama tingkat."
  ].join("\n");
  runAI({label:"Menyusun KKTP...", prompt, onResult: (o) => {
    const arr = o.kktp || (Array.isArray(o) ? o : null); if (!Array.isArray(arr) || !arr.length) throw new Error("KKTP kosong");
    arr.forEach((x, i) => { const t = tps[(+x.no || i + 1) - 1] || tps[i]; if (!t) return;
      p.kktp[t.id] = {kriteria:(x.kriteria || []).map(asText), rubrik:(x.rubrik || []).map(r => ({aspek:asText(r.aspek), l1:asText(r.l1), l2:asText(r.l2), l3:asText(r.l3), l4:asText(r.l4)})), tindakLanjut:asText(x.tindakLanjut || x.tindak_lanjut)}; });
    p.kktpPilih = [];
  }});
};
