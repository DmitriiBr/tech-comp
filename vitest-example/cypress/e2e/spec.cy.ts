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
