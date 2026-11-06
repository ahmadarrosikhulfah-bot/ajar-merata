/* ============ KERANGKA UI ============ */
const ACT = {};
const STEPS = [
  {n:1, t:"Profil Guru & Sekolah", ai:false},
  {n:2, t:"Paket Mengajar", ai:false},
  {n:3, t:"Kalender & Minggu Efektif", ai:false},
  {n:4, t:"Capaian Pembelajaran (CP)", ai:false},
  {n:5, t:"Alur Tujuan Pembelajaran (ATP)", ai:true},
  {n:6, t:"Program Tahunan (Prota)", ai:false},
  {n:7, t:"Program Semester (Promes)", ai:false},
  {n:8, t:"KKTP", ai:true},
  {n:9, t:"Modul Ajar Pembelajaran Mendalam", ai:true},
  {n:10, t:"Lembar Kerja Murid (LKPD)", ai:true},
  {n:11, t:"Rencana Asesmen", ai:true},
  {n:12, t:"Kisi-kisi & Kartu Soal", ai:true},
  {n:13, t:"Analisis Butir Soal", ai:false}
];
function stepDone(n){
  const p = P(), pr = state.profil;
  switch (n) {
    case 1: return !!(pr.namaGuru && pr.sekolah);
    case 2: return !!(p.mapel && p.kelas && (p.mapel !== "__lain" || p.mapelLain));
    case 3: return jpPerMinggu(p) > 0 && hitungKalender(p).s1.total > 0;
    case 4: return !!p.cpTeks.trim();
    case 5: return p.atp.length > 0;
    case 6: case 7: return p.atp.length > 0 && jpPerMinggu(p) > 0;
    case 8: return p.atp.length > 0 && p.atp.every(t => p.kktp[t.id]);
    case 9: return Object.values(p.modul).some(m => m && m.parts && ["identifikasi","desain","pengalaman","asesmen","lampiran"].every(k => m.parts[k]));
    case 10: return Object.keys(p.lkpd).length > 0;
    case 11: return p.asesmen.rows.length > 0;
    case 12: return p.kisi.butir.length > 0;
    case 13: return !!p.analisis.hasil;
  }
  return false;
}
function renderNav(){
  const el = document.getElementById("steps");
  el.innerHTML = STEPS.map(s => `<button class="step ${state.step === s.n ? "active" : ""} ${stepDone(s.n) ? "done" : ""}" data-act="go" data-arg="${s.n}">
    <span class="n">${stepDone(s.n) && state.step !== s.n ? "✓" : s.n}</span><span><span class="t">${esc(s.t)}${s.ai ? '<span class="ai-tag">AI</span>' : ""}</span></span></button>`).join("");
  const act = el.querySelector(".step.active"); if (act && act.scrollIntoView && window.innerWidth < 960) act.scrollIntoView({block:"nearest", inline:"center"});
}
function renderPkgSel(){
  const sel = document.getElementById("pkgSel");
  sel.innerHTML = state.pkgs.map((p, i) => `<option value="${i}" ${i === state.active ? "selected" : ""}>${esc((mapelName(p) || "Paket baru").slice(0, 28))} · ${esc(p.jenjang)} ${esc(p.kelas)}</option>`).join("");
}
function render(){
  const p0 = P(); syncTxtFields(p0); syncKKTP(p0); syncLKPD(p0);
  renderNav(); renderPkgSel(); renderSaveBar();
  const fn = RENDER[state.step] || RENDER[1];
  const main = document.getElementById("main");
  main.innerHTML = fn() + navBottom();
}
function renderAll(){ render(); window.scrollTo(0, 0); }
function navBottom(){
  const n = state.step;
  return `<div class="navbtm">${n > 1 ? `<button class="btn" data-act="go" data-arg="${n-1}">← Langkah ${n-1}</button>` : "<span></span>"}${n < 13 ? `<button class="btn pri" data-act="go" data-arg="${n+1}">Lanjut ke Langkah ${n+1} →</button>` : ""}</div>`;
}
function head(n, lead, helpItems){
  const s = STEPS[n-1];
  return `<div class="row" style="gap:6px;margin-bottom:6px"><span class="pill">Langkah ${n} dari 13</span>${s.ai ? '<span class="pill" style="color:var(--clay)">Memakai AI</span>' : '<span class="pill">Tanpa AI</span>'}${stepDone(n) ? '<span class="pill ok">✓ Sudah terisi</span>' : ""}</div>
  <h2>${esc(s.t)}</h2><p class="lead">${lead}</p>${helpItems ? `<details class="help"><summary>📘 Petunjuk langkah ini</summary><ol>${helpItems.map(h => "<li>" + h + "</li>").join("")}</ol></details>` : ""}`;
}
function needPkgInfo(){
  const p = P();
  if (!stepDone(2)) return `<div class="note warn">Lengkapi dulu <b>Langkah 2 (Paket Mengajar)</b>: pilih jenjang, kelas, dan mata pelajaran. <button class="btn sm" data-act="go" data-arg="2">Buka Langkah 2</button></div>`;
  return "";
}
function needATP(){
  if (!P().atp.length) return `<div class="note warn">Belum ada Tujuan Pembelajaran. Buat dulu di <b>Langkah 5 (ATP)</b>. <button class="btn sm" data-act="go" data-arg="5">Buka Langkah 5</button></div>`;
  return "";
}

