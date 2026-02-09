import { test, expect, Page } from '@playwright/test';

// Page Object Model (POM) for the Login Page
class LoginPage {
  private readonly page: Page;
  private readonly usernameInput = '[data-test="username"]';
  private readonly passwordInput = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly errorMessage = '[data-test="error"]';
  private readonly appLogo = '.app_logo';

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToLogin() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessageText(): Promise<string> {
    return this.page.locator(this.errorMessage).innerText();
  }

  async getDashboardText(): Promise<string> {
    return this.page.locator(this.appLogo).innerText();
  }
}

// Test Suite for SCRUM-7 Login Functionality
test.describe('SCRUM-7 Login Functionality', () => {
  const validUsername = 'standard_user';
  const validPassword = 'secret_sauce';
  const invalidUsername = 'wronguser';
  const invalidPassword = 'wrongpass';

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  // TC1: Successful login with valid credentials
  test('SCRUM-7 Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(validUsername, validPassword);
    await expect(page).toHaveURL(/inventory.html/);
    await expect(loginPage.getDashboardText()).resolves.toBe('Swag Labs');
  });

  // TC2: Invalid login with wrong credentials
  test('SCRUM-7 Invalid login with wrong credentials @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(invalidUsername, invalidPassword);
    await expect(loginPage.getErrorMessageText()).resolves.toBe('Epic sadface: Username and password do not match any user in this service');
  });

  // TC3: Login with empty password
  test('SCRUM-7 Login with empty password @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(validUsername, '');
    await expect(loginPage.getErrorMessageText()).resolves.toBe('Epic sadface: Password is required');
  });

  // TC4: Login with empty username
  test('SCRUM-7 Login with empty username @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('', validPassword);
    await expect(loginPage.getErrorMessageText()).resolves.toBe('Epic sadface: Username is required');
  });

  // TC5: Login with empty username and password
  test('SCRUM-7 Login with empty username and password @login @regression @negative', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('', '');
    await expect(loginPage.getErrorMessageText()).resolves.toBe('Epic sadface: Username is required');
  });
});