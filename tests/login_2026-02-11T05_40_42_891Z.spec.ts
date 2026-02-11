import { test, expect, Page } from '@playwright/test';

// --- Page Object Model (POM) --- //
class LoginPage {
  private readonly page: Page;
  private readonly usernameInput = '[data-test="username"]';
  private readonly passwordInput = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly errorMessage = '[data-test="error"]';

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
    return this.page.locator(this.errorMessage).textContent();
  }

  async assertDashboardTitle(expectedTitle: string) {
    await expect(this.page.locator('.app_logo')).toHaveText(expectedTitle);
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
test.describe('SCRUM-7 Login Functionality @login @regression', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('SCRUM-7 TC1: Successful login with valid credentials @smoke @critical', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);
    await expect(page).toHaveURL(/.*inventory.html/);
    await loginPage.assertDashboardTitle('Swag Labs');
  });

  test('SCRUM-7 TC2: Login failure with invalid credentials @negative', async () => {
    await loginPage.login(invalidUsername, invalidPassword);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(invalidCredentialsError);
  });

  test('SCRUM-7 TC3: Login failure with empty username @negative', async () => {
    await loginPage.login('', validPassword);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyUsernameError);
  });

  test('SCRUM-7 TC4: Login failure with empty password @negative', async () => {
    await loginPage.login(validUsername, '');
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyPasswordError);
  });

  test('SCRUM-7 TC5: Login failure with empty username and password @negative', async () => {
    await loginPage.login('', '');
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyUsernameError);
  });
});