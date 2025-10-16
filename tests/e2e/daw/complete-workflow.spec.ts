import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete DAW Workflow
 * Tests the entire user journey from project creation to export
 */

test.describe('Complete DAW Workflow', () => {
	test('should complete full music production workflow', async ({ page }) => {
		// 1. Navigate to home page
		await page.goto('/');

		// 2. Create new project
		await page.click('button:has-text("New Project")');
		await page.fill('input[placeholder="Project name"]', 'Test Track');
		await page.click('button:has-text("Create")');

		// 3. Wait for DAW to load
		await page.waitForURL('**/daw');
		await page.waitForSelector('[data-testid="transport-controls"]');

		// 4. Verify project name is displayed
		await expect(page.locator('text=Test Track')).toBeVisible();

		// 5. Add a track
		await page.click('button:has-text("Add Track")');
		// Wait for track to appear
		await page.waitForSelector('[data-testid="track-1"]', { timeout: 5000 });

		// 6. Set tempo
		await page.fill('input[data-testid="tempo-input"]', '128');
		await expect(page.locator('input[data-testid="tempo-input"]')).toHaveValue('128');

		// 7. Start playback
		await page.click('[data-testid="play-button"]');
		await expect(page.locator('[data-testid="play-button"]')).toHaveClass(/playing/);

		// 8. Stop playback
		await page.click('[data-testid="stop-button"]');
		await expect(page.locator('[data-testid="play-button"]')).not.toHaveClass(/playing/);

		// 9. Open mixer view
		await page.click('button:has-text("Mixer")');
		await page.waitForSelector('[data-testid="mixer-view"]');

		// 10. Adjust track volume
		const volumeFader = page.locator('[data-testid="track-1-volume"]');
		await volumeFader.fill('-6');

		// 11. Pan track
		const panKnob = page.locator('[data-testid="track-1-pan"]');
		await panKnob.fill('0.5'); // Pan right

		// 12. Run AI analysis
		await page.click('text=EQ Analyzer');
		await page.click('button:has-text("Analyze")');
		await page.waitForSelector('[data-testid="balance-score"]');

		// 13. Apply AI suggestions
		if (await page.locator('[data-testid="eq-suggestion"]').count() > 0) {
			await page.click('[data-testid="eq-suggestion"]:first-child');
			await page.click('button:has-text("Apply")');
		}

		// 14. Save project
		await page.click('button:has-text("Save")');
		await page.waitForSelector('text=Project saved', { timeout: 10000 });

		// 15. Verify unsaved changes indicator is gone
		await expect(page.locator('text=Unsaved')).not.toBeVisible();
	});

	test('should handle keyboard shortcuts', async ({ page }) => {
		await page.goto('/daw');

		// Space - Play/Pause
		await page.keyboard.press('Space');
		await expect(page.locator('[data-testid="play-button"]')).toHaveClass(/playing/);

		await page.keyboard.press('Space');
		await expect(page.locator('[data-testid="play-button"]')).not.toHaveClass(/playing/);

		// Cmd+S or Ctrl+S - Save
		const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
		await page.keyboard.press(`${modifier}+S`);
		// Should trigger save (check for save confirmation or API call)

		// Cmd+N or Ctrl+N - New Project
		await page.keyboard.press(`${modifier}+N`);
		await expect(page.locator('input[placeholder="Project name"]')).toBeVisible();
	});

	test('should quantize MIDI notes', async ({ page }) => {
		await page.goto('/daw');

		// Add MIDI track with some notes
		await page.click('button:has-text("Add Track")');

		// Click quantize button
		await page.click('[data-testid="quantize-button"]');

		// Should show success message
		await expect(page.locator('text=Quantized')).toBeVisible({ timeout: 5000 });
	});

	test('should switch between views', async ({ page }) => {
		await page.goto('/daw');

		// Start in arrangement view
		await expect(page.locator('[data-testid="arrangement-view"]')).toBeVisible();

		// Switch to mixer
		await page.click('button:has-text("Mixer")');
		await expect(page.locator('[data-testid="mixer-view"]')).toBeVisible();

		// Switch to browser
		await page.click('button:has-text("Browser")');
		await expect(page.locator('text=Browser')).toBeVisible();

		// Back to arrangement
		await page.click('button:has-text("Arrangement")');
		await expect(page.locator('[data-testid="arrangement-view"]')).toBeVisible();
	});

	test('should warn before leaving with unsaved changes', async ({ page }) => {
		await page.goto('/daw');

		// Make a change
		await page.fill('input[data-testid="tempo-input"]', '140');

		// Should show unsaved indicator
		await expect(page.locator('text=Unsaved')).toBeVisible();

		// Try to navigate away
		page.on('dialog', dialog => {
			expect(dialog.message()).toContain('unsaved changes');
			dialog.dismiss();
		});

		await page.click('button:has-text("Sign Out")');
	});
});
