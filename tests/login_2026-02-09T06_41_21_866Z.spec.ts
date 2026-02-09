import { test, expect, type Page } from '@playwright/test';

// Page Object Model for Login Page
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

  async assertDashboardTitle(expectedTitle: string) {
    await expect(this.page.locator(this.dashboardTitle)).toHaveText(expectedTitle);
  }

  async assertCurrentUrl(expectedUrlPart: string) {
    await expect(this.page).toHaveURL(new RegExp(expectedUrlPart));
  }

  async assertErrorMessageVisible() {
    await expect(this.page.locator(this.errorMessage)).toBeVisible();
  }
}

// Test Data
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// Expected Error Messages
const invalidCredentialsError = 'Epic sadface: Username and password do not match any user in this service';
const emptyUsernameError = 'Epic sadface: Username is required';
const emptyPasswordError = 'Epic sadface: Password is required';

// Test Suite
test.describe('SCRUM-7 Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('SCRUM-7 TC1 - Successful Login with Valid Credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);
    await loginPage.assertCurrentUrl('inventory.html');
    await loginPage.assertDashboardTitle('Swag Labs');
  });

  test('SCRUM-7 TC2 - Login Failure with Invalid Credentials @login @regression @negative', async ({ page }) => {
    await loginPage.login(invalidUsername, invalidPassword);
    await loginPage.assertErrorMessageVisible();
    await expect(loginPage.getErrorMessageText()).resolves.toBe(invalidCredentialsError);
    await loginPage.assertCurrentUrl('saucedemo.com'); // Ensure still on login page
  });

  test('SCRUM-7 TC3 - Login Failure with Empty Username @login @regression @negative', async ({ page }) => {
    await loginPage.login('', validPassword);
    await loginPage.assertErrorMessageVisible();
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyUsernameError);
    await loginPage.assertCurrentUrl('saucedemo.com'); // Ensure still on login page
  });

  test('SCRUM-7 TC4 - Login Failure with Empty Password @login @regression @negative', async ({ page }) => {
    await loginPage.login(validUsername, '');
    await loginPage.assertErrorMessageVisible();
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyPasswordError);
    await loginPage.assertCurrentUrl('saucedemo.com'); // Ensure still on login page
  });
});