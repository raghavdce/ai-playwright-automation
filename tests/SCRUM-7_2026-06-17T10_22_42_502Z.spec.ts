import { test, expect, Page } from '@playwright/test'

// Page Object Model for SauceDemo
class LoginPage {
  readonly page: Page
  readonly usernameInput
  readonly passwordInput
  readonly loginButton
  readonly errorContainer

  constructor(page: Page) {
    this.page = page
    // Stable locators using ids and semantic classes
    this.usernameInput = page.locator('#user-name')
    this.passwordInput = page.locator('#password')
    this.loginButton = page.locator('#login-button')
    this.errorContainer = page.locator('div.error-message-container')
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/')
    // ensure we are on the login page (base url)
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/)
    await expect(this.usernameInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.loginButton).toBeVisible()
  }

  async login(username: string, password: string) {
    // Fill using stable locators
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async getErrorText() {
    return (await this.errorContainer.textContent())?.trim() ?? ''
  }
}

class InventoryPage {
  readonly page: Page
  readonly inventoryList
  readonly burgerButton
  readonly logoutLink

  constructor(page: Page) {
    this.page = page
    // Stable locators for the inventory/dashboard
    this.inventoryList = page.locator('.inventory_list')
    this.burgerButton = page.locator('#react-burger-menu-btn')
    this.logoutLink = page.locator('#logout_sidebar_link')
  }

  async expectLoaded() {
    // inventory page loads with a visible list
    await expect(this.inventoryList).toBeVisible()
    // burger menu should be visible and operable
    await expect(this.burgerButton).toBeVisible()
  }

  async openMenuAndExpectLogout() {
    await this.burgerButton.click()
    await expect(this.logoutLink).toBeVisible()
  }
}

// Test suite implementing TC1 - TC5
test.describe('SauceDemo - Login feature tests (POM)', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('TC1 - Successful login with valid credentials', async ({ page }) => {
    const validUser = 'standard_user'
    const validPass = 'secret_sauce'

    await loginPage.login(validUser, validPass)

    const inventoryPage = new InventoryPage(page)

    // Expect to be redirected to inventory/dashboard page
    await expect(page).toHaveURL(/inventory\.html$/)

    // Dashboard elements visible and user-specific nav accessible
    await inventoryPage.expectLoaded()
    await inventoryPage.openMenuAndExpectLogout()
  })

  test('TC2 - Login fails with invalid password', async ({ page }) => {
    const validUser = 'standard_user'
    const invalidPass = 'wrong_password'

    await loginPage.login(validUser, invalidPass)

    // Should not land on inventory page
    await expect(page).not.toHaveURL(/inventory\.html$/)

    // Error message displayed with an appropriate invalid-credentials message
    await expect(loginPage.errorContainer).toBeVisible()
    const errorText = await loginPage.getErrorText()
    expect(errorText.toLowerCase()).toContain('do not match')
    // additional sanity check for 'epic sadface' prefix used by the app
    expect(errorText.toLowerCase()).toContain('epic sadface')
  })

  test('TC3 - Login fails with non-existent username', async ({ page }) => {
    const nonExistentUser = 'this_user_does_not_exist'
    const anyPass = 'some_password'

    await loginPage.login(nonExistentUser, anyPass)

    // Remain on login page
    await expect(page).not.toHaveURL(/inventory\.html$/)

    // Appropriate error message displayed
    await expect(loginPage.errorContainer).toBeVisible()
    const errorText = await loginPage.getErrorText()
    expect(errorText.toLowerCase()).toContain('do not match')
  })

  test('TC4 - Login attempt with empty username and/or password fields', async ({ page }) => {
    // Subcase A: both blank
    await loginPage.login('', '')
    await expect(page).not.toHaveURL(/inventory\.html$/)
    await expect(loginPage.errorContainer).toBeVisible()
    let txt = await loginPage.getErrorText()
    // The app shows username required when username is missing
    expect(txt.toLowerCase()).toContain('username is required')

    // Subcase B: username provided, password blank
    await loginPage.goto()
    await loginPage.login('standard_user', '')
    await expect(page).not.toHaveURL(/inventory\.html$/)
    await expect(loginPage.errorContainer).toBeVisible()
    txt = await loginPage.getErrorText()
    expect(txt.toLowerCase()).toContain('password is required')

    // Subcase C: password provided, username blank
    await loginPage.goto()
    await loginPage.login('', 'secret_sauce')
    await expect(page).not.toHaveURL(/inventory\.html$/)
    await expect(loginPage.errorContainer).toBeVisible()
    txt = await loginPage.getErrorText()
    expect(txt.toLowerCase()).toContain('username is required')
  })

  test('TC5 - Locked out user cannot login and sees lockout message', async ({ page }) => {
    const lockedUser = 'locked_out_user'
    const validPass = 'secret_sauce'

    await loginPage.login(lockedUser, validPass)

    // Must remain on login page
    await expect(page).not.toHaveURL(/inventory\.html$/)

    // Specific locked-out message displayed
    await expect(loginPage.errorContainer).toBeVisible()
    const errorText = await loginPage.getErrorText()
    expect(errorText.toLowerCase()).toContain('locked out')
    // also sanity check for the 'epic sadface' prefix
    expect(errorText.toLowerCase()).toContain('epic sadface')
  })
})
