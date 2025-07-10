import React, { useState } from 'react'
import useSWR, { mutate as globalMutate } from 'swr'
import axios from 'axios'
import {
	Box,
	Button,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
	Alert,
} from '@mui/material'
import useSWRMutation from 'swr/mutation'

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

const fetcher = (url: string) => axios.get(url).then(res => res.data)

const updatePost = async (url: string, { arg }: { arg: Partial<Post> & { id: number | null } }) => {
	const { data } = await axios.patch(`${url}${arg.id}`, arg)

	return data
}

const SWRApp: React.FC = () => {
	// 1. Fetch user
	const {
		data: user,
		error: userError,
		isValidating: userLoading,
	} = useSWR<User>('https://jsonplaceholder.typicode.com/users/1', fetcher)

	// 2. Fetch posts by user ID when user is available
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

	// Local state for editing post title
	const [editingPostId, setEditingPostId] = useState<number | null>(null)
	const [editTitle, setEditTitle] = useState('')

	const startEditing = (post: Post) => {
		setEditingPostId(post.id)
		setEditTitle(post.title)
	}

	const saveEdit = async () => {
		if (editingPostId) {
			trigger({ id: editingPostId, title: editTitle })
		}
	}

	if (userLoading) return <CircularProgress />
	if (userError) return <Alert severity="error">Failed to load user: {userError.message}</Alert>

	if (postsLoading) return <CircularProgress />
	if (postsError) return <Alert severity="error">Failed to load posts: {postsError.message}</Alert>

	return (
		<Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
			<Typography variant="h5" gutterBottom>
				Posts for {user?.name}
			</Typography>
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
								<Button variant="contained" size="small" disabled={isMutating} onClick={saveEdit}>
									Save
								</Button>
								<Button
									variant="text"
									size="small"
									onClick={() => setEditingPostId(null)}
									sx={{ ml: 1 }}
									disabled={isMutating}
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
									onClick={() => startEditing(post)}
									sx={{ ml: 2 }}
								>
									Edit
								</Button>
							</>
						)}
					</ListItem>
				))}
			</List>
			{mutationError && (
				<Alert severity="error" sx={{ mt: 2 }}>
					{mutationError}
				</Alert>
			)}
			{isMutating && <CircularProgress sx={{ mt: 2 }} />}
		</Box>
	)
}

export default SWRApp
