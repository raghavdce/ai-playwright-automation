import { test, expect, Page } from '@playwright/test';

// --- Constants ---
const BASE_URL = 'https://www.saucedemo.com/';
const VALID_USERNAME = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';
const INVALID_USERNAME = 'wronguser';
const INVALID_PASSWORD = 'wrongpass';
const EXPECTED_DASHBOARD_TEXT = 'Swag Labs';
const EXPECTED_SUCCESS_URL_PATH = '/inventory.html';
const ERROR_MESSAGE_INVALID_CREDENTIALS = 'Epic sadface: Username and password do not match any user in this service';
const ERROR_MESSAGE_EMPTY_USERNAME = 'Epic sadface: Username is required';
const ERROR_MESSAGE_EMPTY_PASSWORD = 'Epic sadface: Password is required';

// --- Page Object Model ---
class LoginPage {
  private readonly page: Page;
  private readonly usernameInput = '[data-test="username"]';
  private readonly passwordInput = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly errorMessage = '[data-test="error"]';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(BASE_URL);
  }

  async login(username: string, password: string) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessageText(): Promise<string> {
    return this.page.textContent(this.errorMessage) || '';
  }

  async assertSuccessfulLogin() {
    await expect(this.page).toHaveURL(new RegExp(EXPECTED_SUCCESS_URL_PATH));
    await expect(this.page.locator('.app_logo')).toHaveText(EXPECTED_DASHBOARD_TEXT);
  }
}

// --- Test Suite ---
test.describe('SCRUM-7: Login Functionality Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('SCRUM-7: Successful login with valid credentials', { tag: ['@login', '@smoke', '@regression', '@critical'] }, async () => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    await loginPage.assertSuccessfulLogin();
  });

  test('SCRUM-7: Negative test - Invalid credentials', { tag: ['@login', '@regression', '@negative'] }, async () => {
    await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe(ERROR_MESSAGE_INVALID_CREDENTIALS);
  });

  test('SCRUM-7: Negative test - Empty username field', { tag: ['@login', '@regression', '@negative'] }, async () => {
    await loginPage.login('', VALID_PASSWORD);
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe(ERROR_MESSAGE_EMPTY_USERNAME);
  });

  test('SCRUM-7: Negative test - Empty password field', { tag: ['@login', '@regression', '@negative'] }, async () => {
    await loginPage.login(VALID_USERNAME, '');
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe(ERROR_MESSAGE_EMPTY_PASSWORD);
  });

  test('SCRUM-7: Negative test - Empty username and password fields', { tag: ['@login', '@regression', '@negative'] }, async () => {
    await loginPage.login('', '');
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe(ERROR_MESSAGE_EMPTY_USERNAME);
  });
});