/* ---------- layer / modal ---------- */
function openLayer(html){ const l = document.getElementById("layer"); l.innerHTML = `<div class="ovl" data-act="ovlClick">${html}</div>`; }
function closeLayer(){ document.getElementById("layer").innerHTML = ""; }
function alertModal(title, body){ openLayer(`<div class="modal"><div class="mhead"><h2>${esc(title)}</h2><button class="btn sm" data-act="closeLayer">✕</button></div><p>${esc(body)}</p><div class="row"><button class="btn pri" data-act="closeLayer">Tutup</button></div></div>`); }
function confirmModal(title, body, yesLabel, onYes){
  openLayer(`<div class="modal"><div class="mhead"><h2>${esc(title)}</h2></div><p>${body}</p><div class="row"><button class="btn danger" data-act="cfYes">${esc(yesLabel)}</button><button class="btn" data-act="closeLayer">Batal</button></div></div>`);
  ACT.cfYes = () => { closeLayer(); onYes(); };
}
function showBusy(msg){ const d = document.createElement("div"); d.className = "busy"; d.id = "busy"; d.innerHTML = `<div class="busy-box"><div class="spin"></div><b>${esc(msg)}</b><div class="small muted" style="margin-top:6px">Biasanya 10–40 detik. Jangan tutup halaman.</div></div>`; document.body.appendChild(d); }
function hideBusy(){ const d = document.getElementById("busy"); if (d) d.remove(); }

/* ---------- sambutan ---------- */
function fsButtons(){
  return `<div class="row fsrow">${["A","A+","A++"].map((l, i) => `<button class="btn sm ${state.ui.fs === i ? "on" : ""}" data-act="setFont" data-arg="${i}" style="font-size:${[0.9, 1.05, 1.2][i]}rem">${l}</button>`).join("")}</div>`;
}
function openWelcome(){
  openLayer(`<div class="modal welcome"><div class="mhead"><h2>Selamat datang di Ajar Merata 👋</h2><button class="btn sm" data-act="welcomeClose" aria-label="Tutup">✕</button></div>
  <p>Ajar Merata membantu Bapak/Ibu menyusun perangkat ajar lengkap: kalender, ATP, Prota, Promes, modul ajar, LKPD, asesmen, sampai soal. Gratis, dan isian tersimpan di perangkat ini.</p>
  <ol class="small" style="margin:6px 0 12px;padding-left:20px"><li>Isi profil sekolah dan kelas yang diajar.</li><li>Tempel teks CP resmi.</li><li>Tekan tombol AI berwarna oranye.</li><li>Periksa hasilnya, lalu unduh Word.</li></ol>
  <div class="menu-list">
    <button class="btn big pri" data-act="welcomeStart">▶ Mulai isi data saya<small>Dari Langkah 1: profil guru dan sekolah</small></button>
    <button class="btn big" data-act="welcomeSample">🧪 Coba dulu dengan contoh<small>Data contoh SD pesisir, kelas rangkap, IPAS</small></button>
    <button class="btn big" data-act="welcomeOpen">📂 Lanjutkan dari berkas .json<small>Berkas yang pernah Anda unduh dari aplikasi ini</small></button>
  </div>
  <h3 style="margin-top:16px">Ukuran tulisan</h3>${fsButtons()}
  <p class="small muted" style="margin-top:12px">Layar ini bisa dibuka lagi lewat Menu › Layar sambutan.</p></div>`);
}
ACT.welcomeClose = () => { state.ui.welcomed = true; save(); closeLayer(); };
ACT.welcomeStart = () => { state.ui.welcomed = true; state.step = 1; save(); closeLayer(); renderAll(); };
ACT.welcomeSample = () => { loadSample(); state.ui.welcomed = true; applyFont(); save(); closeLayer(); renderAll(); toast("Data contoh dimuat. Coba buka Langkah 5 sampai 13."); };
ACT.welcomeOpen = () => { state.ui.welcomed = true; save(); openJSON(); };
ACT.setFont = (i) => { state.ui.fs = +i; applyFont(); save(); document.querySelectorAll(".fsrow .btn").forEach((b, j) => b.classList.toggle("on", j === +i)); };
ACT.cycleFont = () => { state.ui.fs = (state.ui.fs + 1) % 3; applyFont(); save(); toast(["Tulisan normal", "Tulisan besar", "Tulisan sangat besar"][state.ui.fs]); };
ACT.openWelcome = openWelcome;

