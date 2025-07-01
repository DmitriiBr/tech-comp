# Forms and validation

## Forms API comparison

| Feature                                           | TanStack Form | Formik | Redux Form | React Hook Form | Final Form |
| ------------------------------------------------- | ------------- | ------ | ---------- | --------------- | ---------- |
| Github Repo / Stars                               | 5k            |        |            | 42.7k           |            |
| Supported Frameworks                              | (all)         | React  | React      | React           | (All + JS) |
| Bundle Size                                       | ~9.7 KB       |        |            | ~10.8 KB        | ~6 KB      |
| Granular reactivity                               | ✅            | ❓     | ❓         | ❓              | ✅         |
| Built-in async validation debounce                | ✅            | ❓     | ❓         | ❓              | ❓         |
| React Compiler support                            | ✅            | ❓     | ❓         | 🛑              | ❓         |
| SSR integrations                                  | ✅            | 🛑     | 🛑         | 🛑              | 🛑         |
| First-class TypeScript support                    | ✅            | ❓     | ❓         | ✅              | ✅         |
| Fully Inferred TypeScript (Including Deep Fields) | ✅            | ❓     | ❓         | ✅              | 🛑         |
| Headless UI components                            | ✅            | ❓     | ❓         | ✅              | ❓         |
| Nested object/array fields                        | ✅            | ✅     | ❓         | ✅\*(1)         | ✅         |
| Async validation                                  | ✅            | ✅     | ❓         | ✅              | ✅         |
| Schema-based Validation                           | ✅            | ✅     | ❓         | ✅              | ❓         |
| First Party Devtools                              | 🛑\*(2)       | 🛑     | ✅\*(3)    | ✅              | ❓         |
| Framework agnostic                                | ✅            | ❓     | ❓         | 🛑              | ✅         |

---

\*(1) For nested arrays, react-hook-form requires you to cast the field array by its name if you're using TypeScript

\*(2) Planned

\*(3) Via Redux Devtools

### Cases

1. Основное АПИ
2. Отделение инпутов в отдельные компоненты
3. Массив форм
4. Разбиение форм на более мелкие
5. Подписка на изменение поля(ей)

### React Hook Form

**React Hook Form** is the current industry standard for new projects, praised for performance and simplicity.

#### Hooks

```typescript
// Zod schema
const schema = z.object({
    type: z.string().min(1, 'Type is required'),
    subType: z.string().min(1, 'SubType is required'),
    id: z.string().url('ID must be a valid URL'),
})

type FormValues = z.infer<typeof schema>

export const App: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: { type: '', subType: '', id: '' },
        resolver: zodResolver(schema),
    })

    const onSubmit = (data: FormValues) => {
        alert(JSON.stringify(data, null, 2))
    }

    // ...
}
```

#### Input bindings

```typescript
// Controller component
const Input1 = ({ name }) => {
    return (
        <Controller
            name={name}
            render={({ field, fieldState }) => (
                <TextField
                    {...field}
                    label="ID"
                    fullWidth
                    error={fieldState.invalid}
                    helperText={fieldState.error?.message}
                />
            )}
        />
    )
}

// useController component
const Input2 = ({ name }) => {
    const { field, fieldState } = useController({
        name,
    })

    return (
        <TextField
            {...field}
            label="ID"
            fullWidth
            error={fieldState.invalid}
            helperText={fieldState.error?.message}
        />
    )
}

```

#### Array of forms

```typescript
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

export const ArrayOfForms = () => {
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

    // ...

    return fields.map(() => <div>form</div>)
}
```

#### Nesting forms

```typescript
const InnerComp = () => {
    const methods = useFormContext()
    const fieldValue = useWatch()
    const field = useController({...})

    // ...
}

export const App = () => {
    const methods = useForm<FormValues>({
        defaultValues: { type: '', subType: '', id: '' },
        resolver: zodResolver(schema),
    })

    return (
        <FormProvider {...methods}>
            <InnerComp />
            <InnerComp />
            <InnerComp />
        </FormProvider >
    )
}
```

#### Subscriptions

```typescript
// Watch the value of 'type'
const typeValue = useWatch<FormValuesSchema, 'type'>({ control, name: 'type' })

// Watch multiple at once
const [typeValue, subTypeValue] = useWatch<FormValuesSchema, ['type', 'subType']>({
    control,
    name: ['type', 'subType'],
})
```

### Formik (Legacy)

**Formik** remains widely used, especially in legacy and enterprise codebases.

### React Final Form

**React Final Form** is valued for its fine-grained control and minimalism.

#### Basic usage

