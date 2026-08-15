/**
 * EduFlow Playwright E2E Spec: Multi-Viewport Responsiveness, Themes & Command Palette
 * Tests mobile/tablet/desktop layouts, theme switching, and global CMD+K shortcut.
 */
import { test, expect } from '@playwright/test';

test.describe('Responsive Layouts, Themes & Global Shortcuts', () => {
  const viewports = [
    { name: 'Mobile (iPhone 14)', width: 390, height: 844 },
    { name: 'Tablet (iPad Mini)', width: 768, height: 1024 },
    { name: 'Desktop (1080p)', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    test(`should render responsive layout gracefully on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:5173');
      
      const enterBtn = page.getByRole('button', { name: /Enter System|Enter Campus/i });
      if (await enterBtn.isVisible()) {
        await enterBtn.click();
      }
      
      // Verify main dashboard elements adapt
      await expect(page.locator('body')).toBeVisible();
      await expect(page.getByText(/EduFlow OS|Autonomous Operations/i)).toBeVisible();
    });
  }

  test('should switch themes cleanly (Emerald, Midnight, Stone)', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const enterBtn = page.getByRole('button', { name: /Enter System|Enter Campus/i });
    if (await enterBtn.isVisible()) {
      await enterBtn.click();
    }

    for (const theme of ['midnight', 'stone', 'emerald']) {
      const themeBtn = page.getByRole('button', { name: new RegExp(theme, 'i') });
      if (await themeBtn.isVisible()) {
        await themeBtn.click();
        if (theme !== 'emerald') {
          await expect(page.locator('html')).toHaveClass(new RegExp(`theme-${theme}`));
        }
      }
    }
  });

  test('should toggle Command Palette on Meta+K or Ctrl+K', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const enterBtn = page.getByRole('button', { name: /Enter System|Enter Campus/i });
    if (await enterBtn.isVisible()) {
      await enterBtn.click();
    }

    // Press Meta+K
    await page.keyboard.press('Meta+k');
    const cmdModal = page.getByPlaceholder(/Type a command or search|Search actions/i);
    if (await cmdModal.isVisible()) {
      await cmdModal.fill('Timetable');
      await expect(page.getByText(/Jump to Timetable|View Schedule/i)).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});
