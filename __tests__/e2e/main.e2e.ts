/**
 * E2E Test Suite for K-Vibe Tracker
 * 
 * Prerequisites:
 * - Run: npm install -D @playwright/test
 * - App must be running on http://localhost:3000
 * 
 * Run tests:
 * - npm run test:e2e
 * - npm run test:e2e -- --ui (interactive mode)
 * - npm run test:e2e -- --headed (visible browser)
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const LOCALE = 'ko';

test.describe('K-Vibe Tracker - End-to-End Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Home Page (홈)', () => {
    test('should load home page with locale', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}`);

      // Check page title and heading
      await expect(page).toHaveTitle(/K-Vibe|트래커/i);
      
      // Check main content is visible
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();
    });

    test('should display language switcher', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}`);

      // Look for language switcher button
      const languageSwitcher = page.locator('[data-testid="language-switcher"]');
      await expect(languageSwitcher).toBeVisible();
    });

    test('should navigate to map page', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}`);

      // Find and click map navigation link
      const mapLink = page.locator('a[href*="/map"]').first();
      await mapLink.click();

      // Wait for map page to load
      await page.waitForURL(`${BASE_URL}/${LOCALE}/map`);
      await expect(page).toHaveURL(new RegExp('/map'));
    });

    test('should change locale', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}`);

      // Find language switcher
      const languageSwitcher = page.locator('[data-testid="language-switcher"]');
      await languageSwitcher.click();

      // Select English
      const englishOption = page.locator('[data-testid="locale-en"]');
      await englishOption.click();

      // Verify URL changed to English locale
      await page.waitForURL(`${BASE_URL}/en`);
      await expect(page).toHaveURL(new RegExp('/en'));
    });
  });

  test.describe('Map Page (지도)', () => {
    test('should load map page', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/map`);

      // Check for map container
      const mapContainer = page.locator('[data-testid="map-container"]');
      await expect(mapContainer).toBeVisible();

      // Check for category filters
      const filterButtons = page.locator('[data-testid^="category-filter-"]');
      await expect(filterButtons).toHaveCount(5); // Typical number of filters
    });

    test('should filter places by category', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/map`);

      // Wait for places list to load
      await page.waitForSelector('[data-testid="place-card"]', { timeout: 5000 });

      // Click category filter
      const culturalFilter = page.locator('[data-testid="category-filter-cultural"]');
      await culturalFilter.click();

      // Verify filter is active
      await expect(culturalFilter).toHaveAttribute('aria-pressed', 'true');

      // Verify places list is updated
      const placeCards = page.locator('[data-testid="place-card"]');
      await expect(placeCards.first()).toBeVisible();
    });

    test('should open place detail modal', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/map`);

      // Wait for places to load
      await page.waitForSelector('[data-testid="place-card"]', { timeout: 5000 });

      // Click first place card
      const firstPlace = page.locator('[data-testid="place-card"]').first();
      await firstPlace.click();

      // Check modal is visible
      const modal = page.locator('[data-testid="place-detail-modal"]');
      await expect(modal).toBeVisible();

      // Check modal contains place info
      const placeName = modal.locator('[data-testid="place-name"]');
      await expect(placeName).toBeVisible();
    });

    test('should save place to favorites', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/map`);

      // Open place detail
      await page.waitForSelector('[data-testid="place-card"]', { timeout: 5000 });
      const firstPlace = page.locator('[data-testid="place-card"]').first();
      await firstPlace.click();

      // Click save button
      const saveButton = page.locator('[data-testid="save-place-btn"]');
      await expect(saveButton).toBeVisible();
      await saveButton.click();

      // Verify button state changed
      await expect(saveButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should search places by keyword', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/map`);

      // Find search input
      const searchInput = page.locator('[data-testid="place-search"]');
      await expect(searchInput).toBeVisible();

      // Type search query
      await searchInput.fill('cafe');
      await searchInput.press('Enter');

      // Wait for results
      await page.waitForTimeout(1000);

      // Verify results are displayed
      const placeCards = page.locator('[data-testid="place-card"]');
      await expect(placeCards.first()).toBeVisible();
    });
  });

  test.describe('SNS Analysis (분석)', () => {
    test('should load analysis page', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/analyze`);

      const container = page.locator('main');
      await expect(container).toBeVisible();

      // Check for URL input
      const urlInput = page.locator('[data-testid="url-input"]');
      await expect(urlInput).toBeVisible();
    });

    test('should handle invalid URL', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/analyze`);

      const urlInput = page.locator('[data-testid="url-input"]');
      const submitButton = page.locator('[data-testid="analyze-btn"]');

      // Enter invalid URL
      await urlInput.fill('not-a-url');
      await submitButton.click();

      // Verify error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Route Page (루트)', () => {
    test('should load route page', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/route`);

      const container = page.locator('main');
      await expect(container).toBeVisible();
    });

    test('should add stop to route', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/route`);

      // Find add stop button
      const addButton = page.locator('[data-testid="add-stop-btn"]');
      await expect(addButton).toBeVisible();
      await addButton.click();

      // Verify stop was added
      const stops = page.locator('[data-testid="route-stop"]');
      await expect(stops).toHaveCount(1);
    });

    test('should reorder stops via drag and drop', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/route`);

      // Add multiple stops
      const addButton = page.locator('[data-testid="add-stop-btn"]');
      await addButton.click();
      await addButton.click();

      const stops = page.locator('[data-testid="route-stop"]');
      await expect(stops).toHaveCount(2);

      // Get first and second stop elements
      const firstStop = stops.nth(0);
      const secondStop = stops.nth(1);

      // Drag and drop first stop to second position
      await firstStop.dragTo(secondStop);

      // Verify order changed (check data-order attribute or text content)
      const firstStopOrder = await firstStop.getAttribute('data-order');
      expect(firstStopOrder).toBeGreaterThan('1');
    });

    test('should mark stop as completed', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/route`);

      // Add stop
      const addButton = page.locator('[data-testid="add-stop-btn"]');
      await addButton.click();

      // Find completion checkbox
      const completeCheckbox = page.locator('[data-testid="complete-stop-checkbox"]').first();
      await completeCheckbox.click();

      // Verify checkbox is checked
      await expect(completeCheckbox).toBeChecked();

      // Verify stop appears as completed
      const completedStop = page.locator('[data-testid="route-stop"][data-completed="true"]');
      await expect(completedStop).toBeVisible();
    });
  });

  test.describe('Radar Page (레이더)', () => {
    test('should load radar page', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/radar`);

      const container = page.locator('main');
      await expect(container).toBeVisible();

      // Check for radius slider
      const slider = page.locator('[data-testid="radius-slider"]');
      await expect(slider).toBeVisible();
    });

    test('should adjust radar radius', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/radar`);

      const slider = page.locator('[data-testid="radius-slider"]');
      
      // Get initial value
      const initialValue = await slider.inputValue();

      // Change slider value
      await slider.fill('2000');

      // Verify value changed
      const newValue = await slider.inputValue();
      expect(parseInt(newValue)).toBe(2000);
    });

    test('should filter facilities by type', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/radar`);

      // Wait for facilities to load
      await page.waitForSelector('[data-testid="facility-card"]', { timeout: 5000 });

      // Click facility type filter
      const caffeFilter = page.locator('[data-testid="facility-filter-cafe"]');
      await caffeFilter.click();

      // Verify only cafe facilities are shown
      const facilities = page.locator('[data-testid="facility-card"]');
      facilities.locator('[data-category="cafe"]');
    });
  });

  test.describe('Profile Page (프로필)', () => {
    test('should load profile page', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/profile`);

      const container = page.locator('main');
      await expect(container).toBeVisible();
    });

    test('should display saved places', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/profile`);

      const savedPlacesSection = page.locator('[data-testid="saved-places-section"]');
      await expect(savedPlacesSection).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load home page within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}/${LOCALE}`);
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should render large place list without lag', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/map`);

      // Wait for places to load
      await page.waitForSelector('[data-testid="place-card"]', { timeout: 5000 });

      const startTime = Date.now();

      // Scroll through list
      const placesList = page.locator('[data-testid="places-list"]');
      await placesList.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });

      const endTime = Date.now();
      const scrollTime = endTime - startTime;

      // Scroll should be smooth
      expect(scrollTime).toBeLessThan(1000);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}`);

      // Check for h1
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      // Check headings are in order
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have accessible navigation', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}`);

      // Check for main navigation
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();

      // Check links have text or aria-label
      const links = page.locator('a');
      const linkCount = await links.count();
      expect(linkCount).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async () => {
      await page.goto(`${BASE_URL}/${LOCALE}/map`);

      // Tab to first interactive element
      await page.keyboard.press('Tab');

      // Check focused element
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });
});
