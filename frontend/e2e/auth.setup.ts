import { test as setup } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/signup");
  await page.getByTestId("signup-email").fill("e2e-test@example.com");
  await page.getByTestId("signup-password").fill("e2etestpass123");
  await page.getByTestId("signup-submit").click();

  try {
    await page.waitForURL("**/app**", { timeout: 5000 });
  } catch {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("e2e-test@example.com");
    await page.getByTestId("login-password").fill("e2etestpass123");
    await page.getByTestId("login-submit").click();
    await page.waitForURL("**/app**");
  }

  await page.context().storageState({ path: authFile });
});
