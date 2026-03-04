import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  test("login, create category, create note, verify note appears", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("e2e-test@example.com");
    await page.getByTestId("login-password").fill("e2etestpass123");
    await page.getByTestId("login-submit").click();
    await page.waitForURL("**/app**");

    await page.getByTestId("category-input").fill("E2E Test Category");
    await page.getByTestId("category-input").press("Enter");
    await expect(page.getByText("E2E Test Category")).toBeVisible();

    await page.getByTestId("new-note-btn").click();
    await expect(page.getByTestId("note-editor")).toBeVisible();

    const noteTitle = `E2E Note ${Date.now()}`;
    await page.getByTestId("note-title").fill(noteTitle);
    await page.getByTestId("note-content").fill("Test content for E2E.");
    await page.waitForTimeout(2500);

    await page.getByTestId("note-editor-close").click();
    await page.waitForURL((url) => !url.searchParams.has("note"));

    await expect(page.getByTestId("note-row").filter({ hasText: noteTitle })).toBeVisible();
  });
});
