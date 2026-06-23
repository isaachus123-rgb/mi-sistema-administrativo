import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

test('la compilación genera una página con el mensaje de bienvenida', async () => {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/build.mjs'], {
      stdio: 'ignore',
      env: { ...process.env, SUPABASE_URL: '', SUPABASE_PUBLISHABLE_KEY: '' },
    });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`build terminó con ${code}`)));
  });

  const html = await readFile('dist/index.html', 'utf8');
  const config = await readFile('dist/config.js', 'utf8');
  assert.match(html, /Bienvenido/);
  assert.match(config, /window\.APP_CONFIG/);
});
