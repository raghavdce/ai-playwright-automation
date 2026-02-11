import { test, expect, Page } from '@playwright/test';

// --- Page Object Model (POM) --- //
class LoginPage {
  private page: Page;
  private usernameInput = '[data-test="username"]';
  private passwordInput = '[data-test="password"]';
  private loginButton = '[data-test="login-button"]';
  private errorMessage = '[data-test="error"]';
  private dashboardHeader = '.app_logo';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessageText() {
    return this.page.locator(this.errorMessage).textContent();
  }

  async getDashboardHeaderText() {
    return this.page.locator(this.dashboardHeader).textContent();
  }
}

// --- Test Data --- //
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// --- Test Suite --- //
test.describe('SCRUM-7 Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('SCRUM-7 TC1 - Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);
    await expect(page).toHaveURL(/inventory\.html$/);
    await expect(loginPage.getDashboardHeaderText()).resolves.toBe('Swag Labs');
  });

  test('SCRUM-7 TC2 - Login failure with invalid credentials @login @regression @negative', async () => {
    await loginPage.login(invalidUsername, invalidPassword);
    const expectedErrorMessage = 'Epic sadface: Username and password do not match any user in this service';
    await expect(loginPage.getErrorMessageText()).resolves.toBe(expectedErrorMessage);
  });

  test('SCRUM-7 TC3 - Login failure with empty username @login @regression @negative', async () => {
    await loginPage.login('', validPassword);
    const expectedErrorMessage = 'Epic sadface: Username is required';
    await expect(loginPage.getErrorMessageText()).resolves.toBe(expectedErrorMessage);
  });

  test('SCRUM-7 TC4 - Login failure with empty password @login @regression @negative', async () => {
    await loginPage.login(validUsername, '');
    const expectedErrorMessage = 'Epic sadface: Password is required';
    await expect(loginPage.getErrorMessageText()).resolves.toBe(expectedErrorMessage);
  });
});