import { test, expect } from "@playwright/test";

const UI_URL = "http://localhost:3000/";

test.setTimeout(120000);

const signIn = async (page: Page) => {
  console.log("Navigating to URL:", UI_URL);
  await page.goto(UI_URL, { waitUntil: "networkidle" });

  console.log("Waiting for the 'Sign In' button...");
  const signInButton = await page.waitForSelector('a[href="/sign-in"]', {
    state: "visible",
    timeout: 60000,
  });

  console.log("Clicking on the 'Sign In' button...");
  await signInButton.click();

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
};

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("should show hotel search results", async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByPlaceholder("Where are you going?").fill("Chennai");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByText("Hotels found in Chennai")).toBeVisible();
  await expect(page.getByText("Hotel2")).toBeVisible();
});

test("should show hotel detail", async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByPlaceholder("Where are you going?").fill("Chennai");
  await page.getByRole("button", { name: "Search" }).click();

  await page.getByText("Hotel2").click();
  await expect(page).toHaveURL(/detail/);
  await expect(page.getByRole("button", { name: "Book now" })).toBeVisible();
});

/* test("should book hotel", async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByPlaceholder("Where are you going?").fill("Chennai");

  const date = new Date();
  date.setDate(date.getDate() + 3);
  const formattedDate = date.toISOString().split("T")[0];
  await page.getByPlaceholder("Check-out Date").fill(formattedDate);

  await page.getByRole("button", { name: "Search" }).click();

  await page.getByText("Hotel2").click();
  await page.getByRole("button", { name: "Book now" }).click();
  await page.getByRole("button", { name: "Confirm Booking" }).click();

  // await expect(page.getByText("Total Cost: £357.00")).toBeVisible();

  console.log("Initiating Razorpay payment...");


  const razorpayFrame = page.frameLocator(
    'iframe[src*="https://api.razorpay.com"]'
  ); // Adjust if necessary
  await expect(
    razorpayFrame.locator('[placeholder="Card Number"]')
  ).toBeVisible({ timeout: 10000 }); // Ensure the iframe is visible before proceeding

  console.log("Filling Razorpay card details...");
  await razorpayFrame
    .locator('[placeholder="Card Number"]')
    .fill("4111111111111111"); // Test card number
  await razorpayFrame.locator('[placeholder="MM / YY"]').fill("04/30"); // Expiry date
  await razorpayFrame.locator('[placeholder="CVV"]').fill("123"); // CVV

  console.log("Filling cardholder information...");
  await razorpayFrame
    .locator('[placeholder="Enter name on card"]')
    .fill("Yogesh");


  await razorpayFrame
    .getByTestId("contact-overlay-container")
    .getByRole("button", { name: "Continue" })
    .click();
  console.log("Continue clicked");
  await razorpayFrame.getByRole("button", { name: "Maybe later" }).click();
  console.log("Maybe Later clicked");

  await razorpayFrame.locator('[placeholder="Enter OTP"]').fill("1234");
  console.log("OTP filled");
  await razorpayFrame.locator('button:has-text("Continue")').click();
  console.log("Continue clicked");

  console.log("Waiting for booking confirmation...");
  await expect(page.getByText("Booking Saved!")).toBeVisible({
    timeout: 10000,
  });

  console.log("Navigating to 'My Bookings' page...");
  await page.getByRole("link", { name: "My Bookings" }).click();

 
  console.log("Verifying the new booking...");
  await expect(page.getByText("Hotel2")).toBeVisible({ timeout: 5000 });
}); */
