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

  async navigateToLoginPage(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessageText(): Promise<string | null> {
    return this.page.locator(this.errorMessage).innerText();
  }

  async getDashboardTitleText(): Promise<string | null> {
    return this.page.locator(this.dashboardTitle).innerText();
  }
}

// --- Test Data --- //
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// --- Test Suite --- //
test.describe('SCRUM-7: Login Functionality Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
  });

  test('SCRUM-7: Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);

    // Assert successful navigation to inventory page
    await expect(page).toHaveURL(/.*inventory.html/);

    // Assert dashboard text
    const dashboardText = await loginPage.getDashboardTitleText();
    expect(dashboardText).toBe('Swag Labs');
  });

  test('SCRUM-7: Login failure with invalid credentials @login @regression @negative', async () => {
    await loginPage.login(invalidUsername, invalidPassword);

    // Assert error message visibility and content
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe('Epic sadface: Username and password do not match any user in this service');
  });

  test('SCRUM-7: Login failure with empty username @login @regression @negative', async () => {
    await loginPage.login('', validPassword);

    // Assert error message visibility and content
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe('Epic sadface: Username is required');
  });

  test('SCRUM-7: Login failure with empty password @login @regression @negative', async () => {
    await loginPage.login(validUsername, '');

    // Assert error message visibility and content
    const errorMessage = await loginPage.getErrorMessageText();
    expect(errorMessage).toBe('Epic sadface: Password is required');
  });
});