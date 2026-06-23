import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) return json({ error: 'Sesión requerida.' }, 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: userError } = await caller.auth.getUser();
    if (userError || !user) return json({ error: 'Sesión inválida.' }, 401);
    const { data: profile } = await caller.from('profiles').select('role, active').eq('id', user.id).single();
    if (!profile?.active || profile.role !== 'super_administrador') return json({ error: 'No tienes permiso para invitar usuarios.' }, 403);

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const fullName = String(body.full_name ?? '').trim();
    const allowedRoles = ['usuario', 'administrador', 'super_administrador'];
    const role = allowedRoles.includes(body.role) ? body.role : 'usuario';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Escribe un correo válido.' }, 400);

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName } });
    if (error) return json({ error: error.message }, 400);
    const { error: profileError } = await admin.from('profiles').update({ role }).eq('id', data.user.id);
    if (profileError) return json({ error: profileError.message }, 500);
    return json({ user: { id: data.user.id, email, full_name: fullName, role } }, 201);
  } catch {
    return json({ error: 'No fue posible procesar la invitación.' }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
}
