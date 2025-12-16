import { test, expect, type Page } from '@playwright/test';

// --- Page Object Model (POM) --- //
class LoginPage {
  private readonly page: Page;
  private readonly usernameInput = '[data-test="username"]';
  private readonly passwordInput = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly errorMessage = '[data-test="error"]';
  private readonly dashboardTitle = '.app_logo';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
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

  async getDashboardTitleText(): Promise<string> {
    return this.page.locator(this.dashboardTitle).innerText();
  }
}

// --- Test Data --- //
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// --- Test Suite --- //
test.describe('QA-101 User Login Validation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC1 (QA-101) - Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);
    await expect(page).toHaveURL(/inventory.html$/);
    await expect(loginPage.getDashboardTitleText()).resolves.toBe('Swag Labs');
  });

  test('TC2 (QA-101) - Login failure with invalid credentials @login @regression @negative', async () => {
    await loginPage.login(invalidUsername, invalidPassword);
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe('Epic sadface: Username and password do not match any user in this service');
  });

  test('TC3 (QA-101) - Login failure with empty username @login @regression @negative', async () => {
    await loginPage.login('', validPassword);
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe('Epic sadface: Username is required');
  });

  test('TC4 (QA-101) - Login failure with empty password @login @regression @negative', async () => {
    await loginPage.login(validUsername, '');
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe('Epic sadface: Password is required');
  });

  test('TC5 (QA-101) - Login failure with both fields empty @login @regression @negative', async () => {
    await loginPage.login('', '');
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe('Epic sadface: Username is required');
  });
});