import { test, expect, type Page } from '@playwright/test';

// --- Constants ---
const BASE_URL = 'https://www.saucedemo.com/';
const VALID_USERNAME = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';
const INVALID_USERNAME = 'wronguser';
const INVALID_PASSWORD = 'wrongpass';
const INVENTORY_URL_PATH = '/inventory.html';
const DASHBOARD_TEXT = 'Swag Labs';
const ERROR_MESSAGE_INVALID_CREDENTIALS = 'Epic sadface: Username and password do not match any user in this service';
const ERROR_MESSAGE_EMPTY_USERNAME = 'Epic sadface: Username is required';
const ERROR_MESSAGE_EMPTY_PASSWORD = 'Epic sadface: Password is required';

// --- Page Object Model ---
class LoginPage {
  private page: Page;
  private usernameInput = '[data-test="username"]';
  private passwordInput = '[data-test="password"]';
  private loginButton = '[data-test="login-button"]';
  private errorMessage = '[data-test="error"]';

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

  async getErrorMessageText(): Promise<string> {
    return this.page.locator(this.errorMessage).innerText();
  }

  async assertErrorMessageVisible(expectedMessage: string) {
    const errorLocator = this.page.locator(this.errorMessage);
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toHaveText(expectedMessage);
  }
}

// --- Test Suite ---
test.describe('SCRUM-7: Login Functionality Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('SCRUM-7: Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);

    // Assert successful navigation to inventory page
    await expect(page).toHaveURL(new RegExp(INVENTORY_URL_PATH + '$'));

    // Assert dashboard text visibility
    await expect(page.locator('.app_logo')).toHaveText(DASHBOARD_TEXT);
  });

  test('SCRUM-7: Negative test - Invalid username @login @regression @negative', async ({ page }) => {
    await loginPage.login(INVALID_USERNAME, VALID_PASSWORD);

    // Assert error message visibility and content
    await loginPage.assertErrorMessageVisible(ERROR_MESSAGE_INVALID_CREDENTIALS);

    // Assert current URL remains login page
    await expect(page).toHaveURL(BASE_URL);
  });

  test('SCRUM-7: Negative test - Invalid password @login @regression @negative', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, INVALID_PASSWORD);

    // Assert error message visibility and content
    await loginPage.assertErrorMessageVisible(ERROR_MESSAGE_INVALID_CREDENTIALS);

    // Assert current URL remains login page
    await expect(page).toHaveURL(BASE_URL);
  });

  test('SCRUM-7: Negative test - Empty username field @login @regression @negative', async ({ page }) => {
    await loginPage.login('', VALID_PASSWORD);

    // Assert error message visibility and content
    await loginPage.assertErrorMessageVisible(ERROR_MESSAGE_EMPTY_USERNAME);

    // Assert current URL remains login page
    await expect(page).toHaveURL(BASE_URL);
  });

  test('SCRUM-7: Negative test - Empty password field @login @regression @negative', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, '');

    // Assert error message visibility and content
    await loginPage.assertErrorMessageVisible(ERROR_MESSAGE_EMPTY_PASSWORD);

    // Assert current URL remains login page
    await expect(page).toHaveURL(BASE_URL);
  });

  test('SCRUM-7: Negative test - Both fields empty @login @regression @negative', async ({ page }) => {
    await loginPage.login('', '');

    // Assert error message visibility and content (username required takes precedence)
    await loginPage.assertErrorMessageVisible(ERROR_MESSAGE_EMPTY_USERNAME);

    // Assert current URL remains login page
    await expect(page).toHaveURL(BASE_URL);
  });
});