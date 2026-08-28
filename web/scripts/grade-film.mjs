/* Sample the film's brightness OFFLINE, once, and emit a table.

   The old build did this at runtime: it drew the <video> into a 48x8 canvas
   and called getImageData() every frame. On a phone that is a cross-process
   readback of ~8.3ms against a 16.7ms budget, and it ran two or three times a
   tick. It is the single most expensive thing the old loop did.

   The answer does not depend on the visitor. It depends on the FILM, which is
   fixed. So it is computed here, once, and shipped as numbers. */
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const V = 'public/assets/video';
const GW = 48, GH = 8;

function sample(file, crop, gh) {
  return new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-v','error','-i',file,'-vf',
      `crop=${crop},scale=${GW}:${gh},format=gray`,'-f','rawvideo','-']);
    const chunks = [];
    ff.stdout.on('data', (c) => chunks.push(c));
    ff.stderr.on('data', (c) => process.stderr.write(c));
    ff.on('close', (code) => {
      if (code !== 0) return rej(new Error('ffmpeg ' + code));
      const buf = Buffer.concat(chunks);
      const per = GW * gh;
      const frames = Math.floor(buf.length / per);
      const out = [];
      for (let f = 0; f < frames; f++) {
        const s = buf.subarray(f * per, (f + 1) * per);
        const sorted = Array.from(s).sort((a, b) => a - b);
        out.push(sorted);
      }
      res(out);
    });
  });
}

/* Rec.709 luma is what the old build used, but a gray-converted frame already
   IS luma, so the sorted byte array is directly comparable. */
const GRADE_LO = 30, GRADE_HI = 185;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ramp = (v) => Math.round(clamp01((v - GRADE_LO) / (GRADE_HI - GRADE_LO)) * 100) / 100;

/* nav: 48x4 = 192 samples, the 188th taken (~97.4th percentile) and floored at
   0.20 — not the max, because one blown highlight in a corner should not
   darken the whole nav for a second. Verbatim from the old build's rule. */
const navOf = (sorted) => Math.max(0.2, ramp(sorted[Math.floor(sorted.length * 0.974)]));
/* a story line: the MAX under the line, no floor. A line only needs a scrim
   where it would otherwise sit on a bright patch, and zero is a legitimate
   answer. */
const lineOf = (sorted) => ramp(sorted[sorted.length - 1]);

const JOBS = {
  wide: {
    file: `${V}/film-wide.mp4`,
    nav:    { crop: '1920:94:0:0',    gh: 4, fn: navOf },
    reveal: { crop: '899:230:200:238', gh: GH, fn: lineOf },
    kit:    { crop: '899:210:200:207', gh: GH, fn: lineOf },
  },
  phone: {
    file: `${V}/film-phone.mp4`,
    nav:    { crop: '608:100:0:0',   gh: 4, fn: navOf },
    reveal: { crop: '608:174:0:156', gh: GH, fn: lineOf },
    kit:    { crop: '608:174:0:277', gh: GH, fn: lineOf },
  },
};

const out = {};
for (const [band, job] of Object.entries(JOBS)) {
  out[band] = {};
  for (const key of ['nav', 'reveal', 'kit']) {
    const { crop, gh, fn } = job[key];
    const frames = await sample(job.file, crop, gh);
    out[band][key] = frames.map(fn);
    const a = out[band][key];
    console.error(`  ${band}.${key}: ${a.length} frames, min ${Math.min(...a)}, max ${Math.max(...a)}`);
  }
}
fs.writeFileSync('/tmp/grade.json', JSON.stringify(out));
console.error('wrote /tmp/grade.json');
