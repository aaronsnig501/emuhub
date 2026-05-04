import {
	assertAuthorized,
	assertSelfHosted,
	listRoms,
	writeRom
} from '$lib/server/selfHosted';
import { json } from '@sveltejs/kit';

export const prerender = false;

export async function GET({ request }) {
	assertAuthorized(request);

	return json({
		roms: await listRoms()
	});
}

export async function POST({ request }) {
	assertAuthorized(request);
	const formData = await request.formData();
	const rom = formData.get('rom');

	if (!(rom instanceof File)) {
		return json({ error: 'ROM file is required' }, { status: 400 });
	}

	const savedName = await writeRom(rom.name, new Uint8Array(await rom.arrayBuffer()));

	return json(
		{
			ok: true,
			name: savedName
		},
		{ status: 201 }
	);
}

export function HEAD() {
	assertSelfHosted();
	return new Response(null, { status: 200 });
}
