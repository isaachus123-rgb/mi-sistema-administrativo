import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'src');
const output = resolve(root, 'dist');

try {
  const envFile = await readFile(resolve(root, '.env'), 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim();
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

const publicConfig = {
  appEnv: process.env.APP_ENV ?? 'development',
  appBaseUrl: process.env.APP_BASE_URL ?? '',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
};

await writeFile(
  resolve(output, 'config.js'),
  `window.APP_CONFIG = ${JSON.stringify(publicConfig)};\n`,
  'utf8',
);

console.log('Sitio generado en dist/');
