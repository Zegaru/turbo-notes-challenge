import { test, expect } from "@playwright/test";

test.describe("Signup flow", () => {
  test("sign up with new account and reach app", async ({ page }) => {
    const email = `e2e-signup-${Date.now()}@example.com`;
    const password = "signuppass123";

    await page.goto("/signup");
    await page.getByTestId("signup-email").fill(email);
    await page.getByTestId("signup-password").fill(password);
    await page.getByTestId("signup-submit").click();

    await page.waitForURL("**/app**");
    await expect(page).toHaveURL(/\/app/);
  });
});