/* ---------- menu ---------- */
function openMenu(){
  openLayer(`<div class="modal"><div class="mhead"><h2>Menu</h2><button class="btn sm" data-act="closeLayer">✕</button></div>
  <div class="menu-list">
    <button class="btn pri" data-act="wordDl" data-arg="paket">📦 Unduh paket lengkap (satu berkas Word)</button>
    <button class="btn" data-act="downloadJSON">⬇ Unduh berkas kerja (.json)</button>
    <button class="btn" data-act="openJSON">📂 Buka berkas kerja (.json)</button>
    <button class="btn" data-act="openProgress">📊 Ringkasan progres</button>
    <button class="btn" data-act="openRegs">⚖ Acuan hukum (landasan regulasi)</button>
    <button class="btn" data-act="openGuide">📖 Cara pakai</button>
    <button class="btn" data-act="openWelcome">🏠 Layar sambutan</button>
    <button class="btn" data-act="openAISettings">⚙ Pengaturan AI</button>
    ${IN_CANVAS ? "" : `<a class="btn" href="${CANVAS_URL}" target="_blank" rel="noopener">✦ Buka versi AI sekali klik (Gemini) ↗</a>`}
    <button class="btn" data-act="loadSample">🧪 Muat data contoh (SD kelas rangkap, IPAS)</button>
    <button class="btn danger" data-act="resetAll">✨ Mulai baru (hapus semua isian)</button>
  </div>
  <h3 style="margin-top:14px">Ukuran tulisan</h3>${fsButtons()}
  <p class="small muted" style="margin-top:12px">Ajar Merata v${APP_VER}. Daftar acuan diperiksa per ${ACUAN_DICEK}.</p></div>`);
}
function openProgress(){
  const rows = state.pkgs.map((p, i) => {
    const done = STEPS.filter(s => { const keep = state.active; state.active = i; const d = stepDone(s.n); state.active = keep; return d; }).length;
    return `<tr><td>${esc(mapelName(p) || "(belum dipilih)")}</td><td>${esc(p.jenjang)} ${esc(p.kelas)}</td><td class="num">${done}/13</td><td class="num">${p.atp.length}</td><td class="num">${Object.keys(p.modul).length}</td></tr>`;
  }).join("");
  openLayer(`<div class="modal"><div class="mhead"><h2>Ringkasan progres</h2><button class="btn sm" data-act="closeLayer">✕</button></div>
  <div class="tbl-wrap"><table class="t"><tr><th>Paket</th><th>Kelas</th><th class="num">Langkah</th><th class="num">TP</th><th class="num">Modul</th></tr>${rows}</table></div>
  <div class="row" style="margin:10px 0"><button class="btn pri" data-act="wordDl" data-arg="paket">📦 Unduh paket lengkap paket aktif (satu berkas Word)</button></div>
  <p class="small muted">Satu guru bisa punya beberapa paket (misalnya guru kelas yang memegang beberapa mapel). Tambah paket di Langkah 2.</p></div>`);
}
function openRegs(){
  const p = P();
  const list = state.regs.map((r, i) => `<label class="chk" style="border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:6px 0;${regApplies(r, p) ? "" : "opacity:.6"}">
     <input type="checkbox" data-regi="${i}" ${r.checked ? "checked" : ""}><span><b>${i+1}.</b> ${esc(r.text)}<br><span class="small muted">${esc(SCOPE_LABEL[r.scope])}${regApplies(r, p) ? "" : " · tidak berlaku untuk paket aktif"}</span></span></label>`).join("");
  const custom = (state.regsCustom || []).map((r, i) => `<div class="row" style="margin:6px 0"><label class="chk" style="flex:1"><input type="checkbox" data-regc="${i}" ${r.checked ? "checked" : ""}><span>${esc(r.text)}</span></label><button class="btn sm danger" data-act="delRegC" data-arg="${i}">Hapus</button></div>`).join("");
  openLayer(`<div class="modal"><div class="mhead"><h2>Acuan hukum</h2><button class="btn sm" data-act="closeLayer">✕</button></div>
  <p class="small">Acuan yang dicentang dan berlaku untuk paket aktif dicetak sebagai <b>Landasan Regulasi</b> di setiap dokumen Word dan dipakai sebagai rujukan AI. Daftar diperiksa per ${ACUAN_DICEK}. Peraturan dapat berubah: periksa status keberlakuan di kanal resmi Kemendikdasmen (JDIH) dan Kemenag sebelum mengutip.</p>
  <div class="note info small">Nomor 4 diterbitkan oleh <b>Badan Kebijakan Pendidikan Dasar dan Menengah (BKPDM)</b> dan hanya mengubah CP Pendidikan Agama dan Budi Pekerti. CP mapel lain tetap mengacu pada Kepka BSKAP 046/H/KR/2025.</div>
  ${list}
  <h3 style="margin-top:14px">Acuan tambahan (Pergub, Perbup, SK kepala sekolah, dll.)</h3>${custom || '<p class="small muted">Belum ada.</p>'}
  <div class="row"><input class="in" id="regNew" style="flex:1" placeholder="Ketik nomor dan judul acuan persis seperti dokumen resminya"><button class="btn pri" data-act="addRegC">Tambah</button></div></div>`);
}
function openAISettings(){
  const k = userKey();
  openLayer(`<div class="modal"><div class="mhead"><h2>Pengaturan AI</h2><button class="btn sm" data-act="closeLayer">✕</button></div>
  <div class="note ${IN_CANVAS ? "ok" : "info"} small">${IN_CANVAS ? "Aplikasi berjalan di <b>Gemini Canvas</b>. AI memakai akun Google Anda sendiri, gratis sesuai kuota akun." : "Aplikasi berjalan <b>di luar Gemini Canvas</b>. Tanpa kunci API, tombol AI memakai mode salin-prompt."}</div>
  <h3>Kunci API Gemini pribadi <span class="small muted">(opsional, gratis)</span></h3>
  <p class="small">Buat kunci di <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> dengan akun Google Anda, lalu tempel di sini. Kunci hanya disimpan di perangkat ini dan <b>tidak</b> ikut tersimpan di berkas .json. Jangan bagikan kunci Anda kepada orang lain.</p>
  <div class="row"><input class="in" id="aiKey" type="password" autocomplete="off" style="flex:1" placeholder="Tempel kunci API" value="${esc(k)}">${k ? '<button class="btn danger" data-act="delKey">Hapus kunci</button>' : ""}</div>
  <h3 style="margin-top:14px">Daftar model</h3>
  <p class="small">Aplikasi mencoba model berikut berurutan dan mengingat yang berhasil. Google mengganti nama model dari waktu ke waktu; bila AI menolak (HTTP 403/404), perbarui daftar ini.</p>
  <textarea class="in" id="aiModels" style="min-height:100px">${esc(state.ai.models.join("\n"))}</textarea>
  <p class="small muted">Model terakhir yang berhasil: <b>${esc(state.ai.lastOk || "belum ada")}</b></p>
  <label class="chk"><input type="checkbox" id="aiManual" ${state.ai.alwaysManual ? "checked" : ""}><span><b>Selalu pakai mode salin-prompt</b> (perintah disalin ke Gemini, ChatGPT, atau Meta AI, lalu jawabannya ditempel kembali).</span></label>
  <div class="row" style="margin-top:10px"><button class="btn pri" data-act="saveAISettings">Simpan</button><button class="btn" data-act="resetAIModels">Kembalikan model bawaan</button></div></div>`);
}
function openGuide(){
  openLayer(`<div class="modal"><div class="mhead"><h2>Cara pakai Ajar Merata</h2><button class="btn sm" data-act="closeLayer">✕</button></div>
  <details class="help" open><summary>Mulai cepat</summary><ol>
    <li>Ingin mencoba dulu? Buka Menu › <b>Muat data contoh</b>. Profil, paket, kalender, CP contoh, dan ATP langsung terisi sehingga langkah tanpa AI bisa dicoba.</li>
    <li>Mulai sungguhan: isi Langkah 1–4 berurutan. Langkah 4 (CP) adalah sumber semua isi berikutnya.</li>
    <li>Langkah 5 (ATP) adalah pusat. Prota, Promes, KKTP, Modul, LKPD, asesmen, dan soal dibangun dari ATP.</li>
    <li>Setiap langkah punya tombol <b>Unduh Word</b>. Dokumen sudah berisi identitas, landasan regulasi, dan kolom tanda tangan.</li>
  </ol></details>
  <details class="help"><summary>Menyimpan dan melanjutkan</summary><ul>
    <li>Isian tersimpan otomatis di perangkat ini bila peramban mengizinkan (lihat bilah hijau di atas).</li>
    <li>Unduh <b>berkas .json</b> sebagai cadangan, atau untuk pindah ke HP/laptop lain lewat Menu › Buka berkas kerja.</li>
    <li>Berkas .json bisa dikirim lewat WhatsApp ke rekan guru sebagai contoh.</li>
  </ul></details>
  <details class="help"><summary>Fitur khusus untuk sekolah 3T</summary><ul>
    <li><b>Kondisi sarana</b> (Langkah 1) memberi tahu AI agar kegiatan tetap jalan tanpa listrik, internet, proyektor, atau printer.</li>
    <li><b>Potensi dan kearifan lokal</b> dipakai sebagai contoh dan bahan belajar.</li>
    <li><b>Kelas rangkap</b> (Langkah 2): modul dan LKPD diberi pembedaan per tingkat kelas.</li>
    <li><b>Bahasa ibu murid</b> dipakai sebagai jembatan di kegiatan awal.</li>
    <li><b>Mode salin-prompt</b>: bila AI di Canvas gagal, perintah bisa disalin ke chatbot lain lalu jawabannya ditempel kembali.</li>
  </ul></details>
  <details class="help"><summary>Madrasah dan Kurikulum Berbasis Cinta</summary><ul>
    <li>Pilih <b>Kementerian Agama</b> di Langkah 1 atau 2. Jenjang berubah menjadi RA, MI, MTs, MA, MAK dan mapel PAI madrasah muncul.</li>
    <li>Centang <b>Integrasikan Kurikulum Berbasis Cinta</b> di Langkah 2 agar Panca Cinta masuk ke ATP, modul, dan asesmen.</li>
    <li>AI tidak menulis teks ayat/hadis. Kotak penanda disediakan agar guru mengisinya sendiri dari sumber yang sahih.</li>
  </ul></details>
  <details class="help"><summary>Masalah umum</summary><ul>
    <li><b>AI gagal (HTTP 403/404):</b> nama model sudah tidak dilayani Canvas. Buka Menu › Pengaturan AI, atau pakai mode salin-prompt.</li>
    <li><b>HTTP 429:</b> kuota akun Gemini habis. Tunggu atau coba besok.</li>
    <li><b>Total JP ATP merah:</b> JP usulan melebihi JP kalender. Kurangi JP beberapa TP atau pindahkan ke semester lain.</li>
    <li><b>Tanggal libur tidak terbaca:</b> tulis satu kegiatan per baris dengan format <code>DD-MM-YYYY Keterangan</code> atau <code>DD-MM-YYYY sampai DD-MM-YYYY Keterangan</code>.</li>
    <li><b>Tabel di Word terlalu lebar:</b> klik tabel › Tata Letak › Paskan Otomatis › Paskan ke Jendela.</li>
  </ul></details></div>`);
}

