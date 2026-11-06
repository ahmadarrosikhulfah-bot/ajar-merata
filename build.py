"""Bangun Ajar Merata dari src/.

Menghasilkan:
  index.html   versi lengkap satu berkas (GitHub Pages, dibuka langsung di HP/laptop)
  app.js       seluruh skrip aplikasi (dimuat oleh versi Canvas lewat jsDelivr)
  canvas.html  berkas kecil untuk Gemini Canvas: tampilan + <script src> ke app.js
"""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
REPO = "ahmadarrosikhulfah-bot/ajar-merata"
CDN = f"https://cdn.jsdelivr.net/gh/{REPO}@main/app.js"

js = "\n".join(open(f, encoding="utf-8").read() for f in sorted(glob.glob(os.path.join(here, "src", "0*.js"))))
shell = open(os.path.join(here, "src", "shell.html"), encoding="utf-8").read()

def w(name, text):
    open(os.path.join(here, name), "w", encoding="utf-8").write(text)
    print(f"{len(text):>7} bytes -> {name}")

w("index.html", shell.replace("/*__SCRIPT__*/", js))
w("app.js", js)
tag = "<script>\n/*__SCRIPT__*/\n</script>"
assert tag in shell, "penanda skrip tidak ditemukan di shell.html"
loader = (f'<script src="{CDN}" onerror="document.getElementById(\'main\').innerHTML=\'<div class=card><h2>Aplikasi belum termuat</h2>'
          '<p>Periksa koneksi internet lalu muat ulang halaman ini.</p></div>\'"></script>')
w("canvas.html", shell.replace(tag, loader))
