import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

function safeEqual(a: string, b: string) {
	const aa = new TextEncoder().encode(a);
	const bb = new TextEncoder().encode(b);
	if (aa.length !== bb.length) return false;
	let result = 0;
	for (let i = 0; i < aa.length; i++) result |= aa[i] ^ bb[i];
	return result === 0;
}

function getErrorResponse(error: unknown) {
	if (error instanceof Error) return { error: error.message };
	if (typeof error === 'object' && error !== null) {
		const value = error as { message?: string; details?: string; hint?: string; code?: string };
		return {
			error: value.message ?? 'Error de Supabase',
			...(value.details ? { details: value.details } : {}),
			...(value.hint ? { hint: value.hint } : {}),
			...(value.code ? { code: value.code } : {})
		};
	}
	return { error: 'Error desconocido' };
}

Deno.serve(async req => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
	try {
		const auth = req.headers.get('Authorization');
		if (!auth) throw new Error('Falta la sesión');
		const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
		const { data: { user }, error: userError } = await userClient.auth.getUser();
		if (userError || !user) throw new Error('Sesión no válida');
		const { householdSlug, displayName, password, remember } = await req.json();
		const expected = Deno.env.get('HOUSEHOLD_PASSWORD');
		if (typeof password !== 'string' || !expected || !safeEqual(password, expected)) {
			return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });
		}
		if (!['Nahuel', 'ML', 'lili'].includes(displayName)) throw new Error('Perfil no válido');
		const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
		const { data: profile, error: profileError } = await admin.from('profiles').select('id,display_name,household_id,households!inner(slug)').eq('display_name', displayName).eq('households.slug', householdSlug).single();
		if (profileError || !profile) throw profileError ?? new Error('Perfil no encontrado');
		const days = remember ? 30 : 1;
		const expires = new Date(Date.now() + days * 86400000).toISOString();
		const { error: grantError } = await admin.from('access_grants').upsert({ auth_user_id: user.id, profile_id: profile.id, expires_at: expires });
		if (grantError) throw grantError;
		return new Response(JSON.stringify({ profile: { id: profile.id, display_name: profile.display_name, household_id: profile.household_id, expires_at: expires } }), { headers: { ...cors, 'Content-Type': 'application/json' } });
	} catch (error) {
		console.error('household-access error', error);
		return new Response(JSON.stringify(getErrorResponse(error)), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
	}
});
