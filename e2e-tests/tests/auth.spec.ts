import { test, expect } from "@playwright/test";

test.setTimeout(120000);

const UI_URL = "http://localhost:3000/";

test("should allow the user to sign in", async ({ page }) => {
  try {
    console.log("Navigating to URL:", UI_URL);
    await page.goto(UI_URL, { waitUntil: "networkidle" });

    console.log("Waiting for the 'Sign In' button...");
    const signInButton = await page.waitForSelector('a[href="/sign-in"]', {
      state: "visible",
      timeout: 60000,
    });

    console.log("Clicking on the 'Sign In' button...");
    await signInButton.click();

    console.log("Verifying 'Sign In' page is visible...");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

    console.log("Filling in the login form...");
    await page.locator("[name=email]").fill("email@gmail.com");
    await page.locator("[name=password]").fill("password");

    console.log("Clicking the 'Login' button...");
    await page.getByRole("button", { name: "Login" }).click();

    console.log("Checking for success message and post-login elements...");
    await expect(page.getByText("Sign in Successful!")).toBeVisible();
    await expect(page.getByRole("link", { name: "My Bookings" })).toBeVisible();
    await expect(page.getByRole("link", { name: "My Hotels" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();

    console.log("Sign in test passed successfully!");
  } catch (error) {
    console.error("Sign in test failed:", error);
    throw error;
  }
});

test("should allow user to register", async ({ page }) => {
  try {
    const testEmail = `test_register_${
      Math.floor(Math.random() * 90000) + 10000
    }@test.com`;

    console.log("Navigating to URL:", UI_URL);
    await page.goto(UI_URL, { waitUntil: "networkidle" });

    console.log("Clicking on 'Sign In'...");
    const signInLink = await page.waitForSelector('a[href="/sign-in"]', {
      state: "visible",
      timeout: 90000,
    });
    await signInLink.click();

    console.log("Navigating to 'Create an Account' page...");
    await page.getByRole("link", { name: "Create an account here" }).click();

    console.log("Verifying 'Create an Account' page is visible...");
    await expect(
      page.getByRole("heading", { name: "Create an Account" })
    ).toBeVisible();

    console.log("Filling in registration form...");
    await page.locator("[name=firstName]").fill("test_firstName");
    await page.locator("[name=lastName]").fill("test_lastName");
    await page.locator("[name=email]").fill(testEmail);
    await page.locator("[name=password]").fill("password123");
    await page.locator("[name=confirmPassword]").fill("password123");

    console.log("Clicking 'Create Account' button...");
    await page.getByRole("button", { name: "Create Account" }).click();

    console.log(
      "Checking for success message and post-registration elements..."
    );
    await expect(page.getByText("Registration Success!")).toBeVisible();
    await expect(page.getByRole("link", { name: "My Bookings" })).toBeVisible();
    await expect(page.getByRole("link", { name: "My Hotels" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();

    console.log("Registration test passed successfully!");
  } catch (error) {
    console.error("Registration test failed:", error);
    throw error;
  }
});