```typescript
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

        return result.error.errors.reduce((acc: Record<string, string>, err) => {
            if (err.path.length) {
                const path = err.path.join('.')

                acc[path] = err.message
            }

            return acc
        }, {})
    }
}

type FormValues = z.infer<typeof schema>

export const FinalFormWithZod: React.FC = () => {
    const handleMainSubmit = (values: FormValues) => {
        alert(JSON.stringify(values, null, 2))
    }

    return (
        <Form<FormValues>
            onSubmit={handleMainSubmit}
            initialValues={{ type: '', subType: '', id: '' }}
            validate={zodValidate(schema)}
            render={({ handleSubmit, values, submitting, pristine }) => (
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >

                {/* ...Inputs */}

                    <Stack direction="row" spacing={2}>
                        <Button type="submit" variant="contained" disabled={submitting || pristine}>
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
```

#### Array of forms

```typescript
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
                </Box>
            )}
        />
    )
}
```

#### Input bindings

Need to add another two libraries for implementation.

- `react-final-form-arrays`
- `final-form-arrays`

```typescript
const Input = () => {
    return (
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
    )
}
```

### Tanstack Form

**TanStack Form** is an emerging option, especially if you use other TanStack tools.


#### Resume


1. Более изолированный (\*другой) подход
2. Есть дебаунс
3. Типизация на весь хук и далее через селекторы, а не на каждый вазов
4. Нет девтулзов
5. Есть поддержка React compiler (React 19)
6. Поддерживает только https://github.com/standard-schema/standard-schema. Zod, valibot, effect/schema.

**Yup не является @standard-schema/spec**

#### Hooks

```tsx
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import type { FormEventHandler } from 'react'

// defining form store
const { formContext, fieldContext, useFormContext, useFieldContext } = createFormHookContexts()
const { useAppForm } = createFormHook({
    fieldComponents: {
        TextField: CustomInput,
    },
    formComponents: {
        SubscribeButton: CustomButton
    },
    formContext,
    fieldContext,
})

// Zod schema
const zodSchema = z.object({
    type: z.string().min(1, 'Type is required'),
    subType: z.string().min(1, 'SubType is required'),
    id: z.string().url('ID must be a valid URL'),
})

// Form component
export const App = () => {
    const form = useAppForm({
        defaultValues: {
            type: '',
            subType: '',
            id: '',
        },
        validators: {
            onChange: zodSchema,
            onSubmit: ...,
            onBlur: ...
        },
        onSubmit: ({ value }) => {
            alert(JSON.stringify(value, null, 2))
        },
    })

    const handleSubmit: FormEventHandler = e => {
        e.preventDefault()
        form.handleSubmit()
    }

    // AppForm - full form context
    // AppField - only one field context

    return (
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
    )
}
```

#### Input bindings

```typescript
const { formContext, fieldContext, useFormContext, useFieldContext } = createFormHookContexts()
const { useAppForm } = createFormHook({
    fieldComponents: {
        TextField: CustomInput,
    },
    formComponents: {},
    formContext,
    fieldContext,
})

const Input = () => {
    const { state, handleChange } = useFieldContext()

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
}
```

#### Array of forms

```tsx
const App = () => {
    const form = useAppForm({
        defaultValues: {
            people: [],
        },
        onSubmit({ value }) {
            alert(JSON.stringify(value))
        },
    })

    return (
        <div>
            <form
                onSubmit={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}
            >
                <form.Field name="people" mode="array">
                    {field => {
                        return (
                            <div>
                                {field.state.value.map((_, i) => {
                                    return (
                                        <form.Field key={i} name={`people[${i}].name`}>
                                            {subField => {
                                                return (
                                                    <div>
                                                        <label>
                                                            <div>Name for person {i}</div>
                                                            <input
                                                                value={subField.state.value}
                                                                onChange={e =>
                                                                    subField.handleChange(
                                                                        e.target.value,
                                                                    )
                                                                }
                                                            />
                                                        </label>
                                                    </div>
                                                )
                                            }}
                                        </form.Field>
                                    )
                                })}
                                <button
                                    onClick={() => field.pushValue({ name: '', age: 0 })}
                                    type="button"
                                >
                                    Add person
                                </button>
                            </div>
                        )
                    }}
                </form.Field>
                <form.Subscribe
                    selector={state => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <button type="submit" disabled={!canSubmit}>
                            {isSubmitting ? '...' : 'Submit'}
                        </button>
                    )}
                />
            </form>
        </div>
    )
}
```

#### Nesting forms

```typescript
const { formContext, fieldContext, useFormContext } = createFormHookContexts()
const { useAppForm } = createFormHook({
    fieldComponents: {
        TextField: CustomInput,
    },
    formComponents: {},
    formContext,
    fieldContext,
})

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

    return (
        <form.AppForm>
            <InnerComp />
        </form.AppForm>
    )
}
```

#### Subscriptions

```tsx
// hook (useStore)
import { useStore } from '@tanstack/react-form'

// useStore subscription
const typeValue = useStore(form.store, state => state.values.type)

// Multiple at once
const [typeValue, subTypeValue] = useStore(form.store, state => [state.values.type, state.values.subType])

// Subscribe component without rerenders
<form.Subscribe selector={state => state.values.type}>
    {typeValue => (
        <form.Field name="subType">
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
        </form.Field>
    )}
</form.Subscribe>
```
