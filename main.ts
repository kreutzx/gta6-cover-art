// VICEFRAME Studio — hand-in program for the gta6-cover-art-01 bounty.
// Node 22, standard library only. Copies the static app in app/ and the
// screenshots in screenshots/ into the output directory, then writes the
// dossier the judge reads with the vendored make.fun library.
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts     (defaults to /output)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the scorer's gate exactly, so a hand-in this program
// accepts is one the scorer accepts too: at most 4 screenshots of at most
// 256 KiB each, at most 993 entries and 48 MiB under app/, and no path
// under app/ longer than 1000 UTF-8 bytes.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`VICEFRAME Studio handed in to ${outputDir}`);
