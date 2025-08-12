import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextField, Box, MenuItem, Button, IconButton, Typography, Stack } from '@mui/material'

// Zod schema for a single form
const singleFormSchema = z.object({
    type: z.string().min(1, 'Type is required'),
    subType: z.string().min(1, 'SubType is required'),
    id: z.string().url('ID must be a valid URL'),
})

// Zod schema for an array of forms
const schema = z.object({
    items: z.array(singleFormSchema).min(1, 'At least one form is required'),
})

type FormValues = z.infer<typeof schema>

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

export const ArrayOfForms: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            items: [{ type: '', subType: '', id: '' }],
        },
        resolver: zodResolver(schema),
    })

    const { fields, append, remove } = useFieldArray<FormValues, 'items', 'customId'>({
        control,
        name: 'items',
        keyName: 'customId',
    })

    const onSubmit = (data: FormValues) => {
        alert(JSON.stringify(data, null, 2))
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
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
            {fields.map((field, index) => {
                // Watch type value for this form row
                const typeValue = useWatch({
                    control,
                    name: `items.${index}.type`,
                })

                return (
                    <Stack
                        key={field.id}
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                        sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}
                    >
                        <Stack spacing={2} flex={1}>
                            <Controller
                                name={`items.${index}.type`}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Type"
                                        fullWidth
                                        error={!!errors.items?.[index]?.type}
                                        helperText={errors.items?.[index]?.type?.message}
                                    >
                                        {typeOptions.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />

                            <Controller
                                name={`items.${index}.subType`}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="SubType"
                                        fullWidth
                                        disabled={!typeValue}
                                        error={!!errors.items?.[index]?.subType}
                                        helperText={errors.items?.[index]?.subType?.message}
                                    >
                                        {subTypeOptions.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />

                            <Controller
                                name={`items.${index}.id`}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="ID"
                                        fullWidth
                                        error={!!errors.items?.[index]?.id}
                                        helperText={errors.items?.[index]?.id?.message}
                                    />
                                )}
                            />
                        </Stack>
                        <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => remove(index)}
                            sx={{ mt: 1 }}
                            disabled={fields.length === 1}
                        >
                            Delete
                        </IconButton>
                    </Stack>
                )
            })}

            {typeof errors.items?.message === 'string' && (
                <Typography color="error">{errors.items?.message}</Typography>
            )}

            <Stack direction="row" spacing={2}>
                <Button
                    variant="outlined"
                    onClick={() => append({ type: '', subType: '', id: '' })}
                >
                    Add Form
                </Button>
                <Button type="submit" variant="contained">
                    Submit
                </Button>
            </Stack>
        </Box>
    )
}
