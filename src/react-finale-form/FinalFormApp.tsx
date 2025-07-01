import { Form, Field } from 'react-final-form'
import { TextField, MenuItem, Button, Box, Stack } from '@mui/material'
import { z } from 'zod'

// Zod schema
const schema = z.object({
    type: z.string().min(1, 'Type is required'),
    subType: z.string().min(1, 'SubType is required'),
    id: z.string().url('ID must be a valid URL'),
})

// Validation adapter
const zodValidate = <T extends z.ZodTypeAny>(schema: T) => {
    return (values: unknown) => {
        const result = schema.safeParse(values)

        if (result.success) return {}

        console.log(result.error.errors)

        return result.error.errors.reduce((acc: Record<string, string>, err) => {
            if (err.path.length) {
                const path = err.path.join('.')

                acc[path] = err.message
            }

            return acc
        }, {})
    }
}

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

type FormValues = z.infer<typeof schema>

export const App = () => {
    return (
        <Form<FormValues>
            onSubmit={values => alert(JSON.stringify(values, null, 2))}
            initialValues={{ type: '', subType: '', id: '' }}
            validate={zodValidate(schema)}
            render={({ handleSubmit, values, submitting, pristine }) => (
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
                    <Field name="type">
                        {({ input, meta }) => (
                            <TextField
                                {...input}
                                select
                                label="Type"
                                fullWidth
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                            >
                                {typeOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Field>

                    <Field name="subType">
                        {({ input, meta }) => (
                            <TextField
                                {...input}
                                select
                                label="SubType"
                                fullWidth
                                disabled={!values.type}
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                            >
                                {subTypeOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Field>

                    <Field name="id">
                        {({ input, meta }) => (
                            <TextField
                                {...input}
                                label="ID"
                                fullWidth
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                            />
                        )}
                    </Field>

                    <Stack direction="row" spacing={2}>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            Submit
                        </Button>
                        <Button type="reset" variant="outlined" disabled={submitting || pristine}>
                            Reset
                        </Button>
                    </Stack>
                </Box>
            )}
        />
    )
}

export default App
