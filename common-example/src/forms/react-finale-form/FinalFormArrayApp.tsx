import { Form, Field } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { FieldArray } from 'react-final-form-arrays'
import { Box, Button, Stack, TextField, MenuItem, IconButton, Typography } from '@mui/material'
import { z } from 'zod'

// Zod schema for a single form
const singleFormSchema = z.object({
    type: z.string().min(1, 'Type is required'),
    subType: z.string().min(1, 'SubType is required'),
    id: z.string().url('ID must be a valid URL'),
})

// Zod schema for the array
const schema = z.object({
    items: z.array(singleFormSchema).min(1, 'At least one form is required'),
})

type FormValues = z.infer<typeof schema>

// Zod validator for Final Form
function zodValidate<T extends z.ZodTypeAny>(schema: T) {
    return (values: unknown) => {
        const result = schema.safeParse(values)

        if (result.success) return {}

        // Adapt zod errors to Final Form shape
        const formErrors = result.error.errors.reduce((acc: Record<string, string>, err) => {
            if (err.path.length !== 0) {
                // For array fields, path is like ['items', 0, 'type']
                const [arrName, idx, field] = err.path

                if (typeof idx === 'number' && typeof field === 'string') {
                    const key = `${arrName}[${idx}].${field}`

                    acc[key] = err.message
                } else if (typeof field === 'string') {
                    acc[field] = err.message
                } else if (typeof idx === 'string') {
                    acc[idx] = err.message
                }
            }
            return acc
        }, {})

        return formErrors
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

export const App = () => {
    return (
        <Form<FormValues>
            onSubmit={values => alert(JSON.stringify(values, null, 2))}
            initialValues={{
                items: [{ type: '', subType: '', id: '' }],
            }}
            mutators={{ ...arrayMutators }}
            validate={zodValidate(schema)}
            render={({ handleSubmit, form, pristine, submitting, values, errors }) => (
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        maxWidth: 500,
                        mx: 'auto',
                        mt: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    <Typography variant="h5" gutterBottom>
                        Array of Forms
                    </Typography>

                    <FieldArray name="items">
                        {({ fields }) => {
                            return (
                                <Stack spacing={2}>
                                    {fields.map((name, idx) => {
                                        // name is like "items[0]"
                                        const typeValue = values?.items?.[idx]?.type

                                        return (
                                            <Stack
                                                key={name}
                                                direction="row"
                                                spacing={2}
                                                alignItems="flex-start"
                                                sx={{
                                                    border: '1px solid #ddd',
                                                    p: 2,
                                                    borderRadius: 2,
                                                }}
                                            >
                                                <Stack spacing={2} flex={1}>
                                                    <Field name={`${name}.type`}>
                                                        {({ input, meta }) => {
                                                            return (
                                                                <TextField
                                                                    {...input}
                                                                    select
                                                                    label="Type"
                                                                    fullWidth
                                                                    error={meta.invalid}
                                                                    helperText={
                                                                        meta.touched && meta.error
                                                                    }
                                                                >
                                                                    {typeOptions.map(opt => (
                                                                        <MenuItem
                                                                            key={opt.value}
                                                                            value={opt.value}
                                                                        >
                                                                            {opt.label}
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>
                                                            )
                                                        }}
                                                    </Field>

                                                    <Field name={`${name}.subType`}>
                                                        {({ input, meta }) => (
                                                            <TextField
                                                                {...input}
                                                                select
                                                                label="SubType"
                                                                fullWidth
                                                                disabled={!typeValue}
                                                                error={meta.touched && !!meta.error}
                                                                helperText={
                                                                    meta.touched && meta.error
                                                                }
                                                            >
                                                                {subTypeOptions.map(opt => (
                                                                    <MenuItem
                                                                        key={opt.value}
                                                                        value={opt.value}
                                                                    >
                                                                        {opt.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                        )}
                                                    </Field>

                                                    <Field name={`${name}.id`}>
                                                        {({ input, meta }) => (
                                                            <TextField
                                                                {...input}
                                                                label="ID"
                                                                fullWidth
                                                                error={meta.touched && !!meta.error}
                                                                helperText={
                                                                    meta.touched && meta.error
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                </Stack>

                                                <IconButton
                                                    aria-label="delete"
                                                    color="error"
                                                    onClick={() =>
                                                        Number(fields.length) > 1 &&
                                                        fields.remove(idx)
                                                    }
                                                    sx={{ mt: 1 }}
                                                    disabled={fields.length === 1}
                                                >
                                                    Delete
                                                </IconButton>
                                            </Stack>
                                        )
                                    })}

                                    {typeof errors?.items === 'string' && (
                                        <Typography color="error">{errors.items}</Typography>
                                    )}

                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            fields.push({ type: '', subType: '', id: '' })
                                        }
                                    >
                                        Add Form
                                    </Button>
                                </Stack>
                            )
                        }}
                    </FieldArray>
                    <Stack direction="row" spacing={2}>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            Submit
                        </Button>
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => form.reset()}
                            disabled={submitting || pristine}
                        >
                            Reset
                        </Button>
                    </Stack>
                </Box>
            )}
        />
    )
}

export default App
