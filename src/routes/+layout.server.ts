import { getSelfHostedConfig } from '$lib/server/selfHosted';

export function load() {
	const config = getSelfHostedConfig();

	return {
		selfHosted: config.selfHosted,
		selfHostedTokenConfigured: config.tokenConfigured
	};
}
