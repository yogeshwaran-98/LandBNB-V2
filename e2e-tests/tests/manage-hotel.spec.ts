import { test, expect } from "@playwright/test";

test.setTimeout(120000);

import path from "path";

const UI_URL = "http://localhost:3000/";

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

test.describe.serial("Hotel Management Test", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("should allow user to add a hotel", async ({ page }) => {
    await page.getByRole("link", { name: "My Hotels" }).click();
    console.log("My Hotels clicked");

    await page.getByRole("link", { name: "Add Hotel" }).click();
    console.log("Add Hotel clicked");

    const inputElements = await page.$eval("form", (form) => {
      const inputs = form.querySelectorAll("input");

      return Array.from(inputs)
        .map((input) => input.outerHTML)
        .join("\n");
    });
    console.log(inputElements);

    console.log("Filling Hotel name");
    await page.waitForSelector('input[placeholder="Enter hotel name"]', {
      state: "visible",
      timeout: 30000,
    });
    await page.getByPlaceholder("Enter hotel name").fill("Test Hotel");
    console.log("Hotel name filled");

    await page.waitForSelector('[data-testid="hotel-city-input"]', {
      state: "visible",
      timeout: 15000,
    });
    await page.locator('[data-testid="hotel-city-input"]').fill("Test City");
    console.log("City filled");
    await page.waitForSelector('[data-testid="hotel-country-input"]', {
      state: "visible",
      timeout: 15000,
    });
    await page
      .locator('[data-testid="hotel-country-input"]')
      .fill("Test Country");
    console.log("Country filled");
    await page
      .locator('[data-testid="hotel-desc-input"]')
      .fill("This is a description for the Test Hotel");
    console.log("Desc filled");
    await page.waitForSelector('[name="pricePerNight"]', {
      state: "visible",
      timeout: 15000,
    });
    await page.locator('[name="pricePerNight"]').fill("100");
    console.log("Price filled");
    await page.selectOption('select[name="starRating"]', "1");
    console.log("Rating selected");

    await page.getByText("Budget").click();
    console.log("Budget selected");

    await page.getByLabel("Free Wifi").check();
    await page.getByLabel("Parking").check();
    console.log("Wifi and parking checked");

    await page.locator('[name="adultCount"]').fill("2");
    await page.locator('[name="childCount"]').fill("4");
    console.log("Count set");

    await page.setInputFiles('[name="imageFiles"]', [
      path.join(__dirname, "files", "1.png"),
      path.join(__dirname, "files", "2.png"),
    ]);

    console.log("Images uploaded");

    await page.getByRole("button", { name: "Save" }).click();
    console.log("Button clicked");

    await page.waitForNavigation({ waitUntil: "networkidle" });
    const hotelSavedMessage = page.locator("text='Hotel Saved!'");
    const hotelStatus = await hotelSavedMessage.isVisible();
    if (hotelStatus) {
      console.log("Hotel saved");
    }
  });

  test("should display hotels", async ({ page }) => {
    await page.goto(`${UI_URL}my-hotels`);

    await page.getByRole("link", { name: "My Hotels" }).click();
    console.log("My Hotels clicked");

    const headings = await page.$eval("body", (body) => {
      const allHeadings = body.querySelectorAll("h1, h2, h3, h4, h5, h6");

      return Array.from(allHeadings).map((heading) => ({
        tagName: heading.tagName, // This will give you the heading level (e.g., 'H2')
        textContent: heading.textContent.trim(), // Get the text content
      }));
    });

    console.log(headings);

    await expect(page.getByRole("heading", { name: "Test Hotel" })).toBeVisible(
      { timeout: 60000 }
    );
    await expect(
      page.getByText("This is a description for the Test Hotel")
    ).toBeVisible();
    await expect(page.getByText("Test City, Test Country")).toBeVisible();
    await expect(page.getByText("Budget")).toBeVisible();
    await expect(page.getByText("£100 per night")).toBeVisible();
    await expect(page.getByText("2 adults, 4 children")).toBeVisible();
    await expect(page.getByText("1 Star Rating")).toBeVisible();

    await expect(
      page.getByRole("link", { name: "View Details" }).first()
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Add Hotel" })).toBeVisible();
  });

  test("should edit hotel", async ({ page }) => {
    console.log("Navigating to 'My Hotels' page...");
    await page.goto(`${UI_URL}my-hotels`, { waitUntil: "networkidle" });

    await page.getByRole("link", { name: "My Hotels" }).click();
    console.log("My Hotels clicked");

    console.log("Locating the heading 'Test Hotel'...");
    const hotelHeading = page.locator('h2:text("Test Hotel")');

    console.log(
      "Finding the 'View Details' link associated with 'Test Hotel'..."
    );
    const hotelContainer = hotelHeading.locator(".."); // Go to the parent container
    const viewDetailsLink = hotelContainer.locator('a:text("View Details")'); // Find the 'View Details' link in the parent

    console.log("Clicking 'View Details'...");
    await viewDetailsLink.click();

    console.log("Waiting for the 'Name' field to be visible...");
    await page.waitForSelector('[name="name"]', {
      state: "visible",
      timeout: 90000,
    });

    console.log("Verifying initial hotel name before editing...");
    await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel");

    console.log("Editing hotel name...");
    await page.locator('[name="name"]').fill("Test Hotel UPDATED");

    console.log("Editing hotel city...");
    await expect(page.locator('[name="city"]')).toHaveValue("Test City");
    await page.locator('[name="city"]').fill("Test City UPDATED");

    console.log("Editing hotel country...");
    await expect(page.locator('[name="country"]')).toHaveValue("Test Country");
    await page.locator('[name="country"]').fill("Test Country UPDATED");

    console.log("Saving the updated hotel details...");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForNavigation({ waitUntil: "networkidle" });
    const hotelSavedMessage = page.locator("text='Hotel Saved!'");
    const hotelStatus = await hotelSavedMessage.isVisible();
    if (hotelStatus) {
      console.log("Hotel saved");
    }

    const currentURL = await page.url();
    if (currentURL.includes("/my-hotels")) {
      console.log("Still on 'My Hotels' page after saving");
    } else {
      console.error("Redirected to a different page: ", currentURL);
    }

    console.log("Locating the heading 'Test Hotel UPDATED'...");
    const newHeading = page.locator('h2:text("Test Hotel UPDATED")');

    const headingPresent = await newHeading.isVisible({ timeout: 5000 });
    if (headingPresent) {
      console.log("Heading Present");
    } else {
      console.log("Heading not present");
    }

    console.log(
      "Finding the 'View Details' link associated with 'Test Hotel'..."
    );
    const hotelContainerr = newHeading.locator(".."); // Go to the parent container
    const containerHTML = await hotelContainerr.evaluate(
      (node) => node.outerHTML
    );
    console.log("Container HTML:\n", containerHTML);

    const viewDetailsLinkk = hotelContainerr.getByRole("link", {
      name: /View Details/i,
    });
    await viewDetailsLinkk.scrollIntoViewIfNeeded();
    await viewDetailsLinkk.waitFor({ state: "visible" });

    console.log("Clicking 'View Details'...");
    console.log("Checking if 'View Details' link is visible...");
    const isVisible = await viewDetailsLinkk.isVisible();
    console.log(`'View Details' link visible: ${isVisible}`);

    if (!isVisible) {
      throw new Error("'View Details' link is not visible.");
    }

    console.log("Checking if 'View Details' link is enabled...");
    const isEnabled = await viewDetailsLinkk.isEnabled();
    console.log(`'View Details' link enabled: ${isEnabled}`);

    if (!isEnabled) {
      throw new Error("'View Details' link is not enabled.");
    }

    await viewDetailsLinkk.click();

    await page.waitForSelector('[name="name"]', {
      state: "visible",
      timeout: 90000,
    });

    console.log("Checking if the hotel name is updated...");
    await expect(page.locator('[name="name"]')).toHaveValue(
      "Test Hotel UPDATED"
    );

    console.log("Checking if the hotel city is updated...");
    await expect(page.locator('[name="city"]')).toHaveValue(
      "Test City UPDATED"
    );

    console.log("Checking if the hotel country is updated...");
    await expect(page.locator('[name="country"]')).toHaveValue(
      "Test Country UPDATED"
    );

    console.log("Reverting changes...");
    await page.locator('[name="name"]').fill("Test Hotel");
    await page.locator('[name="city"]').fill("Test City");
    await page.locator('[name="country"]').fill("Test Country");
    await page.getByRole("button", { name: "Save" }).click();
  });
});
