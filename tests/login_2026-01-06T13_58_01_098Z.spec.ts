import { test, expect, Page, Locator } from '@playwright/test';

// --- Page Object Model (POM) --- //

class LoginPage {
    private page: Page;
    private usernameInput: Locator;
    private passwordInput: Locator;
    private loginButton: Locator;
    private errorMessage: Locator;

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

    async getErrorMessageText(): Promise<string> {
        return this.errorMessage.innerText();
    }

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

// --- Test Suite --- //
test.describe('SCRUM-10 Login Functionality Tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
    });

    test('SCRUM-10 TC1 - Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
        // Action: Perform login with valid credentials
        await loginPage.login(validUsername, validPassword);

        // Assertion: Verify successful redirection to inventory page
        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
    });

    test('SCRUM-10 TC2 - Login failure with invalid credentials @login @regression @negative', async () => {
        // Action: Attempt login with invalid credentials
        await loginPage.login(invalidUsername, invalidPassword);

        // Assertion: Verify error message for invalid credentials
        const expectedErrorMessage = 'Epic sadface: Username and password do not match any user in this service';
        await loginPage.assertErrorMessage(expectedErrorMessage);
    });

    test('SCRUM-10 TC3 - Login failure with empty username @login @regression @negative', async () => {
        // Action: Attempt login with empty username and valid password
        await loginPage.login('', validPassword);

        // Assertion: Verify error message for empty username
        const expectedErrorMessage = 'Epic sadface: Username is required';
        await loginPage.assertErrorMessage(expectedErrorMessage);
    });

    test('SCRUM-10 TC4 - Login failure with empty password @login @regression @negative', async () => {
        // Action: Attempt login with valid username and empty password
        await loginPage.login(validUsername, '');

        // Assertion: Verify error message for empty password
        const expectedErrorMessage = 'Epic sadface: Password is required';
        await loginPage.assertErrorMessage(expectedErrorMessage);
    });

    test('SCRUM-10 TC5 - Login failure with empty username and password @login @regression @negative', async () => {
        // Action: Attempt login with both fields empty
        await loginPage.login('', '');

        // Assertion: Verify error message for empty username (first validation rule)
        const expectedErrorMessage = 'Epic sadface: Username is required';
        await loginPage.assertErrorMessage(expectedErrorMessage);
    });
});