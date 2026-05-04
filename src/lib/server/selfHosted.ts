import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

export type RomEntry = {
	name: string;
	size: number;
	modifiedAt: string;
};

function getRequiredToken() {
	return env.SELF_HOSTED_API_TOKEN?.trim() ?? '';
}

export function isSelfHostedEnabled() {
	return env.SELF_HOSTED === 'true';
}

export function getSelfHostedConfig() {
	return {
		selfHosted: isSelfHostedEnabled(),
		tokenConfigured: getRequiredToken().length > 0,
		romsDir: env.EMUHUB_ROMS_DIR || '/data/roms',
		savesDir: env.EMUHUB_SAVES_DIR || '/data/saves'
	};
}

export function assertSelfHosted() {
	if (!isSelfHostedEnabled()) {
		throw error(404);
	}
}

export function assertAuthorized(request: Request) {
	assertSelfHosted();

	const requiredToken = getRequiredToken();
	if (!requiredToken) {
		throw error(503, 'SELF_HOSTED_API_TOKEN is not configured');
	}

	const authHeader = request.headers.get('authorization');
	const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
	const fallbackToken = request.headers.get('x-emuhub-token')?.trim();
	const providedToken = headerToken || fallbackToken || '';

	if (providedToken !== requiredToken) {
		throw error(401, 'Unauthorized');
	}
}

export async function ensureDataDirs() {
	const { romsDir, savesDir } = getSelfHostedConfig();
	await mkdir(romsDir, { recursive: true });
	await mkdir(savesDir, { recursive: true });
}

export async function listRoms(): Promise<RomEntry[]> {
	await ensureDataDirs();
	const { romsDir } = getSelfHostedConfig();
	const entries = await readdir(romsDir, { withFileTypes: true });

	const roms = await Promise.all(
		entries
			.filter((entry) => entry.isFile())
			.map(async (entry) => {
				const fileStat = await stat(join(romsDir, entry.name));
				return {
					name: entry.name,
					size: fileStat.size,
					modifiedAt: fileStat.mtime.toISOString()
				};
			})
	);

	return roms.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

export function sanitizeRomName(name: string) {
	const cleaned = basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
	const extension = extname(cleaned).toLowerCase();

	if (!cleaned || !['.ch8', '.rom'].includes(extension)) {
		throw error(400, 'Only .ch8 and .rom files are supported');
	}

	return cleaned;
}

export async function writeRom(name: string, bytes: Uint8Array) {
	await ensureDataDirs();
	const { romsDir } = getSelfHostedConfig();
	const sanitized = sanitizeRomName(name);
	const target = join(romsDir, sanitized);

	try {
		await stat(target);
		throw error(409, 'A ROM with that name already exists');
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code && (err as NodeJS.ErrnoException).code !== 'ENOENT') {
			throw err;
		}
	}

	await writeFile(target, bytes);
	return sanitized;
}

export async function readRom(name: string) {
	await ensureDataDirs();
	const { romsDir } = getSelfHostedConfig();
	const sanitized = sanitizeRomName(name);
	const target = join(romsDir, sanitized);
	return readFile(target);
}

export async function deleteRom(name: string) {
	await ensureDataDirs();
	const { romsDir } = getSelfHostedConfig();
	const sanitized = sanitizeRomName(name);
	const target = join(romsDir, sanitized);
	await unlink(target);
}
