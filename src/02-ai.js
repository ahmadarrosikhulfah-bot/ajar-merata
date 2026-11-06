/* ============ AI ============ */
function sistemPrompt(p){
  const regs = regsFor(p);
  const kbc = p && p.kbc;
  return [
    "Anda adalah pendamping penyusunan perangkat ajar untuk guru di Indonesia, terutama guru di daerah 3T (tertinggal, terdepan, terluar).",
    "ACUAN yang dicentang guru (jadikan rujukan, jangan dikutip pasalnya):\n- " + (regs.length ? regs.join("\n- ") : "(tidak ada)"),
    "ATURAN WAJIB:",
    "1. Gunakan nomenklatur resmi terbaru: murid, Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), Alur Tujuan Pembelajaran (ATP), Kriteria Ketercapaian Tujuan Pembelajaran (KKTP), Dimensi Profil Lulusan (DPL), pembelajaran mendalam.",
    "2. Jangan mengarang nomor regulasi, pasal, ketentuan, kutipan hukum, judul buku, nama penulis, situs, atau tautan. Bila perlu menyebut sumber, sebut jenisnya saja (misalnya buku teks mata pelajaran, lingkungan sekitar).",
    "3. Untuk Pendidikan Agama dan mapel PAI, jangan menulis teks ayat, hadis, atau kutipan kitab suci. Tulis penanda [Guru menuliskan ayat/hadis/kutipan kitab suci beserta sumbernya].",
    "4. Pembelajaran mendalam: prinsip berkesadaran, bermakna, dan menggembirakan; pengalaman belajar memahami, mengaplikasi, dan merefleksi; kerangka praktik pedagogis, kemitraan pembelajaran, lingkungan pembelajaran, dan pemanfaatan digital.",
    "5. Delapan Dimensi Profil Lulusan: " + DPL.join("; ") + ".",
    kbc ? "6. Integrasikan Kurikulum Berbasis Cinta (Panca Cinta): " + PANCA_CINTA.join("; ") + ". Wujudkan dalam sikap, kegiatan, dan pembiasaan yang nyata, bukan slogan." : "6. Kurikulum Berbasis Cinta tidak diminta untuk paket ini.",
    "7. Konteks 3T: kegiatan harus tetap bisa berjalan tanpa listrik, internet, proyektor, atau printer bila sarana itu terbatas. Gunakan bahan dan contoh dari lingkungan murid serta potensi daerah. Bila ada kelas rangkap, beri pembedaan kegiatan per tingkat kelas. Bahasa ibu murid boleh dipakai sebagai jembatan ke bahasa Indonesia.",
    "8. Tulis dalam bahasa Indonesia baku yang sederhana, operasional, dan langsung dapat dipakai guru. Hindari jargon yang tidak perlu.",
    "9. Jawab HANYA dengan JSON valid sesuai format yang diminta. Tanpa pengantar, tanpa penutup, tanpa blok kode."
  ].join("\n");
}
function konteks(p){
  const pr = state.profil, f = faseOf(p);
  const sarana = [];
  sarana.push("listrik: " + pr.listrik, "internet: " + pr.internet);
  sarana.push(pr.proyektor ? "ada proyektor" : "tidak ada proyektor");
  sarana.push(pr.printer ? "ada printer" : "tidak ada printer/terbatas");
  sarana.push(pr.lab ? "ada laboratorium" : "tidak ada laboratorium");
  sarana.push(pr.perpustakaan ? "ada perpustakaan/pojok baca" : "tidak ada perpustakaan");
  return [
    "KONTEKS:",
    "- Satuan pendidikan: " + (pr.sekolah || "(belum diisi)") + " (" + (p.kementerian === "kemenag" ? "madrasah, Kementerian Agama" : "sekolah, Kemendikdasmen") + ")" + (pr.kabupaten ? ", " + pr.kabupaten : "") + (pr.provinsi ? ", " + pr.provinsi : "") + ".",
    "- Daerah: " + (pr.daerah3T ? "daerah 3T (" + pr.jenis3T + ")" : "tidak dinyatakan sebagai daerah 3T") + ".",
    "- Sarana: " + sarana.join(", ") + ".",
    "- Potensi dan kearifan lokal: " + (pr.potensi || "(tidak diisi)") + ".",
    "- Bahasa ibu murid: " + (pr.bahasaIbu || "(tidak diisi)") + ".",
    "- Mata pelajaran: " + mapelName(p) + "; jenjang " + p.jenjang + "; kelas " + p.kelas + "; Fase " + f + "; " + p.menitJP + " menit per JP.",
    "- Jumlah murid: " + (p.jumlahMurid || "(tidak diisi)") + "; kelas rangkap: " + (p.kelasRangkap || "tidak") + ".",
    "- Catatan guru tentang murid: " + (p.catatanMurid || "(tidak ada)") + "."
  ].join("\n");
}
function cleanJSON(txt){
  let t = String(txt || "").trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  const i1 = t.search(/[\[{]/); if (i1 > 0) t = t.slice(i1);
  const lastObj = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]")); if (lastObj > -1) t = t.slice(0, lastObj + 1);
  try { return JSON.parse(t); } catch (e) {}
  const t2 = t.replace(/,\s*([}\]])/g, "$1").replace(/[“”]/g, '"');
  return JSON.parse(t2);
}
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function callGemini(sys, prompt){
  const order = state.ai.lastOk ? [state.ai.lastOk].concat(state.ai.models.filter(m => m !== state.ai.lastOk)) : state.ai.models.slice();
  let lastErr = null;
  for (const model of order) {
    for (let attempt = 0; attempt < 3; attempt++) {
      let res;
      try {
        res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent?key=" + encodeURIComponent(userKey() || apiKey), {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            contents:[{role:"user", parts:[{text: prompt}]}],
            systemInstruction:{parts:[{text: sys}]},
            generationConfig:{responseMimeType:"application/json", temperature:0.6}
          })
        });
      } catch (e) { lastErr = {kind:"jaringan", msg:"Tidak bisa terhubung ke server AI (" + e.message + ")."}; await sleep(1500 * (attempt + 1)); continue; }
      if (res.ok) {
        const data = await res.json();
        const cand = data.candidates && data.candidates[0];
        const text = cand && cand.content && cand.content.parts ? cand.content.parts.map(x => x.text || "").join("") : "";
        if (!text) { lastErr = {kind:"kosong", msg:"AI tidak memberi jawaban" + (cand && cand.finishReason ? " (" + cand.finishReason + ")" : "") + "."}; break; }
        try { const obj = cleanJSON(text); state.ai.lastOk = model; save(); return obj; }
        catch (e) { lastErr = {kind:"format", msg:"Jawaban AI terpotong atau tidak berformat JSON. Coba lagi, atau kurangi jumlah TP per klik.", raw:text}; if (cand && cand.finishReason === "MAX_TOKENS") break; continue; }
      }
      let detail = ""; try { const j = await res.json(); detail = j.error && j.error.message ? j.error.message : ""; } catch (e) {}
      if (res.status === 403 || res.status === 404 || res.status === 400) { lastErr = {kind:"model", msg:"Model " + model + " tidak bisa dipakai (HTTP " + res.status + "). " + detail}; break; }
      if (res.status === 429) { lastErr = {kind:"kuota", msg:"Kuota AI akun Gemini sedang habis (HTTP 429). Tunggu beberapa menit atau coba besok."}; await sleep(2500 * (attempt + 1)); continue; }
      lastErr = {kind:"server", msg:"Server AI sibuk (HTTP " + res.status + "). " + detail}; await sleep(2000 * (attempt + 1));
    }
  }
  throw lastErr || {kind:"lain", msg:"AI gagal tanpa keterangan."};
}

