/**
 * E2E Test Setup Utilities
 * Provides helper functions for Playwright tests
 */

import { Page } from '@playwright/test';

/**
 * Bypass authentication for testing
 * Sets up the browser context to appear authenticated
 */
export async function bypassAuth(page: Page) {
	// Set localStorage to mock authenticated state
	await page.addInitScript(() => {
		// Mock auth storage
		localStorage.setItem(
			'dawg_auth',
			JSON.stringify({
				user: { id: 'test-user', email: 'test@example.com' },
				token: 'test-token',
				isAuthenticated: true
			})
		);
	});
}

/**
 * Wait for page to finish loading and hydration
 */
export async function waitForHydration(page: Page) {
	// Wait for Svelte hydration to complete
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(500); // Give Svelte time to hydrate
}

/**
 * Navigate to DAW page with auth bypass
 */
export async function goToDAW(page: Page) {
	await bypassAuth(page);
	await page.goto('/daw');
	await waitForHydration(page);
}
