import React, { useState } from 'react'
import { useGetUserQuery, useGetPostsByUserQuery, useUpdatePostMutation, type Post } from './api'
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
import { skipToken } from '@reduxjs/toolkit/query'
import { Provider } from 'react-redux'
import { store } from './store'

const UserPosts: React.FC = () => {
	const { data: user, isLoading: userLoading, error: userError } = useGetUserQuery()

	// Fetch posts only when user is loaded
	const {
		data: posts,
		isLoading: postsLoading,
		error: postsError,
	} = useGetPostsByUserQuery(user?.id ?? skipToken)

	const [updatePost, { isLoading: updating }] = useUpdatePostMutation()

	// For editing post
	const [editingPostId, setEditingPostId] = useState<number | null>(null)
	const [editTitle, setEditTitle] = useState('')
	const [snackbar, setSnackbar] = useState<{
		open: boolean
		message: string
		severity: 'success' | 'error'
	}>({
		open: false,
		message: '',
		severity: 'success',
	})

	const handleEditClick = (post: Post) => {
		setEditingPostId(post.id)
		setEditTitle(post.title)
	}

	const handleEditSave = async (post: Post) => {
		try {
			await updatePost({ id: post.id, title: editTitle }).unwrap()
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

const App = () => {
	return (
		<Provider store={store}>
			<UserPosts />
		</Provider>
	)
}

export default App
