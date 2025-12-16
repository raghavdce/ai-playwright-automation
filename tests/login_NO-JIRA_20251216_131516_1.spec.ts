import { test, expect, Page } from '@playwright/test';

// --- Page Object Model (POM) --- //
class LoginPage {
  private page: Page;
  private usernameInput = '[data-test="username"]';
  private passwordInput = '[data-test="password"]';
  private loginButton = '[data-test="login-button"]';
  private errorMessage = '[data-test="error"]';
  private dashboardTitle = '.app_logo';

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
    return this.page.textContent(this.errorMessage);
  }

  async getDashboardTitleText(): Promise<string> {
    return this.page.textContent(this.dashboardTitle);
  }
}

// --- Test Data --- //
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// --- Expected Error Messages --- //
const invalidCredentialsError = 'Epic sadface: Username and password do not match any user in this service';
const emptyUsernameError = 'Epic sadface: Username is required';
const emptyPasswordError = 'Epic sadface: Password is required';

// --- Test Suite --- //
test.describe('QA-101 User Login Validation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC1 - QA-101 Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(loginPage.getDashboardTitleText()).resolves.toBe('Swag Labs');
  });

  test('TC2 - QA-101 Login failure with invalid credentials @login @regression @negative', async () => {
    await loginPage.login(invalidUsername, invalidPassword);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(invalidCredentialsError);
  });

  test('TC3 - QA-101 Login failure with empty username @login @regression @negative', async () => {
    await loginPage.login('', validPassword);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyUsernameError);
  });

  test('TC4 - QA-101 Login failure with empty password @login @regression @negative', async () => {
    await loginPage.login(validUsername, '');
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyPasswordError);
  });
});