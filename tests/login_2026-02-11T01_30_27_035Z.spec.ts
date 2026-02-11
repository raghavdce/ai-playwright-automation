import { test, expect, type Page } from '@playwright/test';

// --- Constants ---
const BASE_URL = 'https://www.saucedemo.com/';
const VALID_USERNAME = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';
const INVALID_USERNAME = 'wronguser';
const INVALID_PASSWORD = 'wrongpass';
const INVENTORY_URL_PATH = '/inventory.html';
const DASHBOARD_HEADER_TEXT = 'Swag Labs';

// --- Expected Error Messages ---
const ERROR_MESSAGE_INVALID_CREDENTIALS = 'Epic sadface: Username and password do not match any user in this service';
const ERROR_MESSAGE_EMPTY_USERNAME = 'Epic sadface: Username is required';
const ERROR_MESSAGE_EMPTY_PASSWORD = 'Epic sadface: Password is required';

// --- Page Object Model (POM) ---
class LoginPage {
  private readonly page: Page;
  private readonly usernameInput = '[data-test="username"]';
  private readonly passwordInput = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly errorMessage = '[data-test="error"]';
  private readonly dashboardHeader = '.app_logo';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(BASE_URL);
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

// --- Test Suite ---
test.describe('SCRUM-7: Login Functionality Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('SCRUM-7: Successful Login with Valid Credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await expect(page).toHaveURL(new RegExp(INVENTORY_URL_PATH + '$'));
    await expect(loginPage.getDashboardHeaderText()).resolves.toBe(DASHBOARD_HEADER_TEXT);
  });

  test('SCRUM-7: Invalid Credentials Error Message @login @regression @negative', async () => {
    await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(ERROR_MESSAGE_INVALID_CREDENTIALS);
  });

  test('SCRUM-7: Empty Username Field Error Message @login @regression @negative', async () => {
    await loginPage.login('', VALID_PASSWORD);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(ERROR_MESSAGE_EMPTY_USERNAME);
  });

  test('SCRUM-7: Empty Password Field Error Message @login @regression @negative', async () => {
    await loginPage.login(VALID_USERNAME, '');
    await expect(loginPage.getErrorMessageText()).resolves.toBe(ERROR_MESSAGE_EMPTY_PASSWORD);
  });

  test('SCRUM-7: Empty Username and Password Fields Error Message @login @regression @negative', async () => {
    await loginPage.login('', '');
    await expect(loginPage.getErrorMessageText()).resolves.toBe(ERROR_MESSAGE_EMPTY_USERNAME);
  });
});