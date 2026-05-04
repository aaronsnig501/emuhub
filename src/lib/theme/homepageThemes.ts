export type ThemeMode = 'light' | 'dark';

export type HomeThemeId = 'arcade' | 'terminal';

type ThemeTokens = {
	'--theme-bg': string;
	'--theme-nav': string;
	'--theme-surface': string;
	'--theme-surface-2': string;
	'--theme-surface-3': string;
	'--theme-text': string;
	'--theme-text-2': string;
	'--theme-text-3': string;
	'--theme-border': string;
	'--theme-border-strong': string;
	'--theme-accent-1': string;
	'--theme-accent-2': string;
	'--theme-accent-3': string;
	'--theme-grid-line': string;
	'--theme-glow-1': string;
	'--theme-glow-2': string;
};

type ThemeDefinition = {
	id: HomeThemeId;
	label: string;
	modes: Record<ThemeMode, ThemeTokens>;
};

export const homepageThemes: ThemeDefinition[] = [
	{
		id: 'arcade',
		label: 'Arcade',
		modes: {
			dark: {
				'--theme-bg': '#0a0a0a',
				'--theme-nav': '#0a0a0a',
				'--theme-surface': '#141414',
				'--theme-surface-2': '#1c1c1c',
				'--theme-surface-3': '#242424',
				'--theme-text': '#f0f0f0',
				'--theme-text-2': '#a8a8a8',
				'--theme-text-3': '#666666',
				'--theme-border': 'rgba(255,255,255,0.08)',
				'--theme-border-strong': 'rgba(255,255,255,0.16)',
				'--theme-accent-1': '#ff3030',
				'--theme-accent-2': '#00e8b0',
				'--theme-accent-3': '#ffc93c',
				'--theme-grid-line': 'rgba(255,255,255,0.03)',
				'--theme-glow-1': 'rgba(255,48,48,0.12)',
				'--theme-glow-2': 'rgba(0,232,176,0.08)'
			},
			light: {
				'--theme-bg': '#f8f2eb',
				'--theme-nav': '#f8f2eb',
				'--theme-surface': '#fff8f2',
				'--theme-surface-2': '#f0e5db',
				'--theme-surface-3': '#e6d7ca',
				'--theme-text': '#18110d',
				'--theme-text-2': '#5f534b',
				'--theme-text-3': '#9b8d82',
				'--theme-border': 'rgba(24,17,13,0.08)',
				'--theme-border-strong': 'rgba(24,17,13,0.16)',
				'--theme-accent-1': '#d63a2f',
				'--theme-accent-2': '#008a68',
				'--theme-accent-3': '#c88700',
				'--theme-grid-line': 'rgba(24,17,13,0.05)',
				'--theme-glow-1': 'rgba(214,58,47,0.14)',
				'--theme-glow-2': 'rgba(0,138,104,0.10)'
			}
		}
	},
	{
		id: 'terminal',
		label: 'Terminal',
		modes: {
			dark: {
				'--theme-bg': '#07120d',
				'--theme-nav': '#07120d',
				'--theme-surface': '#0d1913',
				'--theme-surface-2': '#112119',
				'--theme-surface-3': '#173026',
				'--theme-text': '#e6fff4',
				'--theme-text-2': '#9ec6b1',
				'--theme-text-3': '#557565',
				'--theme-border': 'rgba(120,255,196,0.10)',
				'--theme-border-strong': 'rgba(120,255,196,0.22)',
				'--theme-accent-1': '#7dff96',
				'--theme-accent-2': '#58ffd9',
				'--theme-accent-3': '#ffe36b',
				'--theme-grid-line': 'rgba(125,255,150,0.05)',
				'--theme-glow-1': 'rgba(125,255,150,0.11)',
				'--theme-glow-2': 'rgba(88,255,217,0.10)'
			},
			light: {
				'--theme-bg': '#eef7f1',
				'--theme-nav': '#eef7f1',
				'--theme-surface': '#f8fffb',
				'--theme-surface-2': '#ddeee4',
				'--theme-surface-3': '#cde2d6',
				'--theme-text': '#122018',
				'--theme-text-2': '#486556',
				'--theme-text-3': '#7d9a8a',
				'--theme-border': 'rgba(18,32,24,0.08)',
				'--theme-border-strong': 'rgba(18,32,24,0.15)',
				'--theme-accent-1': '#1f9d54',
				'--theme-accent-2': '#007e72',
				'--theme-accent-3': '#a78200',
				'--theme-grid-line': 'rgba(18,32,24,0.05)',
				'--theme-glow-1': 'rgba(31,157,84,0.13)',
				'--theme-glow-2': 'rgba(0,126,114,0.10)'
			}
		}
	}
];

export function getThemePalette(id: HomeThemeId, mode: ThemeMode): ThemeTokens {
	const theme = homepageThemes.find((candidate) => candidate.id === id) ?? homepageThemes[0];

	return theme.modes[mode];
}
