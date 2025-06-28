# State managers

## Libraries and Statistics

| Technology              | GitHub Stars | NPM Package Size | NPM Weekly Downloads |
| ----------------------- | ------------ | ---------------- | -------------------- |
| **Redux Toolkit**       | ~10,900      | ~6.75 MB         | 4,661,636            |
| **TanStack Query**      | 45,600+      | ~68 KB           | 2,000,000+           |
| **Reatom**              | ~2,200       | ~25 KB           | ~2,000               |
| **Nanostores (+query)** | ~2,500       | 265–803 bytes    | 43,000+              |
| **Zustand**             | 49,000+      | ~1.1 KB          | 2,800,000            |
| **SWR**                 | 23,000+      | ~11 KB           | 2,000,000+           |

### From the search results and ecosystem:

- **Zustand** is praised for its minimal footprint (~1 KB), ease of use, and performance advantages over Redux in many cases [1][2][3][4][5][6][7].
- **Redux Toolkit** remains the industry standard for complex and large-scale apps, with extensive middleware and tooling [1][3][4][5][6].
- **TanStack Query** (React Query) excels at server state management with caching and background refetching [general knowledge].
- **Reatom** and **Nanostores** are smaller, more niche solutions with lightweight bundles and atomic or modular approaches [search].
- **SWR** is a popular React data fetching library with a focus on simplicity and caching, widely adopted in Next.js apps.

## API comparison

### RTK

User -> Posts -> Update Post -> Posts

```typescript
// api
export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://jsonplaceholder.typicode.com/',
    }),
    tagTypes: ['Posts'],
    endpoints: builder => ({
        getUser: builder.query<User, void>({
            query: () => `users/1`, // Example: always fetch user with id 1
        }),
        getPostsByUser: builder.query<Post[], number>({
            query: userId => `posts?userId=${userId}`,
            providesTags: ['Posts'],
        }),
        updatePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
            query: ({ params, body }) => ({
                url: `posts/${params.id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Posts'],
        }),
    }),
})

export const { useGetUserQuery, useGetPostsByUserQuery, useUpdatePostMutation } = api

// App
const UserPosts: React.FC = () => {
    const { data: user, isLoading: userLoading, error: userError } = useGetUserQuery()
    const {
        data: posts,
        isLoading: postsLoading,
        error: postsError,
    } = useGetPostsByUserQuery(user?.id ?? skipToken)

    const [updatePost, { isLoading: updating }] = useUpdatePostMutation()

    //...
}
```

### React query

User -> Posts -> Update Post -> Posts

```typescript
const fetchUser = async (): Promise<User> => {
    const { data } = await axios.get('https://jsonplaceholder.typicode.com/users/1')
    return data
}

const fetchPostsByUser = async (userId: number): Promise<Post[]> => {
    const { data } = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
    return data
}

const updatePost = async (post: Partial<Post> & { id: number }) => {
    const { data } = await axios.patch(
        `https://jsonplaceholder.typicode.com/posts/${post.id}`,
        post,
    )
    return data
}

const TanstackApp = () => {
    const queryClient = useQueryClient()

    const {
        data: user,
        isLoading: userLoading,
        isError: userError,
        error: userErrorObj,
    } = useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
    })

    const {
        data: posts,
        isLoading: postsLoading,
        isError: postsError,
        error: postsErrorObj,
    } = useQuery()

    const mutation = useMutation({
        mutationFn: updatePost,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['posts', user?.id],
            })
        },
    })

    //...
}
```

### SWR

```typescript
const fetcher = (url: string) => axios.get(url).then(res => res.data)

const updatePost = async (url: string, { arg }: { arg: Partial<Post> & { id: number | null } }) => {
    const { data } = await axios.patch(`${url}${arg.id}`, arg)

    return data
}

const SWRApp: React.FC = () => {
    const {
        data: user,
        error: userError,
        isValidating: userLoading,
    } = useSWR<User>(['https://jsonplaceholder.typicode.com/users/1', 'some key'], fetcher)

    const {
        data: posts,
        error: postsError,
        isValidating: postsLoading,
    } = useSWR<Post[]>(
        user ? `https://jsonplaceholder.typicode.com/posts?userId=${user.id}` : null,
        fetcher,
    )

    const { trigger, error, isMutating } = useSWRMutation(
        user ? `https://jsonplaceholder.typicode.com/posts?userId=${user.id}` : null,
        (_, arg) => updatePost('https://jsonplaceholder.typicode.com/posts/', arg),
    )

    //...
}
```

### Nanostores

#### Counter

```typescript
const $counter = atom<number>(0)

const increment = () => $counter.set($counter.get() + 1)
const decrement = () => $counter.set($counter.get() - 1)

const $isZero = computed($counter, value => value === 0)

const NanostoresApp = () => {
	const counter = useStore($counter)
	const isZero = useStore($isZero)

	return (
		<Box>
			{counter}

			<Button onClick={increment}>Increment</Button>
			<Button onClick={decrement}>Decrement</Button>

			{isZero ? 'It is zero' : null}
		</Box>
	)
}
```

#### Queries

User -> Posts -> Update Post -> Posts

```typescript
import { nanoquery } from '@nanostores/query'

export const [createFetcherStore, createMutatorStore] = nanoquery({
    fetcher: (...keys) =>
        fetch(keys.join('')).then(r => {
            if (!r.ok) throw new Error(`HTTP error ${r.status}`)

            return r.json()
        }),
})

