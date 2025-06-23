import { createFetcherStore, createMutatorStore } from './fetcher'
import { useStore } from '@nanostores/react'
import React, { useState } from 'react'
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
import { atom } from 'nanostores'

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

// store 1
const $user = createFetcherStore<User>(['https://jsonplaceholder.typicode.com/users/1'])
const $posts = createFetcherStore<Post[]>([$user, 'Posts'], {
	fetcher: async () => {
		const id = $user.value?.data?.id
		const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${id}`)
		const data = res.json()

		return data
	},
})
const $editPost = createMutatorStore<Pick<Post, 'id' | 'title'>>(
	async ({ data: post, revalidate }) => {
		// You can either revalidate the author…
		revalidate('Posts')

		console.log(post)

		// …or you can optimistically update current cache.
		// const [updateCache, rest] = getCacheUpdater('Posts')
		// updateCache({ ...rest, comments: [...rest.posts, post] })

		const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${post.id}`, {
			method: 'PATCH',
		})

		if (res.ok) $posts.invalidate()
	},
)

// store 2
const $editingPostId = atom<number | null>(null)
const $snackbar = atom<Snackbar>({
	open: false,
	message: '',
	severity: 'success',
})

const setEditingPostId = (id: number | null) => $editingPostId.set(id)
const setSnackbar = (snackbar: Snackbar) => $snackbar.set(snackbar)

// Component
const NanostoresApp: React.FC = () => {
	const { data: user, loading: userLoading, error: userError } = useStore($user)
	const { data: posts, loading: postsLoading, error: postsError } = useStore($posts)
	const { mutate: updatePost, loading: updating } = useStore($editPost)

	const editingPostId = useStore($editingPostId)
	const snackbar = useStore($snackbar)

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

export default NanostoresApp
