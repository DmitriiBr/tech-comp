# E2E testing

## Playwright and Cypress

| Feature/Metric       | Playwright                           | Cypress                          |
| -------------------- | ------------------------------------ | -------------------------------- |
| **GitHub Stars**     | 71,000+                              | 46,000+                          |
| **Weekly Downloads** | 13 million+                          | 5.3 million+                     |
| **Killer Features**  | - Supports Chromium, Firefox, WebKit | - Supports Chrome, firefox       |
|                      | - Typescrript                        | - Javascript                     |
|                      | - Easier configuration               | - Has paid content               |
|                      | - API close to jest, and vitest      | - API differs of jest and vitest |
|                      | - Basic UI                           | - Pretty UI                      |

---

### Resume

- **Playwright** has surged ahead in both GitHub stars and npm downloads, largely due to its broad browser coverage (including WebKit, Firefox, Chromium), robust parallelization, and advanced features for modern web testing. Its powerful network mocking, handling of multiple browser contexts, and auto-generated test code (codegen) are highlights.
- **Cypress** remains a favorite for its exceptional developer experience, real-time debugging, automatic waiting, and an excellent UI that visualizes test runs. It’s especially easy for new projects or rapid onboarding and has very strong documentation and community.
- **Conclusion:**
    - **Choose Playwright:** For comprehensive cross-browser testing, parallel execution, advanced automation needs, or if you need modern features like multiple browser contexts and powerful CI integration.
    - **Choose Cypress:** If ease of use, robust GUI debugging, and reliability in a single-browser (Chromium-based) environment are your priority. It still maintains a massive community and plenty of integrations.

## Пример теста playwright

```typescript
import { test, expect } from '@playwright/test'

test('has title', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await expect(page).toHaveTitle(/Posts List/)
})

test('Screenshot test example', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await expect(page).toHaveScreenshot()
})

test('has header', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await expect(page.getByText('Posts List')).toBeInViewport()
})

test('has loader', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await expect(page.getByRole('progressbar')).toBeInViewport()
})

test('Should show loader, and then remove it after response is ready', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await expect(page.getByRole('progressbar')).toBeInViewport()
    await page.getByRole('progressbar').waitFor({ state: 'hidden' })
    await expect(page.getByRole('progressbar')).not.toBeInViewport()
})

test('Should show loader, then after request is ready, click on button, and show loader again', async ({
    page,
}) => {
    await page.goto('http://localhost:5173')

    await expect(page.getByRole('progressbar')).toBeInViewport()
    await page.getByRole('progressbar').waitFor({ state: 'hidden' })
    await expect(page.getByRole('progressbar')).not.toBeInViewport()

    await page.getByRole('button').click()
    await page.route('https://jsonplaceholder.typicode.com/posts', async route => {
        await new Promise(res => setTimeout(res, 2000))
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            json: JSON.stringify([
                {
                    id: 1,
                    title: 'Some title',
                    body: 'text',
                },
            ]),
        })
    })

    await expect(page.getByRole('progressbar')).toBeInViewport()
    await page.getByRole('progressbar').waitFor({ state: 'hidden' })
    await expect(page.getByRole('progressbar')).not.toBeInViewport()
})
```

## Пример теста cypress

```typescript
describe('template spec', () => {
    beforeEach(() => {
        cy.visit('http://localhost:5173')
    })

    it('Should have screenshot', () => {
        cy.screenshot()
    })

    it('Should contain text "Posts List"', () => {
        cy.contains('Posts List').should('exist')
    })

    it('Should contain loader when fetching', () => {
        cy.contains('Posts List').should('exist')
        cy.get('[role="progressbar"]').should('exist')
    })

    it('Should show loader, and then remove it after response is ready ', () => {
        cy.contains('Posts List').should('exist')
        cy.get('[role="progressbar"]').should('exist')

        // Request is ready here
        cy.get('[role="progressbar"]').should('not.exist')
    })

    it('Should show loader, then after request is ready, click on button, and show loader again', () => {
        cy.get('[role="progressbar"]').should('exist')

        // Request is ready here
        cy.get('[role="progressbar"]').should('not.exist')

        cy.intercept('GET', 'https://jsonplaceholder.typicode.com/posts', req => {
            req.reply({
                statusCode: 200,
                body: [
                    {
                        id: 1,
                        title: 'Some title',
                        body: 'text',
                    },
                ],
                delay: 2000,
            })
        }).as('listResource')

        cy.get('[role="button"]').click()

        // Sending request again
        cy.get('[role="progressbar"]').should('exist')

        cy.wait('@listResource')
        cy.get('[role="progressbar"]').should('not.exist')
    })
})
```
