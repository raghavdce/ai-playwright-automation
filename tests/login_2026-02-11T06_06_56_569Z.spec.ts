import { test, expect, Page } from '@playwright/test';

// Page Object Model (POM) for Login Page
class LoginPage {
  private page: Page;
  private usernameInput = '[data-test="username"]';
  private passwordInput = '[data-test="password"]';
  private loginButton = '[data-test="login-button"]';
  private errorMessage = '[data-test="error"]';

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
    return this.page.textContent(this.errorMessage) || '';
  }

  async assertErrorMessageVisible(expectedMessage: string) {
    await expect(this.page.locator(this.errorMessage)).toBeVisible();
    await expect(this.page.locator(this.errorMessage)).toHaveText(expectedMessage);
  }
}

// Page Object Model (POM) for Inventory Page (Dashboard)
class InventoryPage {
  private page: Page;
  private dashboardTitle = '.app_logo';

  constructor(page: Page) {
    this.page = page;
  }

  async assertOnInventoryPage() {
    await expect(this.page).toHaveURL(/inventory.html$/);
    await expect(this.page.locator(this.dashboardTitle)).toHaveText('Swag Labs');
  }
}

// Test Suite Definition
test.describe('SCRUM-7 Login Functionality @login @regression', () => {
  const validUsername = 'standard_user';
  const validPassword = 'secret_sauce';
  const invalidUsername = 'wronguser';
  const invalidPassword = 'wrongpass';

  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigateToLogin();
  });

  // TC1: Successful Login (Positive Case)
  test('SCRUM-7 TC1: Successful login with valid credentials @smoke @critical', async () => {
    await loginPage.login(validUsername, validPassword);
    await inventoryPage.assertOnInventoryPage();
  });

  // TC2: Invalid Credentials (Negative Case)
  test('SCRUM-7 TC2: Login failure with invalid credentials @negative', async ({ page }) => {
    await loginPage.login(invalidUsername, invalidPassword);
    await loginPage.assertErrorMessageVisible('Epic sadface: Username and password do not match any user in this service');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  // TC3: Empty Password (Edge Case)
  test('SCRUM-7 TC3: Login failure with empty password @negative', async ({ page }) => {
    await loginPage.login(validUsername, '');
    await loginPage.assertErrorMessageVisible('Epic sadface: Password is required');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  // TC4: Empty Username (Edge Case)
  test('SCRUM-7 TC4: Login failure with empty username @negative', async ({ page }) => {
    await loginPage.login('', validPassword);
    await loginPage.assertErrorMessageVisible('Epic sadface: Username is required');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});