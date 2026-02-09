import { test, expect, Page, Locator } from '@playwright/test';

// --- Page Object Model (POM) --- //
class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly dashboardTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.dashboardTitle = page.locator('.app_logo');
  }

  async navigateToLoginPage() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

// --- Test Suite --- //
test.describe('SCRUM-7 Login Functionality Tests', () => {
  const validUsername = 'standard_user';
  const validPassword = 'secret_sauce';
  const invalidUsername = 'wronguser';
  const invalidPassword = 'wrongpass';

  test('SCRUM-7 TC1: Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();

    await loginPage.login(validUsername, validPassword);

    // Assert successful navigation to inventory page
    await expect(page).toHaveURL(/.*inventory.html/);
    // Assert dashboard text visibility
    await expect(loginPage.dashboardTitle).toHaveText('Swag Labs');
  });

  test('SCRUM-7 TC2: Login failure with invalid credentials @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();

    await loginPage.login(invalidUsername, invalidPassword);

    // Assert error message visibility and content
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username and password do not match any user in this service');
    // Assert stay on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('SCRUM-7 TC3: Login failure with empty password field @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();

    await loginPage.login(validUsername, '');

    // Assert error message visibility and content
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Password is required');
    // Assert stay on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('SCRUM-7 TC4: Login failure with empty username field @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();

    await loginPage.login('', validPassword);

    // Assert error message visibility and content
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username is required');
    // Assert stay on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('SCRUM-7 TC5: Login failure with both fields empty @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();

    await loginPage.login('', '');

    // Assert error message visibility and content (username validation takes precedence)
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Username is required');
    // Assert stay on login page
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});