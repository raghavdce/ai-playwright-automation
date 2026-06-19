import { test, expect, Page } from '@playwright/test';

class LoginPage {
    private readonly page: Page;
    private readonly usernameInput = '[data-test="username"]';
    private readonly passwordInput = '[data-test="password"]';
    private readonly loginButton = '[data-test="login-button"]';
    private readonly errorMessage = '[data-test="error"]';

    constructor(page: Page) {
        this.page = page;
    }

    async navigate() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async login(username: string, password: string) {
        if (username) await this.page.fill(this.usernameInput, username);
        if (password) await this.page.fill(this.passwordInput, password);
        await this.page.click(this.loginButton);
    }

    async getErrorMessageText(): Promise<string | null> {
        return await this.page.textContent(this.errorMessage);
    }
}

test.describe('User Login Functionality - SCRUM-7', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
    });

    test('SCRUM-7 - Successful login with valid credentials @login @smoke @regression @critical', async ({ page }) => {
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(page.locator('.title')).toHaveText('Swag Labs');
    });

    test('SCRUM-7 - Unsuccessful login with invalid credentials @login @regression @negative', async ({ page }) => {
        await loginPage.login('wronguser', 'wrongpass');
        const error = await loginPage.getErrorMessageText();
        expect(error).toBe('Epic sadface: Username and password do not match any user in this service');
    });

    test('SCRUM-7 - Unsuccessful login with empty username @login @regression @negative', async ({ page }) => {
        await loginPage.login('', 'secret_sauce');
        const error = await loginPage.getErrorMessageText();
        expect(error).toBe('Epic sadface: Username is required');
    });

    test('SCRUM-7 - Unsuccessful login with empty password @login @regression @negative', async ({ page }) => {
        await loginPage.login('standard_user', '');
        const error = await loginPage.getErrorMessageText();
        expect(error).toBe('Epic sadface: Password is required');
    });
});