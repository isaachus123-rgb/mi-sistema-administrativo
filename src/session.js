export function getSession() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const session = JSON.parse(storage.getItem('mi-sistema-session') || 'null');
      if (session?.access_token && session?.expires_at > Math.floor(Date.now() / 1000)) return session;
    } catch { /* Se limpia abajo. */ }
    storage.removeItem('mi-sistema-session');
  }
  return null;
}

export function api(path, options = {}) {
  const session = getSession();
  const { supabaseUrl, supabasePublishableKey } = window.APP_CONFIG ?? {};
  if (!session || !supabaseUrl || !supabasePublishableKey) throw new Error('Sesión no disponible.');
  return fetch(`${supabaseUrl}${path}`, { ...options, headers: { apikey: supabasePublishableKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json', ...options.headers } });
}

export async function requireSession({ superAdmin = false } = {}) {
  const session = getSession();
  if (!session) return redirectToLogin();
  try {
    const response = await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}&select=id,email,full_name,role,active`);
    if (!response.ok) throw new Error();
    const [profile] = await response.json();
    if (!profile?.active) throw new Error();
    if (superAdmin && profile.role !== 'super_administrador') { window.location.replace('./panel.html'); return null; }
    document.querySelectorAll('[data-super-admin]').forEach((element) => { element.hidden = profile.role !== 'super_administrador'; });
    return profile;
  } catch { clearSession(); return redirectToLogin(); }
}

export function clearSession() { localStorage.removeItem('mi-sistema-session'); sessionStorage.removeItem('mi-sistema-session'); }
export function bindLogout() {
  document.querySelectorAll('[data-logout]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault(); clearSession(); window.location.replace('./index.html');
  }));
}
function redirectToLogin() { window.location.replace('./index.html'); return null; }
