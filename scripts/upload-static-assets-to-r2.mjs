/**
 * Upload frontend public/images/* → R2 prefix `assets/`.
 * Credentials: backend .env.dokploy (or env vars already set).
 *
 * Usage: node scripts/upload-static-assets-to-r2.mjs
 */
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const frontendRoot = resolve(__dirname, '..');
const imagesDir = join(frontendRoot, 'public', 'images');
const backendEnvPath = resolve(frontendRoot, '..', 'tashyik-backend-github', '.env.dokploy');

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  const out = {};

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eq = trimmed.indexOf('=');

    if (eq === -1) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

const fileEnv = loadEnvFile(backendEnvPath);

function env(name, fallback = '') {
  return process.env[name] || fileEnv[name] || fallback;
}

const accessKeyId = env('R2_ACCESS_KEY_ID');
const secretAccessKey = env('R2_SECRET_ACCESS_KEY');
const bucket = env('R2_BUCKET', 'tashyik');
const endpoint = env('R2_ENDPOINT');
const publicUrl = env('R2_PUBLIC_URL', 'https://r2media.tashyik.com').replace(/\/$/, '');
const prefix = 'assets';

if (!accessKeyId || !secretAccessKey || !endpoint) {
  console.error('Missing R2 credentials (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_ENDPOINT).');
  process.exit(1);
}

if (!existsSync(imagesDir)) {
  console.error(`Images dir not found: ${imagesDir}`);
  process.exit(1);
}

const contentTypes = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
};

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

const files = readdirSync(imagesDir).filter((name) => {
  const full = join(imagesDir, name);
  return statSync(full).isFile() && contentTypes[extname(name).toLowerCase()];
});

async function uploadFile(localPath, key) {
  const ext = extname(localPath).toLowerCase();
  const body = createReadStream(localPath);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentTypes[ext] || 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return `${publicUrl}/${key}`;
}

const uploaded = [];

for (const name of files) {
  const localPath = join(imagesDir, name);
  const key = `${prefix}/${name}`;
  const url = await uploadFile(localPath, key);
  uploaded.push(url);
  console.log(`OK  ${key}`);
}

// OG fallback used by SEO helpers (file missing locally) — reuse about hero.
const ogSource = join(imagesDir, 'about-hero-section.webp');

if (existsSync(ogSource)) {
  const ogUrl = await uploadFile(ogSource, `${prefix}/og.webp`);
  uploaded.push(ogUrl);
  console.log(`OK  ${prefix}/og.webp (from ${basename(ogSource)})`);
}

console.log(`\nUploaded ${uploaded.length} objects under ${publicUrl}/${prefix}/`);
