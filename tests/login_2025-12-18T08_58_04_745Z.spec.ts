import { test, expect, Page } from '@playwright/test';

/**
 * Page Object Model (POM) for the SauceDemo Login Page.
 * Encapsulates selectors and actions related to the login functionality.
 */
class LoginPage {
    private readonly usernameInput = this.page.locator('[data-test="username"]');
    private readonly passwordInput = this.page.locator('[data-test="password"]');
    private readonly loginButton = this.page.locator('[data-test="login-button"]');
    private readonly errorMessage = this.page.locator('[data-test="error"]');
    private readonly dashboardTitle = this.page.locator('.app_logo');

    constructor(private page: Page) {}

    /**
     * Navigates to the SauceDemo login page.
     */
    async navigateToLogin(): Promise<void> {
        await this.page.goto('https://www.saucedemo.com/');
    }

    /**
     * Performs the login action with provided credentials.
     * @param username The username to enter.
     * @param password The password to enter.
     */
    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /**
     * Asserts that the user has successfully logged in and landed on the inventory page.
     */
    async assertSuccessfulLogin(): Promise<void> {
        await expect(this.page).toHaveURL(/inventory.html/);
        await expect(this.dashboardTitle).toHaveText('Swag Labs');
    }

    /**
     * Retrieves the text content of the error message element.
     * @returns The error message text.
     */
    async getErrorMessageText(): Promise<string> {
        await this.errorMessage.waitFor({ state: 'visible' });
        return this.errorMessage.innerText();
    }
}

// Test Data
const VALID_USERNAME = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';
const INVALID_USERNAME = 'wronguser';
const INVALID_PASSWORD = 'wrongpass';

// Expected Error Messages
const INVALID_CREDENTIALS_ERROR = 'Epic sadface: Username and password do not match any user in this service';
const EMPTY_USERNAME_ERROR = 'Epic sadface: Username is required';
const EMPTY_PASSWORD_ERROR = 'Epic sadface: Password is required';

/**
 * Test suite for SCRUM-10: Login Functionality
 */
test.describe('SCRUM-10 Login Functionality', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
    });

    test('SCRUM-10 Successful login with valid credentials @login @smoke @regression @critical', async () => {
        await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
        await loginPage.assertSuccessfulLogin();
    });

    test('SCRUM-10 Login failure with invalid credentials @login @regression @negative', async () => {
        await loginPage.login(INVALID_USERNAME, INVALID_PASSWORD);
        const errorMessage = await loginPage.getErrorMessageText();
        expect(errorMessage).toBe(INVALID_CREDENTIALS_ERROR);
    });

    test('SCRUM-10 Login failure with empty username @login @regression @negative', async () => {
        await loginPage.login('', VALID_PASSWORD);
        const errorMessage = await loginPage.getErrorMessageText();
        expect(errorMessage).toBe(EMPTY_USERNAME_ERROR);
    });

    test('SCRUM-10 Login failure with empty password @login @regression @negative', async () => {
        await loginPage.login(VALID_USERNAME, '');
        const errorMessage = await loginPage.getErrorMessageText();
        expect(errorMessage).toBe(EMPTY_PASSWORD_ERROR);
    });
});