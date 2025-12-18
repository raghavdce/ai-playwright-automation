import { test, expect, Page, Locator } from '@playwright/test';

// --- Page Object Model (POM) --- //

/**
 * Represents the Login Page of the SauceDemo application.
 * Encapsulates selectors and actions related to the login functionality.
 */
class LoginPage {
  private page: Page;
  private usernameInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  private errorMessage: Locator;
  private dashboardTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.dashboardTitle = page.locator('.app_logo');
  }

  /**
   * Navigates to the SauceDemo login page.
   */
  async navigateTo(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/');
  }

  /**
   * Performs a login attempt with the given credentials.
   * @param username - The username to enter.
   * @param password - The password to enter.
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Asserts that the user has successfully logged in by checking the URL and dashboard title.
   */
  async assertSuccessfulLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/.*inventory.html/);
    await expect(this.dashboardTitle).toHaveText('Swag Labs');
  }

  /**
   * Asserts that an error message is displayed with the expected text.
   * @param expectedMessage - The exact error message text to verify.
   */
  async assertErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedMessage);
  }
}

// --- Test Data --- //

const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

const invalidCredentialsError = 'Epic sadface: Username and password do not match any user in this service';
const emptyUsernameError = 'Epic sadface: Username is required';
const emptyPasswordError = 'Epic sadface: Password is required';

// --- Test Suite --- //

test.describe('SCRUM-10 Login Functionality Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test('SCRUM-10 TC1: Successful login with valid credentials @login @smoke @regression @critical', async () => {
    await loginPage.login(validUsername, validPassword);
    await loginPage.assertSuccessfulLogin();
  });

  test('SCRUM-10 TC2: Login failure with invalid credentials @login @regression @negative', async () => {
    await loginPage.login(invalidUsername, invalidPassword);
    await loginPage.assertErrorMessage(invalidCredentialsError);
  });

  test('SCRUM-10 TC3: Login failure with empty username @login @regression @negative', async () => {
    await loginPage.login('', validPassword);
    await loginPage.assertErrorMessage(emptyUsernameError);
  });

  test('SCRUM-10 TC4: Login failure with empty password @login @regression @negative', async () => {
    await loginPage.login(validUsername, '');
    await loginPage.assertErrorMessage(emptyPasswordError);
  });

  test('SCRUM-10 TC5: Login failure with empty username and password @login @regression @negative', async () => {
    await loginPage.login('', '');
    // When both fields are empty, the application typically validates the first field (username) first.
    await loginPage.assertErrorMessage(emptyUsernameError);
  });
});