import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../src/data/androidProjectTemplate.js';

async function main() {
  const outDir = process.argv[2] ?? 'android-project';
  const zipPath = process.argv[3] ?? 'nordvpn-ikev2-explorer-android6-plus.zip';

  fs.rmSync(outDir, { recursive: true, force: true });
  const zip = new JSZip();

  for (const file of ANDROID_PROJECT_FILES) {
    const target = path.join(outDir, file.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.content, 'utf8');
    zip.file(file.path, file.content);
  }

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(zipPath, buffer);
  console.log(`Materialized ${ANDROID_PROJECT_FILES.length} Android files into ${outDir} and ${zipPath} (${buffer.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
