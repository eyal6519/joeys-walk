import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

/**
 * Generates the PWA icons with no image dependency: a white paw print on the
 * brand background, rasterised at 4x and box-downsampled for anti-aliasing,
 * then encoded as a PNG by hand (zlib + CRC32).
 *
 * Run with `node scripts/generate-icons.mjs`; output goes to apps/web/public/icons.
 */

const BRAND = [169, 113, 63]; // --color-brand #a9713f
const PAW = [255, 255, 255];

// Geometry in 512-space, scaled to each icon size.
const TOES_512 = [
  { cx: 144, cy: 252, r: 41 },
  { cx: 212, cy: 194, r: 45 },
  { cx: 300, cy: 194, r: 45 },
  { cx: 368, cy: 252, r: 41 },
];
const PAD_512 = { cx: 256, cy: 342, rx: 112, ry: 90 };

const SS = 4; // supersampling factor

function coverage(x, y, scale) {
  let hits = 0;
  for (let sy = 0; sy < SS; sy += 1) {
    for (let sx = 0; sx < SS; sx += 1) {
      const px = (x + (sx + 0.5) / SS) / scale;
      const py = (y + (sy + 0.5) / SS) / scale;
      let inside = false;
      for (const t of TOES_512) {
        if ((px - t.cx) ** 2 + (py - t.cy) ** 2 <= t.r ** 2) inside = true;
      }
      const dx = (px - PAD_512.cx) / PAD_512.rx;
      const dy = (py - PAD_512.cy) / PAD_512.ry;
      if (dx * dx + dy * dy <= 1) inside = true;
      if (inside) hits += 1;
    }
  }
  return hits / (SS * SS);
}

function render(size) {
  const scale = size / 512;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  let offset = 0;
  for (let y = 0; y < size; y += 1) {
    raw[offset] = 0; // PNG filter: none
    offset += 1;
    for (let x = 0; x < size; x += 1) {
      const a = coverage(x, y, scale);
      for (let c = 0; c < 3; c += 1) {
        raw[offset] = Math.round(BRAND[c] * (1 - a) + PAW[c] * a);
        offset += 1;
      }
    }
  }
  return raw;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function png(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(render(size), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../apps/web/public/icons');
mkdirSync(outDir, { recursive: true });
for (const size of [180, 192, 512]) {
  const file = resolve(outDir, `icon-${size}.png`);
  writeFileSync(file, png(size));
  process.stdout.write(`wrote ${file}\n`);
}
