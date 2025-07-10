import { atom, createCtx } from '@reatom/core'
import {
	onConnect,
	reatomAsync,
	withCache,
	withDataAtom,
	withStatusesAtom,
} from '@reatom/framework'
import { reatomContext, useAction, useAtom } from '@reatom/npm-react'
import { useState } from 'react'
import {
	Box,
	Button,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
	Snackbar,
	Alert,
} from '@mui/material'

interface User {
	id: number
	name: string
}

interface Post {
	id: number
	userId: number
	title: string
	body: string
}

type Snackbar = {
	open: boolean
	message: string
	severity: 'success' | 'error'
}

// helpers
const ctx = createCtx()
async function request<T>(...params: Parameters<typeof fetch>): Promise<T> {
	const response = await fetch(...params)

	if (!response.ok) throw new Error(response.statusText)

	return await response.json()
}

// async atoms
const fetchUser = reatomAsync(
	(ctx, userId: number) =>
		request<User>(`https://jsonplaceholder.typicode.com/users/${userId}`, ctx.controller),
	'fetchUser',
).pipe(withDataAtom(), withStatusesAtom(), withCache())

const fetchPosts = reatomAsync(
	(ctx, userId?: number) =>
		request<Post[]>(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`, ctx.controller),
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
		// optimistic update if needed
		onEffect(_, newPost) {
			const some = newPost

			console.log(some)
		},
	},
).pipe(withStatusesAtom())

// hooks
onConnect(fetchUser.dataAtom, ctx => fetchUser(ctx, 1))
fetchUser.dataAtom.onChange((ctx, user) => {
	if (user?.id) {
		fetchPosts(ctx, user?.id)
	}
})
patchPost.onFulfill.onCall(fetchPosts.cacheAtom.invalidate)

// atoms
const editingPostIdAtom = atom<number | null>(null)
const snackbarAtom = atom<Snackbar>({
	open: false,
	message: '',
	severity: 'success',
})

const ReatomApp = () => {
	const [user] = useAtom(fetchUser.dataAtom)
	const [posts] = useAtom(fetchPosts.dataAtom)
	const updatePost = useAction(patchPost)

	const [{ isPending: userLoading, isRejected: userError }] = useAtom(fetchUser.statusesAtom)
	const [{ isPending: postsLoading, isRejected: postsError }] = useAtom(fetchUser.statusesAtom)
	const [{ isPending: updating }] = useAtom(patchPost.statusesAtom)

	const [editingPostId, setEditingPostId] = useAtom(editingPostIdAtom)
	const [snackbar, setSnackbar] = useAtom(snackbarAtom)

	const [editTitle, setEditTitle] = useState('')

	const handleEditClick = (post: Post) => {
		setEditingPostId(post.id)
		setEditTitle(post.title)
	}

	const handleEditSave = async (post: Post) => {
		try {
			updatePost({ id: post.id, title: editTitle })
			setSnackbar({ open: true, message: 'Post updated!', severity: 'success' })
			setEditingPostId(null)
			setEditTitle('')
		} catch (e) {
			console.error(e)
			setSnackbar({ open: true, message: 'Failed to update post', severity: 'error' })
		}
	}

	if (userLoading) return <CircularProgress />
	if (userError) return <Alert severity="error">Failed to load user</Alert>

	return (
		<Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
			<Typography variant="h5" gutterBottom>
				Posts for {user?.name}
			</Typography>

			{postsLoading && <CircularProgress />}

			{postsError && <Alert severity="error">Failed to load posts</Alert>}

			<List>
				{posts?.map(post => (
					<ListItem key={post.id} divider>
						{editingPostId === post.id ? (
							<>
								<TextField
									value={editTitle}
									onChange={e => setEditTitle(e.target.value)}
									size="small"
									sx={{ flex: 1, mr: 2 }}
								/>
								<Button
									variant="contained"
									color="primary"
									size="small"
									disabled={updating}
									onClick={() => handleEditSave(post)}
								>
									Save
								</Button>
								<Button
									variant="text"
									color="secondary"
									size="small"
									onClick={() => setEditingPostId(null)}
									sx={{ ml: 1 }}
								>
									Cancel
								</Button>
							</>
						) : (
							<>
								<ListItemText primary={post.title} />
								<Button
									variant="outlined"
									size="small"
									onClick={() => handleEditClick(post)}
									sx={{ ml: 2 }}
								>
									Edit
								</Button>
							</>
						)}
					</ListItem>
				))}
			</List>
			<Snackbar
				open={snackbar.open}
				autoHideDuration={3000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
			>
				<Alert
					severity={snackbar.severity}
					onClose={() => setSnackbar({ ...snackbar, open: false })}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	)
}

// Main app
export const App = () => {
	return (
		<reatomContext.Provider value={ctx}>
			<ReatomApp />
		</reatomContext.Provider>
	)
}

export default App
