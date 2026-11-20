# VICEFRAME Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/kreutzx/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/kreutzx/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An entry for the make.fun bounty [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).

**VICEFRAME Studio** is an offline, GTA-poster-style cover art maker with an original design — no Rockstar or GTA logos, wordmarks, official artwork, characters, or fonts. Load your own photos (they are read locally with FileReader and never uploaded), arrange them across six multi-panel poster layouts (3×3 grid, hero + trio, tilted snaps, full bleed, split duo, film strip), frame each panel with pan / zoom / rotate controls and a live preview, and finish the poster with an editable caption in bold display lettering (Anton) plus a script subtitle (Pacifico) — both fonts ship under `app/fonts/` under the SIL Open Font License.

Poster dressing includes a ribbon banner, a star meter, sun rays, palm silhouettes, halftone dots, film grain, and a vignette. Six colour grades are built in (Vice Sunset and Neon Nights among them), along with undo/redo and a shuffle button for instant remixes. Posters export as PNG at exactly 1080×1080, 1080×1350, and 1920×1080.

The app is plain static files under `app/` with no build step and works fully offline in desktop Chrome: every script, font, and image it loads is a file under `app/` or a `data:` URI. Three original sample photos live under `app/samples/`. Opening the app with `?shot=<scene>` (scenes are defined in `shots.json`) deterministically sets up a named poster for reproducible screenshots.

## Run it locally

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to the output directory and writes `dossier.json` there using `buildDossier` from `vendor/makefun-app.ts`.

## Referral

Try make.fun via the entrant's referral link: https://make.fun/r/24q484pk

## License

MIT — see `LICENSE`. The Anton and Pacifico fonts are licensed separately under the SIL Open Font License 1.1 (see `app/fonts/OFL.txt`).
