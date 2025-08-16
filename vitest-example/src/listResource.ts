import { action, atom, computed, sleep, withAsyncData, wrap } from '@reatom/core'

interface Post {
    id: number
    title: string
    body: string
}

const createWithReset = () => {
    const refresh = atom(Date.now(), 'refresh')
    const withReset = () => () => ({
        reset: action(() => refresh.set(Date.now())),
    })

    return {
        refresh,
        withReset,
    }
}

const { withReset, refresh } = createWithReset()

export const listResource = computed(async () => {
    refresh()

    await sleep(2000)
    const response = await wrap(fetch('https://jsonplaceholder.typicode.com/posts'))
    const data: Post[] = await wrap(response.json())

    return data
}, 'listResource').extend(withAsyncData({ initState: [] }), withReset())
