import { test, expect } from '@playwright/test';

class LoginPage {
    constructor(private page: any) {}

    async navigate() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async login(username: string, password: string) {
        if (username) {
            await this.page.fill('[data-test="username"]', username);
        }
        if (password) {
            await this.page.fill('[data-test="password"]', password);
        }
        await this.page.click('[data-test="login-button"]');
    }

    async getErrorMessage() {
        return await this.page.textContent('[data-test="error"]');
    }

    async getDashboardTitle() {
        return await this.page.textContent('.title');
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
        const title = await loginPage.getDashboardTitle();
        expect(title).toBe('Swag Labs');
    });

    test('SCRUM-7 - Login failure with invalid credentials @login @regression @negative', async ({ page }) => {
        await loginPage.login('wronguser', 'wrongpass');
        const error = await loginPage.getErrorMessage();
        expect(error).toBe('Epic sadface: Username and password do not match any user in this service');
    });

    test('SCRUM-7 - Login failure with empty username @login @regression @negative', async ({ page }) => {
        await loginPage.login('', 'secret_sauce');
        const error = await loginPage.getErrorMessage();
        expect(error).toBe('Epic sadface: Username is required');
    });

    test('SCRUM-7 - Login failure with empty password @login @regression @negative', async ({ page }) => {
        await loginPage.login('standard_user', '');
        const error = await loginPage.getErrorMessage();
        expect(error).toBe('Epic sadface: Password is required');
    });
});