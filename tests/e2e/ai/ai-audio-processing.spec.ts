import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * E2E Tests: AI Audio Processing
 * Tests all AI-enhanced audio features
 */

test.describe('AI Audio Processing', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to DAW
		await page.goto('/daw');

		// Wait for AI panel to load
		await page.waitForSelector('[data-testid="ai-audio-panel"]', { timeout: 10000 });
	});

	test('should display AI Audio Processing panel', async ({ page }) => {
		// Check panel is visible
		const panel = page.locator('[data-testid="ai-audio-panel"]');
		await expect(panel).toBeVisible();

		// Check all 3 tabs are present
		await expect(page.locator('text=EQ Analyzer')).toBeVisible();
		await expect(page.locator('text=Auto Master')).toBeVisible();
		await expect(page.locator('text=Neural Model')).toBeVisible();
	});

	test('EQ Analyzer: should analyze audio and provide suggestions', async ({ page }) => {
		// Click EQ Analyzer tab
		await page.click('text=EQ Analyzer');

		// Click Analyze button
		await page.click('button:has-text("Analyze")');

		// Wait for analysis to complete
		await page.waitForSelector('[data-testid="balance-score"]', { timeout: 5000 });

		// Check balance score is displayed
		const balanceScore = page.locator('[data-testid="balance-score"]');
		await expect(balanceScore).toBeVisible();

		// Verify score is a number between 0-100
		const scoreText = await balanceScore.textContent();
		const score = parseInt(scoreText || '0');
		expect(score).toBeGreaterThanOrEqual(0);
		expect(score).toBeLessThanOrEqual(100);

		// Check frequency distribution bars
		const freqBars = page.locator('[data-testid="frequency-bar"]');
		await expect(freqBars).toHaveCount(5); // Low, L-Mid, Mid, H-Mid, High

		// Check AI suggestions are displayed
		const suggestions = page.locator('[data-testid="eq-suggestion"]');
		const count = await suggestions.count();
		expect(count).toBeGreaterThan(0);

		// Verify suggestion structure
		if (count > 0) {
			const firstSuggestion = suggestions.first();
			await expect(firstSuggestion).toContainText(/Hz/); // Frequency
			await expect(firstSuggestion).toContainText(/dB/); // Gain
			await expect(firstSuggestion).toContainText(/%/); // Confidence
		}
	});

	test('Auto Mastering: should optimize mastering chain', async ({ page }) => {
		// Click Auto Master tab
		await page.click('text=Auto Master');

		// Select genre
		await page.selectOption('select#genre', 'electronic');

		// Set target loudness
		await page.fill('input[type="range"]#target-lufs', '-9');

		// Click Optimize button
		await page.click('button:has-text("Optimize Chain")');

		// Wait for optimization to complete
		await page.waitForSelector('[data-testid="chain-result"]', { timeout: 10000 });

		// Check results are displayed
		const result = page.locator('[data-testid="chain-result"]');
		await expect(result).toBeVisible();

		// Verify confidence is shown
		await expect(result).toContainText(/\d+% Confidence/);

		// Check AI reasoning
		const reasoning = page.locator('[data-testid="reasoning-item"]');
		const reasoningCount = await reasoning.count();
		expect(reasoningCount).toBeGreaterThan(0);

		// Verify chain settings are displayed
		await expect(result).toContainText('EQ:');
		await expect(result).toContainText('Compression:');
		await expect(result).toContainText('Saturation:');
		await expect(result).toContainText('Width:');

		// Check Apply button is present
		await expect(page.locator('button:has-text("Apply to Chain")')).toBeVisible();
	});

	test('Auto Mastering: should detect genre automatically', async ({ page }) => {
		// Click Auto Master tab
		await page.click('text=Auto Master');

		// Select Auto-Detect
		await page.selectOption('select#genre', 'auto');

		// Click Optimize
		await page.click('button:has-text("Optimize Chain")');

		// Wait for result
		await page.waitForSelector('[data-testid="chain-result"]', { timeout: 10000 });

		// Verify genre was detected
		const reasoning = page.locator('[data-testid="reasoning-item"]');
		const firstReason = await reasoning.first().textContent();
		expect(firstReason).toContain('Detected genre:');
	});

	test('Neural Model: should display all 5 hardware models', async ({ page }) => {
		// Click Neural Model tab
		await page.click('text=Neural Model');

		// Check all 5 models are present
		await expect(page.locator('button:has-text("TUBE")')).toBeVisible();
		await expect(page.locator('button:has-text("TAPE")')).toBeVisible();
		await expect(page.locator('button:has-text("TRANSFORMER")')).toBeVisible();
		await expect(page.locator('button:has-text("TRANSISTOR")')).toBeVisible();
		await expect(page.locator('button:has-text("CONSOLE")')).toBeVisible();

		// Check model descriptions
		await expect(page.locator('text=even harmonics')).toBeVisible();
	});

	test('Neural Model: should show model details on selection', async ({ page }) => {
		// Click Neural Model tab
		await page.click('text=Neural Model');

		// Click on Tube model
		await page.click('button:has-text("TUBE")');

		// Verify model is selected (active class)
		const tubeButton = page.locator('button:has-text("TUBE")');
		await expect(tubeButton).toHaveClass(/active/);

		// Check model info is displayed
		await expect(page.locator('text=4096 sample curve')).toBeVisible();
		await expect(page.locator('text=Frequency-dependent saturation')).toBeVisible();
		await expect(page.locator('text=Accurate harmonic profiles')).toBeVisible();

		// Check comparison section
		await expect(page.locator('text=Better Than:')).toBeVisible();
		await expect(page.locator('text=Soundtoys Decapitator')).toBeVisible();
		await expect(page.locator('text=$199')).toBeVisible();
	});

	test('should switch between tabs without losing state', async ({ page }) => {
		// Run EQ analysis
		await page.click('text=EQ Analyzer');
		await page.click('button:has-text("Analyze")');
		await page.waitForSelector('[data-testid="balance-score"]');
		const scoreText = await page.locator('[data-testid="balance-score"]').textContent();

		// Switch to Auto Master
		await page.click('text=Auto Master');
		await page.selectOption('select#genre', 'rock');

		// Switch back to EQ Analyzer
		await page.click('text=EQ Analyzer');

		// Verify state is preserved
		const newScoreText = await page.locator('[data-testid="balance-score"]').textContent();
		expect(newScoreText).toBe(scoreText);
	});

	test('accessibility: AI Audio Panel should be WCAG compliant', async ({ page }) => {
		// Inject axe
		await injectAxe(page);

		// Run accessibility checks
		await checkA11y(page, '[data-testid="ai-audio-panel"]', {
			detailedReport: true,
			detailedReportOptions: {
				html: true,
			},
		});
	});

	test('performance: should load AI panel within 2 seconds', async ({ page }) => {
		const startTime = Date.now();

		await page.goto('/daw');
		await page.waitForSelector('[data-testid="ai-audio-panel"]');

		const loadTime = Date.now() - startTime;
		expect(loadTime).toBeLessThan(2000);
	});

	test('should handle errors gracefully', async ({ page }) => {
		// Simulate network error by blocking API calls
		await page.route('**/api/**', route => route.abort());

		// Try to run analysis
		await page.click('text=EQ Analyzer');
		await page.click('button:has-text("Analyze")');

		// Should show error message (not crash)
		// Wait a bit for any error handling
		await page.waitForTimeout(1000);

		// Panel should still be visible
		await expect(page.locator('[data-testid="ai-audio-panel"]')).toBeVisible();
	});
});
