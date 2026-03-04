import { test, expect } from "@playwright/test";

test.describe("App flows with authenticated user", () => {
  test("delete note and verify it disappears from list", async ({ page }) => {
    await page.goto("/app");

    const noteTitle = `Delete Test ${Date.now()}`;
    await page.getByTestId("new-note-btn").click();
    await expect(page.getByTestId("note-editor")).toBeVisible();
    await page.getByTestId("note-title").fill(noteTitle);
    await page.getByTestId("note-content").fill("Note to delete.");
    await page.waitForTimeout(2500);

    await page.getByTestId("note-editor-close").click();
    await page.waitForURL((url) => !url.searchParams.has("note"));

    const noteRow = page.getByTestId("note-row").filter({ hasText: noteTitle });
    await expect(noteRow).toBeVisible();

    await noteRow.getByRole("button", { name: "Delete note" }).click();
    await page.getByRole("button", { name: "Delete" }).click();
    await page.waitForTimeout(500);

    await expect(noteRow).not.toBeVisible();
  });

  test("delete image and verify thumbnail disappears", async ({ page }) => {
    await page.goto("/app");

    await page.getByTestId("new-note-btn").click();
    await expect(page.getByTestId("note-editor")).toBeVisible();
    await page.getByTestId("note-title").fill("Image Delete Test");
    await page.getByTestId("note-content").fill("Content");
    await page.waitForTimeout(1000);

    const fileInput = page.getByTestId("image-upload-input");
    await fileInput.setInputFiles("e2e/fixtures/test-image.png");
    await page.waitForTimeout(2000);

    const imagesPanel = page.getByTestId("images-panel");
    await expect(imagesPanel.locator("img")).toHaveCount(1);

    await imagesPanel.locator("img").first().hover();
    await imagesPanel.getByRole("button", { name: "Delete image" }).click();
    await page.waitForTimeout(1000);

    await expect(imagesPanel.locator("img")).toHaveCount(0);
  });

  test("search filters notes by text", async ({ page }) => {
    await page.goto("/app");

    const uniqueWord = `Searchable${Date.now()}`;
    await page.getByTestId("new-note-btn").click();
    await expect(page.getByTestId("note-editor")).toBeVisible();
    await page.getByTestId("note-title").fill("Search Test Note");
    await page.getByTestId("note-content").fill(uniqueWord);
    await page.waitForTimeout(2500);

    await page.getByTestId("note-editor-close").click();
    await page.waitForURL((url) => !url.searchParams.has("note"));

    await expect(
      page.getByTestId("note-row").filter({ hasText: uniqueWord })
    ).toBeVisible();

    await page.getByTestId("notes-search").fill("nonexistentxyz123");
    await page.waitForTimeout(500);

    await expect(
      page.getByTestId("note-row").filter({ hasText: uniqueWord })
    ).not.toBeVisible();

    await page.getByTestId("notes-search").fill(uniqueWord);
    await page.waitForTimeout(500);

    await expect(
      page.getByTestId("note-row").filter({ hasText: uniqueWord })
    ).toBeVisible();
  });

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

  test("AI suggest category triggers and shows result", async ({ page }) => {
    await page.goto("/app");

    const categoryName = `AI Cat ${Date.now()}`;
    await page.getByTestId("category-input").fill(categoryName);
    await page.getByTestId("category-input").press("Enter");
    await page.waitForURL((url) => url.searchParams.has("category"));
    await expect(
      page.getByRole("link", { name: categoryName, exact: true })
    ).toBeVisible();

    await page.getByTestId("new-note-btn").click();
    await expect(page.getByTestId("note-editor")).toBeVisible();
    await page.getByTestId("note-title").fill("Meeting notes");
    await page.getByTestId("note-content").fill("Discussed Q4 goals.");
    await page.waitForTimeout(500);

    const suggestBtn = page.getByRole("button", { name: "Suggest category" });
    await suggestBtn.click();

    await expect(
      page.getByRole("button", { name: "Thinking" })
    ).toBeVisible({ timeout: 3000 });

    await expect(suggestBtn).toBeVisible({ timeout: 8000 });
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
