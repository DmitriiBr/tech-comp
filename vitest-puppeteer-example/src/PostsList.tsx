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

// const sleep = (time: number) => new Promise(r => setTimeout(r, time))

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
                    <CircularProgress role="progressbar" className="progress" />
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
