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
