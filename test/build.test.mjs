import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

test('la compilación genera una página con el mensaje de bienvenida', async () => {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/build.mjs'], {
      stdio: 'ignore',
      env: {
        ...process.env,
        APP_ENV: 'test',
        APP_BASE_URL: 'http://localhost:4173',
        SUPABASE_URL: '',
        SUPABASE_PUBLISHABLE_KEY: '',
      },
    });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`build terminó con ${code}`)));
  });

  const html = await readFile('dist/index.html', 'utf8');
  const panel = await readFile('dist/panel.html', 'utf8');
  const financialRun = await readFile('dist/corrida-financiera.html', 'utf8');
  const investors = await readFile('dist/inversionistas.html', 'utf8');
  const construction = await readFile('dist/obra.html', 'utf8');
  const sales = await readFile('dist/ventas.html', 'utf8');
  const users = await readFile('dist/usuarios.html', 'utf8');
  const session = await readFile('dist/session.js', 'utf8');
  const config = await readFile('dist/config.js', 'utf8');
  assert.match(html, /Bienvenido/);
  assert.match(panel, /Finanzas/);
  assert.match(panel, /Inversionistas/);
  assert.match(panel, /Obra/);
  assert.match(panel, /Ventas/);
  assert.match(financialRun, /Corrida financiera/);
  assert.match(investors, /Inversionistas/);
  assert.match(construction, /Obra/);
  assert.match(sales, /Ventas/);
  assert.match(users, /SUPER ADMINISTRADOR/);
  assert.match(session, /requireSession/);
  assert.match(session, /auth\/v1\/user/);
  assert.match(html, /id="login-form"/);
  assert.match(config, /window\.APP_CONFIG/);
  assert.match(config, /"appEnv":"test"/);
  assert.doesNotMatch(config, /SERVICE_ROLE|SECRET_KEY|DATABASE_URL/);
});
