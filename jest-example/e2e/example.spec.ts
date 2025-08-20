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
