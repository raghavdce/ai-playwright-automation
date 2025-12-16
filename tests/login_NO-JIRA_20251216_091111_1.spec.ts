import { test, expect, type Page } from '@playwright/test';

// --- Page Object Model (POM) --- //
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
}

// --- Test Data --- //
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// --- Test Suite --- //
test.describe('QA-101: User Login Validation', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test('TC1 - QA-101: Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    // Act
    await loginPage.login(validUsername, validPassword);

    // Assert
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
  });

  test('TC2 - QA-101: Login failure with invalid credentials @login @regression @negative', async ({ page }) => {
    // Act
    await loginPage.login(invalidUsername, invalidPassword);

    // Assert
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username and password do not match any user in this service');
  });

  test('TC3 - QA-101: Login failure with empty username @login @regression @negative', async ({ page }) => {
    // Act
    await loginPage.login('', validPassword);

    // Assert
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required');
  });

  test('TC4 - QA-101: Login failure with empty password @login @regression @negative', async ({ page }) => {
    // Act
    await loginPage.login(validUsername, '');

    // Assert
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Password is required');
  });
});