/* ---------- event ---------- */
ACT.go = (n) => { state.step = +n; save(); renderAll(); };
ACT.openMenu = openMenu; ACT.closeLayer = closeLayer;
ACT.ovlClick = (a, el, ev) => { if (ev.target === el) { if (!state.ui.welcomed) { state.ui.welcomed = true; save(); } closeLayer(); } };
ACT.downloadJSON = () => { downloadJSON(); toast("Berkas .json diunduh. Simpan di tempat yang mudah ditemukan."); };
ACT.openJSON = openJSON; ACT.openProgress = openProgress; ACT.openRegs = openRegs; ACT.openGuide = openGuide; ACT.openAISettings = openAISettings;
ACT.addRegC = () => { const v = document.getElementById("regNew").value.trim(); if (!v) return; state.regsCustom.push({text:v, checked:true}); save(); openRegs(); };
ACT.delRegC = (i) => { state.regsCustom.splice(+i, 1); save(); openRegs(); };
ACT.saveAISettings = () => {
  const m = document.getElementById("aiModels").value.split(/\n/).map(x => x.trim()).filter(Boolean);
  state.ai.models = m.length ? m : AI_MODELS.slice(); if (!state.ai.models.includes(state.ai.lastOk)) state.ai.lastOk = "";
  state.ai.alwaysManual = document.getElementById("aiManual").checked;
  setUserKey(document.getElementById("aiKey").value.trim()); save(); closeLayer(); toast("Pengaturan AI disimpan.");
};
ACT.delKey = () => { setUserKey(""); openAISettings(); toast("Kunci dihapus dari perangkat ini."); };
ACT.resetAIModels = () => { state.ai.models = AI_MODELS.slice(); state.ai.lastOk = ""; save(); openAISettings(); };
ACT.resetAll = () => confirmModal("Mulai baru?", "Semua isian di perangkat ini akan dihapus. Unduh .json dulu bila masih diperlukan.", "Ya, hapus semua", () => { state = defaultState(); state.pkgs.push(newPkg()); save(); renderAll(); toast("Mulai dari awal."); });
ACT.loadSample = () => confirmModal("Muat data contoh?", "Isian yang ada sekarang akan diganti dengan data contoh. Unduh .json dulu bila masih diperlukan.", "Muat contoh", () => { loadSample(); save(); renderAll(); toast("Data contoh dimuat."); });

document.addEventListener("click", ev => {
  const el = ev.target.closest("[data-act]"); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  if (el.dataset.act !== "ovlClick") ev.preventDefault();
  fn(el.dataset.arg, el, ev);
});
document.addEventListener("input", ev => {
  const el = ev.target;
  if (el.dataset.bind) {
    let v = el.type === "checkbox" ? el.checked : el.value;
    if (el.dataset.num !== undefined) v = v === "" ? 0 : +v;
    setPath(el.dataset.bind, v);
    if (el.dataset.after && AFTER[el.dataset.after]) AFTER[el.dataset.after]();
    save();
    if (el.dataset.rerender !== undefined) { const y = window.scrollY; render(); window.scrollTo(0, y); }
    else if (el.dataset.live) { const fn = LIVE[el.dataset.live]; if (fn) fn(); }
  }
  if (el.dataset.regi !== undefined) { state.regs[+el.dataset.regi].checked = el.checked; save(); }
  if (el.dataset.regc !== undefined) { state.regsCustom[+el.dataset.regc].checked = el.checked; save(); }
});
document.addEventListener("change", ev => {
  const el = ev.target;
  if (el.id === "pkgSel") { state.active = +el.value; save(); renderAll(); return; }
});
const LIVE = {};
