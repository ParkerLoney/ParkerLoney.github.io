# WL Digital website

The studio's public site, served by GitHub Pages from the root of this repo on `main`:
https://parkerloney.github.io/

- `index.html`: the home page (games, watch faces, about, contact). Plain HTML and CSS, no build step.
- `privacy.html`: generated from the privacy policy markdown in the WL_Digital repo
  (`company/legal/privacy-policy.md`). After editing the policy, run
  `python3 build_privacy.py path/to/privacy-policy.md` and commit the result.
- `assets/`: web-sized copies of the store art from the WL_Digital repo.
- `style.css` and `site.js`: the shared look and the small interactions (scroll reveal, tabs, header). Motion uses only transform and opacity, and hover effects only run with a mouse.
- `app-ads.txt`: the ad sellers file AdMob and LevelPlay read.
