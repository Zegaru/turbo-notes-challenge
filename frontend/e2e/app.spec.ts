import { test, expect } from "@playwright/test";

test.describe("App flows with authenticated user", () => {
  test("pin note and verify it appears under pinned section", async ({
    page,
  }) => {
    await page.goto("/app");

    const noteTitle = `Pin Test ${Date.now()}`;
    await page.getByTestId("new-note-btn").click();
    await expect(page.getByTestId("note-editor")).toBeVisible();
    await page.getByTestId("note-title").fill(noteTitle);
    await page.getByTestId("note-content").fill("Note to pin.");
    await page.waitForTimeout(2500);

    await page.getByTestId("note-editor-close").click();
    await page.waitForURL((url) => !url.searchParams.has("note"));

    const noteRow = page.getByTestId("note-row").filter({ hasText: noteTitle });
    await expect(noteRow).toBeVisible();

    await noteRow.getByTestId("note-pin-btn").click();
    await page.waitForTimeout(500);

    const firstNote = page.getByTestId("note-row").first();
    await expect(firstNote).toContainText(noteTitle);
  });

  test("upload image and verify thumbnail appears", async ({ page }) => {
    await page.goto("/app");

    await page.getByTestId("new-note-btn").click();
    await expect(page.getByTestId("note-editor")).toBeVisible();
    await page.getByTestId("note-title").fill("Image Upload Test");
    await page.getByTestId("note-content").fill("Content");
    await page.waitForTimeout(1000);

    const fileInput = page.getByTestId("image-upload-input");
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");
    await page.waitForTimeout(2000);

    const imagesPanel = page.getByTestId("images-panel");
    await expect(imagesPanel.locator("img")).toHaveCount(1);
  });
});
