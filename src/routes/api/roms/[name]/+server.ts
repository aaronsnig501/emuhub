import {
	assertAuthorized,
	deleteRom,
	readRom,
	sanitizeRomName
} from '$lib/server/selfHosted';
import { json } from '@sveltejs/kit';

export const prerender = false;

export async function GET({ params, request }) {
	assertAuthorized(request);
	const name = sanitizeRomName(params.name);
	const bytes = await readRom(name);

	return new Response(bytes, {
		headers: {
			'content-type': 'application/octet-stream',
			'content-disposition': `attachment; filename="${name}"`,
			'cache-control': 'private, no-store'
		}
	});
}

export async function DELETE({ params, request }) {
	assertAuthorized(request);
	await deleteRom(params.name);

	return json({ ok: true });
}
