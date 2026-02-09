import { test, expect, Page } from '@playwright/test';

// --- Page Object Model (POM) Classes ---

class LoginPage {
  private page: Page;
  private usernameInput = '[data-test="username"]';
  private passwordInput = '[data-test="password"]';
  private loginButton = '[data-test="login-button"]';
  private errorMessage = '[data-test="error"]';

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

  async getErrorMessageText(): Promise<string> {
    return this.page.locator(this.errorMessage).innerText();
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return this.page.locator(this.errorMessage).isVisible();
  }
}

class InventoryPage {
  private page: Page;
  private dashboardTitle = '.app_logo';

  constructor(page: Page) {
    this.page = page;
  }

  async getDashboardTitle(): Promise<string> {
    return this.page.locator(this.dashboardTitle).innerText();
  }
}

// --- Test Data ---
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// --- Expected Error Messages ---
const invalidCredentialsError = 'Epic sadface: Username and password do not match any user in this service';
const emptyUsernameError = 'Epic sadface: Username is required';
const emptyPasswordError = 'Epic sadface: Password is required';

// --- Test Suite ---
test.describe('SCRUM-7 Login Functionality', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  test('SCRUM-7 TC1: Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
    await loginPage.login(validUsername, validPassword);
    await expect(page).toHaveURL(/inventory.html$/);
    await expect(inventoryPage.getDashboardTitle()).resolves.toBe('Swag Labs');
  });

  test('SCRUM-7 TC2: Login failure with invalid credentials @login @regression @negative', async () => {
    await loginPage.login(invalidUsername, invalidPassword);
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(invalidCredentialsError);
  });

  test('SCRUM-7 TC3: Login failure with empty username @login @regression @negative', async () => {
    await loginPage.login('', validPassword);
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyUsernameError);
  });

  test('SCRUM-7 TC4: Login failure with empty password @login @regression @negative', async () => {
    await loginPage.login(validUsername, '');
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyPasswordError);
  });

  test('SCRUM-7 TC5: Login failure with empty username and password @login @regression @negative', async () => {
    await loginPage.login('', '');
    await expect(loginPage.isErrorMessageVisible()).resolves.toBe(true);
    await expect(loginPage.getErrorMessageText()).resolves.toBe(emptyUsernameError);
  });
});