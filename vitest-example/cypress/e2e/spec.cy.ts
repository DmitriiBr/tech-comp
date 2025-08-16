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
        cy.get('[role="button"]').click()

        // Seinding request again
        cy.get('[role="progressbar"]').should('exist')
    })
})
