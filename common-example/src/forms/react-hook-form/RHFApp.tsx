import { useForm, Controller, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextField, Box, MenuItem, Button } from '@mui/material'

// Zod schema
const schema = z.object({
    type: z.string().min(1, 'Type is required'),
    subType: z.string().min(1, 'SubType is required'),
    id: z.string().url('ID must be a valid URL'),
})

type FormValuesSchema = z.infer<typeof schema>

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

export const App: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValuesSchema>({
        defaultValues: { type: '', subType: '', id: '' },
        resolver: zodResolver(schema),
    })

    // Watch the value of 'type'
    const typeValue = useWatch<FormValuesSchema, 'type'>({ control, name: 'type' })

    const onSubmit = (data: FormValuesSchema) => {
        alert(JSON.stringify(data, null, 2))
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                maxWidth: 400,
                mx: 'auto',
                mt: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        select
                        label="Type"
                        fullWidth
                        error={!!errors.type}
                        helperText={errors.type?.message}
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
                name="subType"
                control={control}
                render={({ field, fieldState }) => (
                    <TextField
                        {...field}
                        select
                        label="SubType"
                        fullWidth
                        disabled={!typeValue}
                        error={fieldState.invalid}
                        helperText={fieldState.error?.message}
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
                name="id"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="ID"
                        fullWidth
                        error={!!errors.id}
                        helperText={errors.id?.message}
                    />
                )}
            />

            <Button type="submit" variant="contained">
                Submit
            </Button>
        </Box>
    )
}

export default App
