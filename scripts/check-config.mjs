const forbiddenPublicVariables = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'DATABASE_URL',
  'GMAIL_CLIENT_SECRET',
];

const exposed = forbiddenPublicVariables.filter((name) => process.env[name]);

if (exposed.length > 0) {
  console.error(`Configuración insegura: no expongas ${exposed.join(', ')} en el sitio web.`);
  process.exit(1);
}

if (process.env.APP_BASE_URL) {
  try {
    const url = new URL(process.env.APP_BASE_URL);
    const isLocal = ['localhost', '127.0.0.1'].includes(url.hostname);
    if (url.protocol !== 'https:' && !isLocal) {
      throw new Error('APP_BASE_URL debe usar HTTPS fuera del entorno local.');
    }
  } catch (error) {
    console.error(`APP_BASE_URL no es válida: ${error.message}`);
    process.exit(1);
  }
}

console.log('Configuración pública validada.');
