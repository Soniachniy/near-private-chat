import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import containerQuries from '@tailwindcss/container-queries';

export default {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				mainBlack: '#090909',
				nearg: {
					400: 'var(--color-nearg-400, rgba(0, 236, 151, 1))',
					500: 'var(--color-nearg-500, rgba(0, 236, 151, 0.08))'
				}
			},
			padding: {
				'safe-bottom': 'env(safe-area-inset-bottom)'
			}
		}
	},
	plugins: [typography, containerQuries]
} satisfies Config;
