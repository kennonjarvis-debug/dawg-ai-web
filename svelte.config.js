import adapter from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	},
	onwarn: (warning, handler) => {
		// Ignore a11y warnings during build
		if (warning.code.startsWith('a11y-')) return;
		handler(warning);
	}
};

export default config;
