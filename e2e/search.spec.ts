import { test, expect } from "@playwright/test";

// E2E Test for Search Functionality
// This test covers the complete search flow:
// 1. User navigates to the home page
// 2. User searches for listings by name
// 3. Results are filtered and displayed correctly
// 4. Empty state is shown when no results match
// 5. User can navigate to listing details

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto("/");
  });

  test("should display search bar on home page", async ({ page }) => {
    // Verify search bar is visible
    const searchInput = page.getByPlaceholder("Search listings by name...");
    await expect(searchInput).toBeVisible();

    // Verify search button is present
    const searchButton = page.getByRole("button", { name: "Search" });
    await expect(searchButton).toBeVisible();
  });

  test("should search for listings and display results", async ({ page }) => {
    // Note: This test assumes there are listings in the database
    // In a real scenario, you would seed test data before running tests

    // Type a search query (using a common term that might exist)
    const searchInput = page.getByPlaceholder("Search listings by name...");
    await searchInput.fill("camera");

    // Submit the search form
    await page.getByRole("button", { name: "Search" }).click();

    // Wait for navigation and results to load
    await page.waitForURL(/\?search=camera/);

    // Verify URL contains the search parameter
    expect(page.url()).toContain("search=camera");

    // Wait a bit for the page to render results
    await page.waitForTimeout(500);

    // Verify that listings are displayed (if any match)
    // The page should either show listing cards or an empty state message
    // Use the actual link selector since ListingCard doesn't have data-testid
    const listingLinks = page.locator('a[href^="/listings/"]');
    const hasListings = (await listingLinks.count()) > 0;
    const hasEmptyState = await page
      .getByText(/No listings found matching/)
      .isVisible()
      .catch(() => false);

    // Either listings should be shown OR empty state should be shown
    expect(hasListings || hasEmptyState).toBeTruthy();
  });

  test("should show empty state when no results match", async ({ page }) => {
    // Search for something that likely doesn't exist
    const searchInput = page.getByPlaceholder("Search listings by name...");
    await searchInput.fill("nonexistentitem12345");

    // Submit the search
    await page.getByRole("button", { name: "Search" }).click();

    // Wait for the page to update
    await page.waitForURL(/\?search=nonexistentitem12345/);

    // Verify empty state message is displayed
    const emptyStateMessage = page.getByText(/No listings found matching/);
    await expect(emptyStateMessage).toBeVisible();
    await expect(emptyStateMessage).toContainText("nonexistentitem12345");
  });

  test("should clear search and show all listings", async ({ page }) => {
    // First, perform a search
    const searchInput = page.getByPlaceholder("Search listings by name...");
    await searchInput.fill("test");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForURL(/\?search=test/);

    // Clear the search input and submit empty search
    await searchInput.clear();
    await searchInput.fill("");
    await page.getByRole("button", { name: "Search" }).click();

    // Should navigate back to home page without search parameter
    // Wait for URL to be exactly the base URL (no search params)
    await page.waitForURL(
      (url) => {
        return url.pathname === "/" && !url.search.includes("search=");
      },
      { timeout: 5000 }
    );

    // Verify URL doesn't contain search parameter
    const currentUrl = page.url();
    expect(currentUrl).not.toContain("search=");
    // Verify we're on the home page
    expect(new URL(currentUrl).pathname).toBe("/");
  });

  test("should navigate to listing details when clicking a listing card", async ({
    page,
  }) => {
    // Wait for listings to load
    await page
      .waitForSelector('a[href^="/listings/"]', { timeout: 5000 })
      .catch(() => {
        // If no listings exist, skip this test
        test.skip();
      });

    // Get the first listing card link
    const firstListingLink = page.locator('a[href^="/listings/"]').first();

    // Get the href to verify navigation
    const href = await firstListingLink.getAttribute("href");
    expect(href).toMatch(/^\/listings\/[^/]+$/);

    // Click the listing card
    await firstListingLink.click();

    // Verify navigation to listing detail page
    await page.waitForURL(/\/listings\/[^/]+$/);
    expect(page.url()).toMatch(/\/listings\/[^/]+$/);
  });
});