/* runAI: panggil AI; bila gagal, tawarkan mode salin-prompt */
function runAI(opts){
  const p = P();
  const sys = sistemPrompt(p);
  const full = opts.prompt + "\n\n" + konteks(p);
  if (state.ai.alwaysManual || !aiLangsung()) return manualPrompt(sys, full, opts);
  if (!inCanvas() && !opts.force) return manualPrompt(sys, full, opts, true);
  showBusy(opts.label || "AI sedang menyusun...");
  callGemini(sys, full).then(obj => {
    hideBusy();
    try { opts.onResult(obj); save(); render(); toast("Selesai. Periksa dan sunting hasilnya bila perlu."); }
    catch (e) { aiErrorModal({kind:"format", msg:"Isi jawaban AI tidak sesuai format yang diharapkan (" + e.message + ")."}, sys, full, opts); }
  }).catch(err => { hideBusy(); aiErrorModal(err, sys, full, opts); });
}
function aiErrorModal(err, sys, full, opts){
  const saran = {
    model:"Kunci AI bawaan Canvas hanya berlaku untuk model tertentu. Buka Menu › Pengaturan AI untuk mengganti daftar model, atau minta Gemini di Canvas memperbarui nama model.",
    kuota:"Kuota harian akun Gemini Anda habis. Tunggu sebentar atau coba lagi besok.",
    jaringan:"Periksa sinyal. Pekerjaan Anda tetap tersimpan.",
    format:"Muat ulang lalu coba lagi, atau pilih lebih sedikit TP/soal per klik.",
    server:"Tunggu 1–2 menit lalu coba lagi.", kosong:"Ubah sedikit isian lalu coba lagi."
  }[err.kind] || "";
  openLayer(`<div class="modal"><div class="mhead"><h2>AI belum berhasil</h2><button class="btn sm" data-act="closeLayer">✕</button></div>
    <div class="note bad"><b>Penyebab:</b> ${esc(err.msg)}</div>
    <p class="small">${esc(saran)}</p>
    <p class="small">Bila Anda membuka aplikasi ini di luar Gemini Canvas (misalnya dari berkas di HP), AI langsung tidak tersedia. Pakai <b>mode salin-prompt</b>: aplikasi menyiapkan perintah, Anda menempelkannya ke Gemini, ChatGPT, atau Meta AI, lalu menempelkan jawabannya kembali di sini.</p>
    <div class="row"><button class="btn ai" data-act="aiRetry">↻ Coba lagi</button><button class="btn" data-act="aiManual">📋 Pakai mode salin-prompt</button></div></div>`);
  ACT.aiRetry = () => { closeLayer(); runAI(opts); };
  ACT.aiManual = () => { closeLayer(); manualPrompt(sys, full, opts); };
}
function inCanvas(){
  const h = location.hostname || "";
  return /\.goog$|googleusercontent\.com$|gemini\.google\.com$/.test(h);
}
function manualPrompt(sys, full, opts, outside){
  const all = sys + "\n\n=== TUGAS ===\n" + full;
  const why = !aiLangsung() ? `<div class="note info small">Aplikasi dibuka di luar Gemini Canvas, jadi AI dijalankan lewat chatbot pilihan Anda. Ingin AI langsung? Buka versi Canvas, atau isi kunci API Gemini gratis Anda di Menu › Pengaturan AI.</div>` : "";
  openLayer(`<div class="modal"><div class="mhead"><h2>Mode salin-prompt</h2><button class="btn sm" data-act="closeLayer">✕</button></div>${why}
    ${outside ? `<div class="note info small">Aplikasi ini dibuka di luar Gemini Canvas, jadi AI tidak bisa dipanggil langsung. Ikuti tiga langkah di bawah memakai chatbot apa saja. <button class="btn sm" data-act="mpForce">Tetap coba AI langsung</button></div>` : ""}
    <ol class="small"><li>Tekan <b>Salin perintah</b>.</li><li>Buka Gemini, ChatGPT, atau Meta AI (WhatsApp), tempel, lalu kirim.</li><li>Salin seluruh jawaban AI, tempel di kotak kedua, tekan <b>Proses jawaban</b>.</li></ol>
    <label class="f">Perintah untuk AI</label><textarea class="in" id="mpPrompt" readonly style="min-height:120px">${esc(all)}</textarea>
    <div class="row" style="margin:8px 0 14px"><button class="btn pri" data-act="mpCopy">📋 Salin perintah</button></div>
    <label class="f">Tempel jawaban AI di sini</label><textarea class="in" id="mpAnswer" style="min-height:140px" placeholder='{ ... }'></textarea>
    <div class="row" style="margin-top:8px"><button class="btn ai" data-act="mpProcess">Proses jawaban</button></div></div>`);
  ACT.mpCopy = () => copyText(all);
  ACT.mpForce = () => { closeLayer(); runAI(Object.assign({}, opts, {force:true})); };
  ACT.mpProcess = () => {
    const v = document.getElementById("mpAnswer").value;
    try { const obj = cleanJSON(v); opts.onResult(obj); save(); closeLayer(); render(); toast("Jawaban diproses."); }
    catch (e) { toast("Jawaban belum bisa dibaca. Pastikan Anda menyalin seluruh jawaban yang berbentuk JSON.", 4000); }
  };
}
function copyText(t){
  const done = () => toast("Tersalin.");
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t));
  else fallbackCopy(t);
}
function fallbackCopy(t){
  const ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); toast("Tersalin."); } catch (e) { toast("Gagal menyalin. Tandai teks lalu salin manual."); }
  ta.remove();
}

