"""Renders the WL Digital privacy policy markdown into privacy.html: python3 build_privacy.py path/to/privacy-policy.md"""
import re, html, pathlib
import sys
src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "../WL_Digital/company/legal/privacy-policy.md")
out = pathlib.Path(__file__).parent / "privacy.html"

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*(.+?)\*", r"<em>\1</em>", s)
    s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
    s = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', s)
    return s

def slug(t):
    t = re.sub(r"[^\w\s-]", "", t.lower()).strip()
    return re.sub(r"[\s_]+", "-", t)

lines = src.read_text(encoding="utf-8").splitlines()
body, i, para = [], 0, []
def flush():
    if para:
        body.append("<p>" + inline(" ".join(para)) + "</p>"); para.clear()
while i < len(lines):
    l = lines[i]
    m = re.match(r"^(#{1,3}) (.*)", l)
    if m:
        flush(); n = len(m.group(1)); t = m.group(2)
        body.append(f'<h{n} id="{slug(t)}">{inline(t)}</h{n}>')
    elif l.startswith("|"):
        flush(); rows = []
        while i < len(lines) and lines[i].startswith("|"):
            cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
            if not all(re.fullmatch(r":?-+:?", c) for c in cells): rows.append(cells)
            i += 1
        body.append("<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in rows[0]) + "</tr></thead><tbody>" +
                    "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:]) + "</tbody></table>")
        continue
    elif re.match(r"^\s*[-*] ", l) or re.match(r"^\s*\d+\. ", l):
        flush(); ordered = bool(re.match(r"^\s*\d+\. ", l)); items = []
        while i < len(lines) and (re.match(r"^\s*[-*] ", lines[i]) or re.match(r"^\s*\d+\. ", lines[i])):
            items.append(re.sub(r"^\s*([-*]|\d+\.) ", "", lines[i])); i += 1
        tag = "ol" if ordered else "ul"
        body.append(f"<{tag}>" + "".join(f"<li>{inline(x)}</li>" for x in items) + f"</{tag}>")
        continue
    elif l.strip() == "":
        flush()
    else:
        para.append(l.strip())
    i += 1
flush()
page = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Privacy Policy | WL Digital</title>
  <meta name="description" content="The privacy policy for every WL Digital game and watch face.">
  <link rel="icon" type="image/png" href="assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html"><img src="assets/logo.png" alt="WL Digital logo" width="36" height="36">WL <span>DIGITAL</span></a>
    <nav class="nav">
      <a href="index.html#games">Games</a>
      <a href="index.html#watchfaces">Watch Faces</a>
      <a href="privacy.html">Privacy</a>
    </nav>
  </div>
</header>
<main class="prose">
{chr(10).join(body)}
</main>
<footer>
  <div class="wrap">
    <span>© 2026 WL Digital. All rights reserved.</span>
    <span><a href="index.html">Home</a></span>
  </div>
</footer>
</body>
</html>
"""
out.write_text(page, encoding="utf-8")
print("wrote", out, len(body), "blocks")
