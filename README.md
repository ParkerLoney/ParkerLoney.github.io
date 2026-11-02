# WL Digital website

The studio's public site, served by GitHub Pages from the root of this repo on `main`:
https://parkerloney.github.io/

- `index.html`: the home page (games, watch faces, about, contact). Plain HTML and CSS, no build step.
- `privacy.html`: generated from the privacy policy markdown in the WL_Digital repo
  (`company/legal/privacy-policy.md`). After editing the policy, run
  `python3 build_privacy.py path/to/privacy-policy.md` and commit the result.
- `assets/`: web-sized copies of the store art from the WL_Digital repo.
- Social links: fill in the `SOCIALS` handles near the bottom of `index.html` and they appear automatically.
