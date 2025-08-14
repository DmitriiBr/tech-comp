import { fireEvent, render, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { PostsList } from '../src/PostsList'
import { listResource } from '../src/listResource'

const handlers = [
    http.get('https://jsonplaceholder.typicode.com/posts', () => {
        return HttpResponse.json([
            {
                id: 1,
                title: '123',
                body: 'Some body',
            },
        ])
    }),
]
const server = setupServer()

describe('PostsList', () => {
    beforeAll(() => server.listen())
    afterEach(() => {
        server.resetHandlers()
    })
    afterAll(() => server.close())

    it('Should show loader on initial render, because posts request is loading', async () => {
        listResource.reset()
        server.use(...handlers)
        const { getByRole, queryByRole } = render(<PostsList />)

        expect(getByRole('progressbar')).toBeInTheDocument()
        await waitFor(() => expect(queryByRole('progressbar')).not.toBeInTheDocument())
    })

    it('Should show loader on initial render, then show list, after request is ready', async () => {
        listResource.reset()
        server.use(...handlers)
        const { getByRole, queryByRole } = render(<PostsList />)

        expect(getByRole('progressbar')).toBeInTheDocument()
        await waitForElementToBeRemoved(queryByRole('progressbar'))
        expect(getByRole('list')).toBeInTheDocument()
    })

    it('Should show loader on initial render, then show it again after click on retry button', async () => {
        listResource.reset()
        server.use(...handlers)
        const { getByRole, queryByRole } = render(<PostsList />)

        expect(getByRole('progressbar')).toBeInTheDocument()
        await waitForElementToBeRemoved(queryByRole('progressbar'))

        fireEvent.click(getByRole('button'))
        fireEvent.click(getByRole('button'))

        await waitForElementToBeRemoved(queryByRole('list'))
        expect(getByRole('progressbar')).toBeInTheDocument()
    })
})
