import { test, expect, Page, Locator } from '@playwright/test';

// --- Page Object Model (POM) --- //
class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('[data-test="username"]');
        this.passwordInput = page.locator('[data-test="password"]');
        this.loginButton = page.locator('[data-test="login-button"]');
        this.errorMessage = page.locator('[data-test="error"]');
    }

    async navigateToLogin(): Promise<void> {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}

// --- Test Data --- //
const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

// --- Expected Error Messages --- //
const invalidCredentialsError = 'Epic sadface: Username and password do not match any user in this service';
const emptyUsernameError = 'Epic sadface: Username is required';
const emptyPasswordError = 'Epic sadface: Password is required';

// --- Test Suite --- //
test.describe('QA-101 User Login Validation', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
    });

    test('QA-101 - Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
        await loginPage.login(validUsername, validPassword);
        await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
        await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
    });

    test('QA-101 - Login failure with invalid credentials @login @regression @negative', async () => {
        await loginPage.login(invalidUsername, invalidPassword);
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(invalidCredentialsError);
    });

    test('QA-101 - Login failure with empty username @login @regression @negative', async () => {
        await loginPage.login('', validPassword);
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(emptyUsernameError);
    });

    test('QA-101 - Login failure with empty password @login @regression @negative', async () => {
        await loginPage.login(validUsername, '');
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(emptyPasswordError);
    });

    test('QA-101 - Login failure with both fields empty @login @regression @negative', async () => {
        await loginPage.login('', '');
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText(emptyUsernameError);
    });
});