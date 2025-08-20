# Unit Testing























## Результаты опроса

1. Тестирование на фронте не распространено, зачем оно ему
2. Зона ответственности фронта и тестировщика
3. Опыт тестирования чего-то кроме утилит























## Jest and Vitest

| Feature/Metric       | Jest                                 | Vitest                                    |
| -------------------- | ------------------------------------ | ----------------------------------------- |
| **GitHub Stars**     | ~44,400                              | ~13,700                                   |
| **Weekly Downloads** | 18–20 million                        | 7.7 million                               |
| **Killer Features**  | - Mature, huge community             | - Super fast (Vite-powered HMR for tests) |
|                      | - Works out-of-the-box               | - Native ESM/TypeScript support           |
|                      | - Snapshots                          | - Runs tests in browser mode              |
|                      | - Rich plugin ecosystem              | - Vite/Vue/React/JSX-perfect synergy      |
|                      | - Great for legacy/CommonJS projects | - Instant watch mode like HMR             |
|                      | - Strong React integration           | - Tinyspy (built-in mocks/spies)          |
|                      | - CLI & VSCode integration           | - Top-level await, benchmarks built in    |

---

### Resume

- **Jest** is still the most popular JS testing framework in raw numbers and ecosystem, with robust snapshots, years of proven production use, and strong support for React and legacy projects.
- **Vitest** is catching up fast, especially in new Vite/modern ESM or Vue/React projects. It offers much better speed (using Vite’s HMR for test reruns), native ESM/type support, integrated browser testing, and developer-friendly watch modes.
- **Conclusion:** Use **Jest** for maximum community/legacy support; try **Vitest** for modern, super-fast, Vite/ESM/TypeScript-centric workflows. Both are great—choose based on your project’s needs.






















## Варианты тестирования на фронте

1. Юнит тесты для утилит
2. Юнит тесты для компонентов
3. Интеграционные тесты
4. Скриншот тесты
5. E2E тесты

## Юнит тестирование утилит

```typescript
export const sum = (a: number, b: number) => a + b
```

```typescript
import { sum } from '../../src/utils/sum'

describe('sum', () => {
    it('Should sum 4 and 2, to get 4', () => {
        expect(sum(2, 2)).toBe(4)
    })
})
```

## Юнит тестирование компонентов

```tsx
import React, { useState } from 'react'
import { Button, Card, CardContent, Typography, Collapse } from '@mui/material'

type Props = {
    collapsedText: string
    expandedText: string
    title?: string
    text?: string
}

export const ExpandButton = ({ collapsedText, expandedText, title, text }: Props) => {
    const [expanded, setExpanded] = useState(false)

    const handleToggle = () => setExpanded(prev => !prev)

    return (
        <>
            <Button variant="contained" onClick={handleToggle}>
                {expanded ? expandedText : collapsedText}
            </Button>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <Card sx={{ mt: 2, maxWidth: 400 }}>
                    <CardContent>
                        <Typography variant="h5" component="div">
                            {title ?? '-'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {text ?? '-'}
                        </Typography>
                    </CardContent>
                </Card>
            </Collapse>
        </>
    )
}
```

```tsx
import { fireEvent, render } from '@testing-library/react'
import { ExpandButton } from '../src/ExpandButton'

describe('ExpandButton', () => {
    it('Should render collapsed button text on initial render, and after clicking on button, render expanded text', () => {
        const collapsedText = 'collapsed'
        const expandedText = 'expanded'

        const { getByText, getByRole, queryByText } = render(
            <ExpandButton collapsedText={collapsedText} expandedText={expandedText} />,
        )

        expect(getByText(collapsedText)).toBeInTheDocument()

        fireEvent.click(getByRole('button'))

        expect(getByText(expandedText)).toBeInTheDocument()
        expect(queryByText(collapsedText)).not.toBeInTheDocument()
    })

    it('Should render title and text, when expanded', () => {
        const title = 'Title'
        const text = 'Text'

        const { getByText } = render(
            <ExpandButton
                collapsedText="collapsed"
                expandedText="expanded"
                title={title}
                text={text}
            />,
        )

        fireEvent.click(getByText('collapsed'))

        expect(getByText(title)).toBeInTheDocument()
        expect(getByText(text)).toBeInTheDocument()
    })
})
```

## Интеграционные тесты

```tsx
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Paper,
    CircularProgress,
    Box,
    Button,
} from '@mui/material'
import { reatomComponent } from '@reatom/react'
import { listResource } from './listResource'

export const PostsList = reatomComponent(() => {
    return (
        <Paper elevation={3} sx={{ maxWidth: 600, margin: '20px auto', padding: 2 }}>
            <Button role="button" disabled={!listResource.ready()} onClick={listResource.retry}>
                Retry
            </Button>

            <Typography variant="h4" component="h1" gutterBottom>
                Posts List
            </Typography>

            {!listResource.ready() && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress role="progressbar" />
                </Box>
            )}

            {listResource.error() && (
                <Typography color="error" align="center" mt={4}>
                    Error
                </Typography>
            )}

            {listResource.ready() && (
                <List role="list">
                    {listResource.data().map(post => (
                        <ListItem key={post.id} divider alignItems="flex-start">
                            <ListItemText
                                primary={
                                    <Typography variant="h6" component="span">
                                        {post.title}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        {post.body}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    )
})
```

```tsx
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
```
