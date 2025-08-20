const puppeteer = require('puppeteer')

;(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // Navigate the page to a URL
    await page.goto('http://localhost:5173')
    const title = await page.title()

    if (title === 'Posts List') {
        console.log('V Title is correct', `Title is: ${title}`)
    } else {
        console.log('X Title is incorrect.', `Title is: ${title}`)
    }

    await browser.close()
})()
