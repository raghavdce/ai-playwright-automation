import { test, expect, Page } from '@playwright/test';

// Page Object Model for SauceDemo
class LoginPage {
  readonly page: Page;
  readonly usernameInput;
  readonly passwordInput;
  readonly loginButton;
  readonly errorContainer;

  constructor(page: Page) {
    this.page = page;
    // stable locators using data-test and well-known selectors
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    // error container selector used in SauceDemo UI
    this.errorContainer = page.locator('.error-message-container h3');
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
    await expect(this.page).toHaveURL('https://www.saucedemo.com/');
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string) {
    // clear inputs first for stability
    await this.usernameInput.fill('');
    await this.passwordInput.fill('');
    if (username !== null) await this.usernameInput.fill(username);
    if (password !== null) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText() {
    if (await this.errorContainer.isVisible()) {
      return (await this.errorContainer.textContent())?.trim() ?? '';
    }
    return '';
  }
}

class InventoryPage {
  readonly page: Page;
  readonly inventoryItems;
  readonly menuButton;
  readonly logoutLink;

  constructor(page: Page) {
    this.page = page;
    this.inventoryItems = page.locator('.inventory_item');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(/.*\/inventory.html/);
    await expect(this.inventoryItems.first()).toBeVisible();
    await expect(this.menuButton).toBeVisible();
  }

  async openMenu() {
    await this.menuButton.click();
    await expect(this.logoutLink).toBeVisible();
  }

  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }
}

// Tests
test.describe('SauceDemo Authentication Scenarios', () => {
  test('TC-001: Successful login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // Validate redirected to inventory/dashboard
    await inventoryPage.isLoaded();

    // Validate products listed and account/menu actions available
    const itemCount = await inventoryPage.inventoryItems.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('TC-002: Login with invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'wrong_password');

    // Should stay on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Error message should indicate username/password mismatch
    const err = await loginPage.getErrorText();
    expect(err).toContain('do not match');
    expect(err.length).toBeGreaterThan(0);
  });

  test.describe('TC-003: Login with empty username and/or password fields', () => {
    const variants = [
      { name: 'username blank', username: '', password: 'secret_sauce', expectedContains: 'Username is required' },
      { name: 'password blank', username: 'standard_user', password: '', expectedContains: 'Password is required' },
      { name: 'both blank', username: '', password: '', expectedContains: 'Username is required' },
    ];

    for (const v of variants) {
      test(`TC-003 - ${v.name}`, async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Use null to avoid filling when we want to simulate the field left empty
        const user = v.username === '' ? '' : v.username;
        const pass = v.password === '' ? '' : v.password;

        await loginPage.login(user, pass);

        // Should remain on login page
        await expect(page).toHaveURL('https://www.saucedemo.com/');

        const err = await loginPage.getErrorText();
        // Validate appropriate validation message displayed
        expect(err).toContain(v.expectedContains);
      });
    }
  });

  test('TC-004: Locked out user cannot login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('locked_out_user', 'secret_sauce');

    // Should stay on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    const err = await loginPage.getErrorText();
    expect(err).toContain('locked out');
  });

  test('TC-005: Successful login followed by logout clears session', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');

    // Ensure logged in
    await inventoryPage.isLoaded();

    // Logout
    await inventoryPage.logout();

    // After logout, should be on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Attempt direct access to inventory page after logout
    await page.goto('https://www.saucedemo.com/inventory.html');

    // Should be redirected back to login (no access to inventory without login)
    await expect(page).not.toHaveURL(/.*\/inventory.html/);
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});
