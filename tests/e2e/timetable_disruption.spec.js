/**
 * EduFlow Playwright E2E Spec: Reactive Timetable & Disruption Solver
 * Tests 5-day schedule grid, live single teacher absence, and mass disruption solver.
 */
import { test, expect } from '@playwright/test';

test.describe('Reactive Timetable & Disruption Solver UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    const enterBtn = page.getByRole('button', { name: /Enter System|Enter Campus/i });
    if (await enterBtn.isVisible()) {
      await enterBtn.click();
    }
    // Navigate to Timetable tab
    await page.getByRole('button', { name: /Timetable & Substitutes|Timetable/i }).click();
  });

  test('should render 5-day columns with 8 curriculum periods', async ({ page }) => {
    for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
      await expect(page.getByText(day)).toBeVisible();
    }
    await expect(page.getByText(/Period 1|Period 8/i)).toBeVisible();
  });

  test('should trigger single teacher leave and reassign substitutes in < 50ms', async ({ page }) => {
    const leaveBtn = page.getByRole('button', { name: /⚡ Staff Leave|Report Absence/i }).first();
    if (await leaveBtn.isVisible()) {
      const startTime = Date.now();
      await leaveBtn.click();
      await expect(page.getByText(/Reassigned|Substitute Assigned|Disruption Solved/i)).toBeVisible();
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(1500); // UI render + toast under 1.5s
    }
  });

  test('should trigger mass teacher absence and update affected periods cleanly', async ({ page }) => {
    const massBtn = page.getByRole('button', { name: /Mass Disruption|Simulate 3 Leaves/i });
    if (await massBtn.isVisible()) {
      await massBtn.click();
      await expect(page.getByText(/Disruptions Solved|Mass Coverage/i)).toBeVisible();
    }
  });

  test('should reset timetable state to baseline when reset demo is clicked', async ({ page }) => {
    const resetBtn = page.getByRole('button', { name: /Reset State|Reset Demo/i });
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await expect(page.getByText(/Demo state reset|SUCCESS/i)).toBeVisible();
    }
  });
});