const $id = atom(0)
const $flag = atom(false)
const $user = createFetcherStore<User>([$flag, 'https://jsonplaceholder.typicode.com/users/1'])

const $posts = createFetcherStore<Post[]>([$user, 'Posts'], {
    fetcher: async () => {
        const id = $user.value?.data?.id
        const someId = $id.value
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${id}`)
        const data = res.json()

        return data
    },
})
const $editPost = createMutatorStore<Pick<Post, 'id' | 'title'>>(
    async ({ data: post, revalidate, createUpdater }) => {
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}`, {
            method: 'PATCH',
        })

        if (res.ok) $posts.invalidate()
    },
)

// Component
const NanostoresApp: React.FC = () => {
    const { data: user, loading: userLoading, error: userError } = useStore($user)
    const { data: posts, loading: postsLoading, error: postsError } = useStore($posts)
    const { mutate: updatePost, loading: updating } = useStore($editPost)

    //...
}
```

### Reatom (v3)

#### Counter

```typescript
// Counter
const counterAtom = atom(0)
const isZeroAtom = atom(ctx => ctx.spy(counterAtom) === 0)

const ReatomCounterApp = () => {
	const [counter, setCounter] = useAtom(counterAtom)
	const [isZero] = useAtom(isZeroAtom)

	return (
		<Box>
			{counter}

			<Button onClick={() => setCounter(counter + 1)}>Increment</Button>
			<Button onClick={() => setCounter(counter - 1)}>Decrement</Button>

			{ ? 'It is zero' : null}
		</Box>
	)
}
```

#### Queries

```typescript
const fetchUser = reatomAsync(
    (ctx, userId: number) =>
        request<User>(`https://jsonplaceholder.typicode.com/users/${userId}`, ctx.controller),
    'fetchUser',
).pipe(withDataAtom(), withStatusesAtom(), withCache())

const fetchPosts = reatomAsync(
    (ctx, userId?: number) =>
        request<Post[]>(
            `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
            ctx.controller,
        ),
    'fetchPosts',
).pipe(withDataAtom(), withStatusesAtom(), withCache())

const patchPost = reatomAsync(
    (ctx, post: Partial<Post>) => {
        const { signal } = ctx.controller

        return request<Post[]>(`https://jsonplaceholder.typicode.com/posts/${post.id}`, {
            method: 'PATCH',
            body: JSON.stringify(post),
            signal,
        })
    },
    {
        name: 'updatePost',
    },
).pipe(withStatusesAtom())

onConnect(fetchUser.dataAtom, ctx => fetchUser(ctx, 1))
fetchUser.dataAtom.onChange((ctx, user) => {
    if (user?.id) {
        fetchPosts(ctx, user?.id)
    }
})
patchPost.onFulfill.onCall(fetchPosts.cacheAtom.invalidate)

const ReatomApp = () => {
    const [user] = useAtom(fetchUser.dataAtom)
    const [posts] = useAtom(fetchPosts.dataAtom)
    const updatePost = useAction(patchPost)

    const [{ isPending: userLoading, isRejected: userError }] = useAtom(fetchUser.statusesAtom)
    const [{ isPending: postsLoading, isRejected: postsError }] = useAtom(fetchUser.statusesAtom)
    const [{ isPending: updating }] = useAtom(patchPost.statusesAtom)

    // ...
}
```

## Zustand

```typescript
import create from 'zustand'

// Define the state and actions interface
interface CounterState {
    count: number
    increment: () => void
    decrement: () => void
    reset: () => void
}

// Create the store
export const useCounterStore = create<CounterState>(set => ({
    count: 0,
    increment: () => set(state => ({ count: state.count + 1 })),
    decrement: () => set(state => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
}))
```

## Черновик после обсуждения

ReduxToolkit - проверенная временем либа, минус которой только ее оргомный размер и кол-во бойлерплейта.
Стоит брать, если уж очень сильно не хочется использовать что-то другое

Tanstack Query - этот кеш менеджер в сравнении с SWR понравился больше всех.
Плюсы:
Понятный интерфейс, не много весит, есть всё необходимое, как и в RTK для работы с запросами
Минусы:
Всё таки позволяет работать только с кешем запросов, если хочется использовать именно стейт менеджер, то придётся подключить
дополнительную либу. Нет SSR

SWR - понравился меньше в сравнении с остальными
Плюсы:
Мало весит
Минусы:
Сильно менее приятный интерфейс, чем у Tanstack и RTK.
Реализация мутаций не очень понятная.

Nanostores - очень (очень) легковесный стейт менеджер без лишних настроек
Плюсы:
Очень мало весит.
Очень просто интерфейс. Очень просто и понятно отделяется логика от компонента.
Есть @nanostores/query для работы с кешем. (Если хочется построить полноценную FLUX архитектура).
Минусы:
Если хочется отказаться от логики в компонентах совсем, придётся поломать свое восприятие фронтового приложения.
Изначального набора утилит может быть не достаточно для некоторых кейсов.

Reatom - стейт менеджер, который пытается решить все задачи стейтс на фронте.
Плюсы:
Мало весит. В сравнении с nanostores, набор утилит из коробки гораздо больше.
Минусы:
Нет объективной причины его брать, если есть nanostores.