/* ============ KALENDER ============ */
function liburSet(){
  const set = {}, bad = [];
  String(state.kalender.libur || "").split(/\n/).forEach(line => {
    const l = line.trim(); if (!l) return;
    let m = /^(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})\s*(?:sampai|s\.?d\.?|-|–)\s*(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})\s*(.*)$/i.exec(l);
    if (m) { const a = parseDMY(m[1]), b = parseDMY(m[2]); if (!a || !b || b < a) { bad.push(l); return; } for (let d = a; d <= b; d = addDays(d, 1)) set[key(d)] = m[3] || "Libur"; return; }
    m = /^(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4})\s*(.*)$/.exec(l);
    if (m) { const a = parseDMY(m[1]); if (!a) { bad.push(l); return; } set[key(a)] = m[2] || "Libur"; return; }
    bad.push(l);
  });
  return {set, bad};
}
/* hasil: {s1:{weeks:[{start, jp, meet, label, month}], total}, s2:..., bad} */
function hitungKalender(p){
  p = p || P();
  const {set, bad} = liburSet();
  const out = {bad};
  [["s1", state.kalender.s1Mulai, state.kalender.s1Akhir], ["s2", state.kalender.s2Mulai, state.kalender.s2Akhir]].forEach(([s, a, b]) => {
    const A = parseISO(a), B = parseISO(b), weeks = [];
    if (A && B && B >= A) {
      let wk = addDays(A, -((A.getDay() + 6) % 7)); // Senin minggu pertama
      while (wk <= B) {
        let jp = 0, meet = 0, libur = 0;
        for (let i = 0; i < 6; i++) {
          const d = addDays(wk, i); if (d < A || d > B) continue;
          const dow = d.getDay(); const j = +(p.jadwal[dow] || 0);
          if (!j) continue;
          if (set[key(d)]) { libur++; continue; }
          jp += j; meet++;
        }
        weeks.push({start:key(wk), month:wk.getMonth() < 0 ? 0 : (addDays(wk, 3)).getMonth(), year:addDays(wk,3).getFullYear(), jp, meet, libur});
        wk = addDays(wk, 7);
      }
    }
    // nomor minggu per bulan
    const cnt = {};
    weeks.forEach(w => { const k2 = w.year + "-" + w.month; cnt[k2] = (cnt[k2] || 0) + 1; w.mInMonth = cnt[k2]; w.label = BULAN_SINGKAT[w.month] + "-" + w.mInMonth; });
    out[s] = {weeks, total: weeks.reduce((x, w) => x + w.jp, 0), efektif: weeks.filter(w => w.jp > 0).length};
  });
  return out;
}
function jpPerMinggu(p){ return Object.values(p.jadwal || {}).reduce((a, b) => a + (+b || 0), 0); }
function atpJP(p, sem){ return (p.atp || []).filter(t => !sem || +t.semester === sem).reduce((a, t) => a + (+t.jp || 0), 0); }

/* ============ PROMES ============ */
function sebarPromes(p){
  const kal = hitungKalender(p); const res = {};
  [1, 2].forEach(sem => {
    const weeks = kal["s" + sem].weeks.map(w => Object.assign({}, w, {sisa: w.jp}));
    const rows = []; let wi = 0;
    p.atp.filter(t => +t.semester === sem).forEach(t => {
      let need = +t.jp || 0; const cells = {};
      while (need > 0 && wi < weeks.length) {
        const w = weeks[wi];
        if (w.sisa <= 0) { wi++; continue; }
        const take = Math.min(need, w.sisa); cells[w.start] = (cells[w.start] || 0) + take; w.sisa -= take; need -= take;
        if (w.sisa <= 0) wi++;
      }
      rows.push({tp:t, cells, kurang:need});
    });
    res[sem] = {weeks, rows};
  });
  return res;
}
