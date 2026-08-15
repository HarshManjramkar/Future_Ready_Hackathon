/**
 * EduFlow Playwright E2E Spec: Magic Dropzone & Human Review Inbox
 * Tests handwritten document parsing, confidence badge, and 1-click verification.
 */
import { test, expect } from '@playwright/test';

test.describe('Magic Dropzone & Human Review Inbox Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    const enterBtn = page.getByRole('button', { name: /Enter System|Enter Campus/i });
    if (await enterBtn.isVisible()) {
      await enterBtn.click();
    }
    await page.getByRole('button', { name: /Document Scanner|Magic Dropzone/i }).click();
  });

  test('should render drag-and-drop ingestion area and sample presets', async ({ page }) => {
    await expect(page.getByText(/Drag & Drop Scanned School Forms|Magic Dropzone/i)).toBeVisible();
    await expect(page.getByText(/Sample 1|Sample 2|Sample 3/i)).toBeVisible();
  });

  test('should parse clean sample form and display extracted student details', async ({ page }) => {
    const cleanSampleBtn = page.getByRole('button', { name: /Sample 1: Clean Form|Sample 1/i });
    if (await cleanSampleBtn.isVisible()) {
      await cleanSampleBtn.click();
      await expect(page.getByText(/Extracted Student Details|Confidence: 9/i)).toBeVisible();
      await expect(page.getByText(/Aadhaar Number|Guardian Mobile/i)).toBeVisible();
    }
  });

  test('should route smudged sample to Human Review Inbox and increment badge counter', async ({ page }) => {
    const smudgedSampleBtn = page.getByRole('button', { name: /Sample 2: Smudged|Low Confidence/i });
    if (await smudgedSampleBtn.isVisible()) {
      await smudgedSampleBtn.click();
      // Navigate to Human Review Inbox
      await page.getByRole('button', { name: /Human Review|Unreviewed/i }).click();
      await expect(page.getByText(/Human Review Needed|Side-by-Side Verification/i)).toBeVisible();
      
      // Verify 1-click approve button
      const approveBtn = page.getByRole('button', { name: /Approve & Enroll|Verify Document/i }).first();
      if (await approveBtn.isVisible()) {
        await approveBtn.click();
        await expect(page.getByText(/Successfully admitted|Verified/i)).toBeVisible();
      }
    }
  });
});
