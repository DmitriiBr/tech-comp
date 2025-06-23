import React, { useState } from 'react'
import {
	useQuery,
	useMutation,
	useQueryClient,
	QueryClientProvider,
	QueryClient,
} from '@tanstack/react-query'
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
import axios from 'axios'

const queryClient = new QueryClient()

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

const fetchUser = async (): Promise<User> => {
	const { data } = await axios.get('https://jsonplaceholder.typicode.com/users/1')
	return data
}

const fetchPostsByUser = async (userId: number): Promise<Post[]> => {
	const { data } = await axios.get(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
	return data
}

const updatePost = async (post: Partial<Post> & { id: number }) => {
	const { data } = await axios.patch(`https://jsonplaceholder.typicode.com/posts/${post.id}`, post)
	return data
}

const TanstackApp: React.FC = () => {
	const queryClient = useQueryClient()

	// 1. Fetch user
	const {
		data: user,
		isLoading: userLoading,
		isError: userError,
		error: userErrorObj,
	} = useQuery({
		queryKey: ['user'],
		queryFn: fetchUser,
	})

	// 2. Fetch posts by user ID when user is available
	const {
		data: posts,
		isLoading: postsLoading,
		isError: postsError,
		error: postsErrorObj,
	} = useQuery({
		queryKey: ['posts', user?.id],
		queryFn: () => fetchPostsByUser(user!.id),
		enabled: !!user,
	})

	// 4. Mutation to update a post and invalidate posts cache on success
	const mutation = useMutation({
		mutationFn: updatePost,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['posts', user?.id],
			})
		},
	})

	// Local state for editing post title
	const [editingPostId, setEditingPostId] = useState<number | null>(null)
	const [editTitle, setEditTitle] = useState('')

	const startEditing = (post: Post) => {
		setEditingPostId(post.id)
		setEditTitle(post.title)
	}

	const saveEdit = () => {
		if (editingPostId === null) return
		mutation.mutate({ id: editingPostId, title: editTitle })
		setEditingPostId(null)
	}

	if (userLoading) return <CircularProgress />
	if (userError)
		return <Alert severity="error">Failed to load user: {(userErrorObj as Error).message}</Alert>

	if (postsLoading) return <CircularProgress />
	if (postsError)
		return <Alert severity="error">Failed to load posts: {(postsErrorObj as Error).message}</Alert>

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
								<Button
									variant="contained"
									size="small"
									disabled={mutation.isPending}
									onClick={saveEdit}
								>
									Save
								</Button>
								<Button
									variant="text"
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
			{mutation.isError && (
				<Alert severity="error" sx={{ mt: 2 }}>
					Failed to update post
				</Alert>
			)}
			{mutation.isPending && <CircularProgress sx={{ mt: 2 }} />}
		</Box>
	)
}

const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<TanstackApp />
		</QueryClientProvider>
	)
}

export default App
