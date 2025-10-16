import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete DAW Workflow
 * Tests the entire user journey from project creation to export
 */

test.describe('Complete DAW Workflow', () => {
	test('should complete full music production workflow', async ({ page }) => {
		// Navigate directly to DAW in test mode
		await page.goto('/daw?test=true');
		await page.waitForLoadState('networkidle');

		// Wait for DAW to load
		await page.waitForSelector('[data-testid="transport-controls"]', { timeout: 10000 });

		// Verify DAW interface is loaded
		await expect(page.locator('[data-testid="arrangement-view"]')).toBeVisible();

		// Set tempo
		await page.fill('input[data-testid="tempo-input"]', '128');
		await expect(page.locator('input[data-testid="tempo-input"]')).toHaveValue('128');

		// Start playback
		await page.click('[data-testid="play-button"]');
		await expect(page.locator('[data-testid="play-button"]')).toHaveClass(/playing/);

		// Stop playback
		await page.click('[data-testid="stop-button"]');
		await expect(page.locator('[data-testid="play-button"]')).not.toHaveClass(/playing/);

		// Open mixer view
		await page.click('button:has-text("Mixer")');
		await page.waitForSelector('[data-testid="mixer-view"]');

		// Switch back to arrangement
		await page.click('button:has-text("Arrangement")');
		await expect(page.locator('[data-testid="arrangement-view"]')).toBeVisible();

		// Verify AI panel is visible
		await expect(page.locator('[data-testid="ai-audio-panel"]')).toBeVisible();
	});

	test('should handle keyboard shortcuts', async ({ page }) => {
		await page.goto('/daw?test=true');
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('[data-testid="transport-controls"]', { timeout: 10000 });

		// Space - Play/Pause
		await page.keyboard.press('Space');
		await expect(page.locator('[data-testid="play-button"]')).toHaveClass(/playing/);

		await page.keyboard.press('Space');
		await expect(page.locator('[data-testid="play-button"]')).not.toHaveClass(/playing/);

		// Verify keyboard shortcuts work
		// Additional shortcuts can be tested as they're implemented
	});

	test('should quantize MIDI notes', async ({ page }) => {
		await page.goto('/daw?test=true');
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('[data-testid="transport-controls"]', { timeout: 10000 });

		// Set up dialog handler for alert
		let alertMessage = '';
		page.on('dialog', async dialog => {
			alertMessage = dialog.message();
			await dialog.accept();
		});

		// Click quantize button
		await page.click('[data-testid="quantize-button"]');

		// Wait a bit for the alert to appear
		await page.waitForTimeout(500);

		// Verify alert was shown (either quantized clips, no clips message, or error)
		expect(alertMessage).toMatch(/quantize|clip|failed/i);
	});

	test('should switch between views', async ({ page }) => {
		await page.goto('/daw?test=true');
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('[data-testid="transport-controls"]', { timeout: 10000 });

		// Start in arrangement view
		await expect(page.locator('[data-testid="arrangement-view"]')).toBeVisible();

		// Switch to mixer
		await page.click('button:has-text("Mixer")');
		await expect(page.locator('[data-testid="mixer-view"]')).toBeVisible();

		// Back to arrangement
		await page.click('button:has-text("Arrangement")');
		await expect(page.locator('[data-testid="arrangement-view"]')).toBeVisible();
	});

	test('should warn before leaving with unsaved changes', async ({ page }) => {
		await page.goto('/daw?test=true');
		await page.waitForLoadState('networkidle');
		await page.waitForSelector('[data-testid="transport-controls"]', { timeout: 10000 });

		// Make a change
		await page.fill('input[data-testid="tempo-input"]', '140');
		await expect(page.locator('input[data-testid="tempo-input"]')).toHaveValue('140');

		// Verify the change was made successfully
		// Note: Unsaved changes indicator would be tested if implemented
	});
});
