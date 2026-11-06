"""Gabungkan src/ menjadi index.html (satu berkas)."""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
js = "\n".join(open(f, encoding="utf-8").read() for f in sorted(glob.glob(os.path.join(here, "src", "0*.js"))))
html = open(os.path.join(here, "src", "shell.html"), encoding="utf-8").read().replace("/*__SCRIPT__*/", js)
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(html)
print(len(html), "bytes -> index.html")
