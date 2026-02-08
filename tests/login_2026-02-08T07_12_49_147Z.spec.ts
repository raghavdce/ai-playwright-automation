import { test, expect, Page } from '@playwright/test';

// Page Object Model for Login Page
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

    async navigate() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async login(username: string, password: string) {
        await this.page.fill(this.usernameInput, username);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.loginButton);
    }

    async verifyLoginSuccess() {
        await expect(this.page).toHaveURL(/inventory.html$/);
        await expect(this.page.locator(this.dashboardTitle)).toHaveText('Swag Labs');
    }

    async verifyErrorMessage(expectedMessage: string) {
        const errorElement = this.page.locator(this.errorMessage);
        await expect(errorElement).toBeVisible();
        await expect(errorElement).toHaveText(expectedMessage);
    }
}

// Test Suite for Login Functionality
test.describe('SCRUM-9 Login Functionality', () => {
    const validUsername = 'standard_user';
    const validPassword = 'secret_sauce';
    const invalidUsername = 'wronguser';
    const invalidPassword = 'wrongpass';

    test('SCRUM-9 @login @smoke @regression @critical - Successful login with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(validUsername, validPassword);
        await loginPage.verifyLoginSuccess();
    });

    test('SCRUM-9 @login @regression @negative - Login with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(invalidUsername, invalidPassword);
        await loginPage.verifyErrorMessage('Epic sadface: Username and password do not match any user in this service');
    });

    test('SCRUM-9 @login @regression @negative - Login with empty username', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('', validPassword);
        await loginPage.verifyErrorMessage('Epic sadface: Username is required');
    });

    test('SCRUM-9 @login @regression @negative - Login with empty password', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(validUsername, '');
        await loginPage.verifyErrorMessage('Epic sadface: Password is required');
    });
});