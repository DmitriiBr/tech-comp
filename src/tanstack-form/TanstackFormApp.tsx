import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { TextField, MenuItem, Button, Box, Stack } from '@mui/material'
import type { FormEventHandler } from 'react'

// Zod schema
const schema = z.object({
    type: z.string().min(1, 'Type is required'),
    subType: z.string().min(1, 'SubType is required'),
    id: z.string().url('ID must be a valid URL'),
})

const CustomInput: typeof TextField = props => {
    return <TextField {...props} />
}

const { formContext, fieldContext, useFormContext, useFieldContext } = createFormHookContexts()
const { useAppForm } = createFormHook({
    fieldComponents: {
        TextField: CustomInput,
    },
    formComponents: {},
    formContext,
    fieldContext,
})

const typeOptions = [
    { value: '', label: 'Select type' },
    { value: 'A', label: 'Type A' },
    { value: 'B', label: 'Type B' },
]

const subTypeOptions = [
    { value: '', label: 'Select subType' },
    { value: 'X', label: 'SubType X' },
    { value: 'Y', label: 'SubType Y' },
]

const InnerComp = () => {
    const form = useFormContext()

    console.log(form.store)

    return null
}

export const App = () => {
    const form = useAppForm({
        defaultValues: {
            type: '',
            subType: '',
            id: '',
        },
        validators: {
            onChange: schema,
        },
        onSubmit: ({ value }) => {
            alert(JSON.stringify(value, null, 2))
        },
    })

    const handleSubmit: FormEventHandler = e => {
        e.preventDefault()
        form.handleSubmit()
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 400,
                mx: 'auto',
                mt: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <form.AppForm>
                <InnerComp />
            </form.AppForm>

            <form.AppField name="type">
                {({ state, handleChange }) => {
                    const error = !state.meta.isValid
                    const helperText = state.meta.errors.map(err => err?.message).join('')

                    return (
                        <TextField
                            error={error}
                            helperText={helperText}
                            label="Type"
                            fullWidth
                            value={state.value}
                            onChange={e => handleChange(e.target.value)}
                            select
                        >
                            {typeOptions.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )
                }}
            </form.AppField>

            <form.Subscribe selector={state => state.values.type}>
                {typeValue => (
                    <form.AppField name="subType">
                        {field => {
                            const error = !field.state.meta.isValid
                            const helperText = field.state.meta.errors
                                .map(err => err?.message)
                                .join('')
                            const value = field.state.value

                            return (
                                <field.TextField
                                    label="SubType"
                                    disabled={!typeValue}
                                    error={error}
                                    helperText={helperText}
                                    value={value}
                                    onChange={e => field.handleChange(e.target.value)}
                                    select
                                    fullWidth
                                >
                                    {subTypeOptions.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </field.TextField>
                            )
                        }}
                    </form.AppField>
                )}
            </form.Subscribe>

            <Stack direction="row" spacing={2}>
                <Button type="submit" variant="contained" disabled={form.state.isSubmitting}>
                    Submit
                </Button>
                <Button
                    type="button"
                    variant="outlined"
                    onClick={() => form.reset()}
                    disabled={form.state.isSubmitting}
                >
                    Reset
                </Button>
            </Stack>
        </Box>
    )
}

export default App
