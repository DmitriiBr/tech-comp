import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { Fragment } from 'react/jsx-runtime'

// Zod schema
const schema = z.object({
    people: z.array(
        z.object({
            name: z.string().trim().min(1),
            age: z.string().trim().min(1),
        }),
    ),
})

const { formContext, fieldContext } = createFormHookContexts()
const { useAppForm } = createFormHook({
    fieldComponents: {},
    formComponents: {},
    formContext,
    fieldContext,
})

const App = () => {
    const defaultValues: { people: { name: string | null; age: string }[] } = {
        people: [],
    }
    const form = useAppForm({
        defaultValues,
        validators: {
            onChange: schema,
        },
        onSubmit({ value }) {
            console.log(schema.safeParse(value))
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
                                        <Fragment key={i}>
                                            <form.Field name={`people[${i}].name`}>
                                                {subField => {
                                                    return (
                                                        <div>
                                                            <label>
                                                                <div>Name for person {i}</div>
                                                                <input
                                                                    value={
                                                                        subField.state.value ?? ''
                                                                    }
                                                                    onChange={e => {
                                                                        subField.validate('change')
                                                                        subField.handleChange(
                                                                            e.target.value,
                                                                        )
                                                                    }}
                                                                />
                                                            </label>
                                                            {!subField.state.meta.isValid &&
                                                                'Required!'}
                                                        </div>
                                                    )
                                                }}
                                            </form.Field>
                                            <form.Field name={`people[${i}].age`}>
                                                {subField => {
                                                    return (
                                                        <div>
                                                            <label>
                                                                <div>Age for person {i}</div>
                                                                <input
                                                                    value={subField.state.value}
                                                                    onChange={e =>
                                                                        subField.handleChange(
                                                                            e.target.value,
                                                                        )
                                                                    }
                                                                />
                                                            </label>
                                                            {!subField.state.meta.isValid &&
                                                                'Required!'}
                                                        </div>
                                                    )
                                                }}
                                            </form.Field>
                                        </Fragment>
                                    )
                                })}
                                <button
                                    onClick={() => field.pushValue({ name: null, age: '' })}
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

export default App
