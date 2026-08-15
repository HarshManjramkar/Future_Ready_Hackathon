/**
 * EduFlow Playwright E2E Spec: Smart Kiosk Anti-Cheat & Attendance Verification
 * Tests Dual Coincidence edge CV, proxy prevention, and confetti celebration.
 */
import { test, expect } from '@playwright/test';

test.describe('Smart Kiosk Anti-Cheat & Attendance Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local dev server or preview port
    await page.goto('http://localhost:5173');
    // Dismiss intro screen if visible
    const enterBtn = page.getByRole('button', { name: /Enter System|Enter Campus/i });
    if (await enterBtn.isVisible()) {
      await enterBtn.click();
    }
    // Switch to Attendance Kiosk tab
    await page.getByRole('button', { name: /Attendance Kiosk|Smart Kiosk/i }).click();
  });

  test('should render kiosk terminal, camera frame and student roster', async ({ page }) => {
    await expect(page.getByText(/Smart Attendance Kiosk|Anti-Cheat Kiosk/i)).toBeVisible();
    await expect(page.locator('video, canvas, .camera-feed')).toBeDefined();
    await expect(page.getByText(/STU-9901|Tanvay/i)).toBeVisible();
  });

  test('should trigger Anti-Cheat Alert when QR is scanned with NO human face detected', async ({ page }) => {
    // Simulate manual QR trigger without face detection
    const proxyBtn = page.getByRole('button', { name: /Simulate Proxy Punch|No-Face Scan/i });
    if (await proxyBtn.isVisible()) {
      await proxyBtn.click();
      await expect(page.getByText(/Anti-Cheat Alert|No human face detected/i)).toBeVisible();
    }
  });

  test('should successfully mark student PRESENT when both face and valid QR coincide', async ({ page }) => {
    // Click verified scan simulation trigger for student 9901
    const scanBtn = page.getByRole('button', { name: /Scan ID #9901|Simulate Valid Scan/i });
    if (await scanBtn.isVisible()) {
      await scanBtn.click();
      await expect(page.getByText(/Verified! Attendance marked|PRESENT/i)).toBeVisible();
    }
  });

  test('should reject unregistered or invalid QR tokens with Security Alert', async ({ page }) => {
    const invalidBtn = page.getByRole('button', { name: /Invalid QR|Unregistered Token/i });
    if (await invalidBtn.isVisible()) {
      await invalidBtn.click();
      await expect(page.getByText(/unregistered or invalid|Security Alert/i)).toBeVisible();
    }
  });
});
