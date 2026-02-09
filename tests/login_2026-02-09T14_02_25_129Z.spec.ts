import { test, expect, Page } from '@playwright/test';

// --- Page Object Model (POM) --- //

/**
 * Represents the Login Page of the SauceDemo application.
 * Encapsulates selectors and actions related to the login functionality.
 */
class LoginPage {
    private readonly page: Page;
    private readonly usernameInput = '[data-test="username"]';
    private readonly passwordInput = '[data-test="password"]';
    private readonly loginButton = '[data-test="login-button"]';
    private readonly errorMessage = '[data-test="error"]';
    private readonly dashboardTitle = '.app_logo';

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigates to the base URL of the application.
     */
    async navigateToLogin() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    /**
     * Fills the username and password fields and clicks the login button.
     * @param username The username to enter.
     * @param password The password to enter.
     */
    async login(username: string, password: string) {
        await this.page.fill(this.usernameInput, username);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.loginButton);
    }

    /**
     * Retrieves the text content of the error message element.
     * Asserts that the error message is visible before returning its text.
     * @returns The text content of the error message.
     */
    async getErrorMessageText(): Promise<string> {
        await expect(this.page.locator(this.errorMessage)).toBeVisible();
        return this.page.locator(this.errorMessage).innerText();
    }

    /**
     * Asserts that the user has successfully logged in by checking the URL and dashboard title.
     */
    async assertSuccessfulLogin() {
        await expect(this.page).toHaveURL(/inventory.html/);
        await expect(this.page.locator(this.dashboardTitle)).toHaveText('Swag Labs');
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
test.describe('SCRUM-7 Login Functionality Tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
    });

    test('SCRUM-7 TC1 - Successful login with valid credentials @login @smoke @regression @critical', async () => {
        await loginPage.login(validUsername, validPassword);
        await loginPage.assertSuccessfulLogin();
    });

    test('SCRUM-7 TC2 - Login failure with invalid credentials @login @regression @negative', async () => {
        await loginPage.login(invalidUsername, invalidPassword);
        const errorMessage = await loginPage.getErrorMessageText();
        expect(errorMessage).toBe(invalidCredentialsError);
    });

    test('SCRUM-7 TC3 - Login failure with empty username @login @regression @negative', async () => {
        await loginPage.login('', validPassword);
        const errorMessage = await loginPage.getErrorMessageText();
        expect(errorMessage).toBe(emptyUsernameError);
    });

    test('SCRUM-7 TC4 - Login failure with empty password @login @regression @negative', async () => {
        await loginPage.login(validUsername, '');
        const errorMessage = await loginPage.getErrorMessageText();
        expect(errorMessage).toBe(emptyPasswordError);
    });

    test('SCRUM-7 TC5 - Login failure with empty username and password @login @regression @negative', async () => {
        await loginPage.login('', '');
        const errorMessage = await loginPage.getErrorMessageText();
        // The application prioritizes the username validation when both fields are empty.
        expect(errorMessage).toBe(emptyUsernameError);
    });
});