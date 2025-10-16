import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [sveltekit()],

	define: {
		// Make MODE available at runtime
		'import.meta.env.MODE': JSON.stringify(mode)
	},

	// Test-specific build options
	build: mode === 'test' ? {
		sourcemap: true,
		minify: false // Easier debugging in tests
	} : undefined
}));
