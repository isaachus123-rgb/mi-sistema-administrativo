import { api, bindLogout, requireSession } from './session.js';

const body = document.querySelector('#users-body');
const form = document.querySelector('#invite-form');
const message = document.querySelector('#users-message');
const refresh = document.querySelector('#refresh-users');
let currentUserId = '';

bindLogout();
const profile = await requireSession({ superAdmin: true });
if (profile) { currentUserId = profile.id; await loadUsers(); }
refresh.addEventListener('click', loadUsers);
form.addEventListener('submit', async (event) => {
  event.preventDefault(); setMessage('Enviando invitación…');
  try {
    const values = Object.fromEntries(new FormData(form));
    const response = await api('/functions/v1/invite-user', { method: 'POST', body: JSON.stringify(values) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'No fue posible invitar al usuario.');
    form.reset(); setMessage('Invitación enviada correctamente.', 'success'); await loadUsers();
  } catch (error) { setMessage(error.message, 'error'); }
});

async function loadUsers() {
  refresh.disabled = true;
  try {
    const response = await api('/rest/v1/profiles?select=id,email,full_name,role,active,created_at&order=created_at.desc');
    if (!response.ok) throw new Error('No fue posible cargar los usuarios.');
    renderUsers(await response.json());
  } catch (error) { body.innerHTML = `<tr><td colspan="3">${escapeHtml(error.message)}</td></tr>`; }
  finally { refresh.disabled = false; }
}

function renderUsers(users) {
  body.replaceChildren(...users.map((user) => {
    const row = document.createElement('tr');
    const identity = document.createElement('td');
    identity.innerHTML = `<strong>${escapeHtml(user.full_name || 'Sin nombre')}</strong><small>${escapeHtml(user.email)}</small>`;
    const roleCell = document.createElement('td');
    const select = document.createElement('select');
    select.setAttribute('aria-label', `Rol de ${user.email}`);
    [['usuario', 'Usuario'], ['administrador', 'Administrador'], ['super_administrador', 'Super administrador']].forEach(([value, label]) => select.add(new Option(label, value, false, user.role === value)));
    select.addEventListener('change', () => updateUser(user.id, { role: select.value }, select));
    roleCell.append(select);
    const stateCell = document.createElement('td');
    const state = document.createElement('button');
    state.className = `state-button ${user.active ? 'active' : ''}`; state.textContent = user.active ? 'Activo' : 'Inactivo'; state.disabled = user.id === currentUserId;
    state.addEventListener('click', () => updateUser(user.id, { active: !user.active }, state));
    stateCell.append(state); row.append(identity, roleCell, stateCell); return row;
  }));
}

async function updateUser(id, changes, control) {
  control.disabled = true;
  try {
    const response = await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(changes) });
    if (!response.ok) throw new Error((await response.json()).message || 'No fue posible guardar el cambio.');
    setMessage('Permisos actualizados.', 'success'); await loadUsers();
  } catch (error) { setMessage(error.message, 'error'); await loadUsers(); }
}
function setMessage(text, type = '') { message.textContent = text; message.className = type; }
function escapeHtml(text) { const node = document.createElement('div'); node.textContent = text; return node.innerHTML; }
