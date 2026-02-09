import { test, expect, Page } from '@playwright/test';

// --- Page Object Model (POM) --- //

class LoginPage {
    private readonly page: Page;
    private readonly usernameInput = '[data-test="username"]';
    private readonly passwordInput = '[data-test="password"]';
    private readonly loginButton = '[data-test="login-button"]';
    private readonly errorMessage = '[data-test="error"]';
    private readonly dashboardLogo = '.app_logo';

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToLoginPage() {
        await this.page.goto('https://www.saucedemo.com/');
    }

    async fillCredentials(username: string, password: string) {
        await this.page.fill(this.usernameInput, username);
        await this.page.fill(this.passwordInput, password);
    }

    async clickLoginButton() {
        await this.page.click(this.loginButton);
    }

    async assertSuccessfulLogin() {
        await expect(this.page).toHaveURL(/.*inventory.html/);
        await expect(this.page.locator(this.dashboardLogo)).toHaveText('Swag Labs');
    }

    async assertErrorMessage(expectedMessage: string) {
        await expect(this.page.locator(this.errorMessage)).toHaveText(expectedMessage);
    }
}

// --- Test Data --- //

const validUsername = 'standard_user';
const validPassword = 'secret_sauce';
const invalidUsername = 'wronguser';
const invalidPassword = 'wrongpass';

const invalidCredentialsError = 'Epic sadface: Username and password do not match any user in this service';
const emptyUsernameError = 'Epic sadface: Username is required';
const emptyPasswordError = 'Epic sadface: Password is required';

// --- Test Suite --- //

test.describe('SCRUM-7 Login Functionality', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigateToLoginPage();
    });

    test('SCRUM-7 TC1: Successful login with valid credentials @login @smoke @regression @critical', async () => {
        await loginPage.fillCredentials(validUsername, validPassword);
        await loginPage.clickLoginButton();
        await loginPage.assertSuccessfulLogin();
    });

    test('SCRUM-7 TC2: Login failure with invalid credentials @login @regression @negative', async () => {
        await loginPage.fillCredentials(invalidUsername, invalidPassword);
        await loginPage.clickLoginButton();
        await loginPage.assertErrorMessage(invalidCredentialsError);
    });

    test('SCRUM-7 TC3: Login failure with empty username @login @regression @negative', async () => {
        await loginPage.fillCredentials('', validPassword);
        await loginPage.clickLoginButton();
        await loginPage.assertErrorMessage(emptyUsernameError);
    });

    test('SCRUM-7 TC4: Login failure with empty password @login @regression @negative', async () => {
        await loginPage.fillCredentials(validUsername, '');
        await loginPage.clickLoginButton();
        await loginPage.assertErrorMessage(emptyPasswordError);
    });

    test('SCRUM-7 TC5: Login failure with both fields empty @login @regression @negative', async () => {
        await loginPage.fillCredentials('', '');
        await loginPage.clickLoginButton();
        await loginPage.assertErrorMessage(emptyUsernameError);
    });
});