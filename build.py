"""Bangun Ajar Merata dari src/.

Menghasilkan:
  index.html   versi lengkap satu berkas (GitHub Pages, dibuka langsung di HP/laptop)
  app.js       seluruh aplikasi: gaya, kerangka tampilan, dan skrip (dimuat versi Canvas lewat jsDelivr)
  canvas.html  pemuat kecil untuk Gemini Canvas; cukup dipasang sekali
"""
import glob, json, os, re
here = os.path.dirname(os.path.abspath(__file__))
REPO = "ahmadarrosikhulfah-bot/ajar-merata"
CDN = f"https://cdn.jsdelivr.net/gh/{REPO}@main/app.js"

js = "\n".join(open(f, encoding="utf-8").read() for f in sorted(glob.glob(os.path.join(here, "src", "0*.js"))))
shell = open(os.path.join(here, "src", "shell.html"), encoding="utf-8").read()
css = re.search(r"<style>(.*?)</style>", shell, re.S).group(1)
body = re.search(r"<body>(.*?)<script>", shell, re.S).group(1)
title = re.search(r"<title>(.*?)</title>", shell).group(1)

prelude = ("/* Ajar Merata: pasang gaya dan kerangka tampilan bila dimuat dari canvas.html */\n"
           "(function(){ if (document.getElementById('main')) return;\n"
           "  var st = document.createElement('style'); st.textContent = " + json.dumps(css) + "; document.head.appendChild(st);\n"
           "  var ld = document.getElementById('am-loading'); if (ld) ld.remove();\n"
           "  document.body.insertAdjacentHTML('afterbegin', " + json.dumps(body) + ");\n"
           "})();\n")
app = prelude + js

def w(name, text):
    open(os.path.join(here, name), "w", encoding="utf-8").write(text)
    print(f"{len(text):>7} bytes -> {name}")

tag = "<script>\n/*__SCRIPT__*/\n</script>"
assert tag in shell, "penanda skrip tidak ditemukan di shell.html"
w("index.html", shell.replace("/*__SCRIPT__*/", js))
w("app.js", app)
w("canvas.html", f'''<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>body{{margin:0;background:#f7f3ea;color:#1f2a28;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}}</style>
</head>
<body>
<p id="am-loading" style="padding:24px">Memuat Ajar Merata...</p>
<script src="{CDN}" onerror="document.getElementById('am-loading').textContent='Aplikasi belum termuat. Periksa koneksi internet lalu muat ulang halaman ini.'"></script>
</body>
</html>
''')
