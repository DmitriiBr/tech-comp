import { z } from 'zod'

// Define ItemType union
const ItemType = z.enum(['b', 'c']).nullable()

// Person shape
const personShape = {
    name: z.string().optional(),
    age: z.number().optional(),
    email: z.string().email(),
}

// User shape with conditional validation on price using superRefine
const itemSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('a'), price: z.number().min(1).max(10) }),
    z.object({ type: ItemType, price: z.number().min(2).max(20, 'Some message') }),
])

const userShape = {
    items: z.array(itemSchema),
}

// Create schemas
const personSchema = z.object(personShape)

// with age
const userSchema = z.object(userShape).merge(z.object({ age: z.number() }))

// Merge schemas and strip `age`
const customerSchema = personSchema.merge(z.object(userShape)).omit({ age: true })

// Types
type PersonSchemaType = z.infer<typeof personSchema>
type UserSchemaType = z.infer<typeof userSchema>
type CustomerSchemaType = z.infer<typeof customerSchema>

const obj = {
    name: 'test name',
    age: 12,
    email: 'example@gmail.com',
    items: [
        {
            price: 11,
            type: 'a',
        },
        {
            price: 21,
            type: 'b',
        },
    ],
}

const fn = () => {
    const res = z.union([
        z.object({ x: z.number().max(10), newField: z.string() }),
        z.object({ x: z.number().max(20), anotherField: z.string() }),
    ])

    console.log(
        '10: ',
        res.safeParse({
            x: 11,
            newField: '123',
            anotherField: 'some',
        }),
    )
}

const main = () => {
    const personParsed = personSchema.parse(obj)
    const userParsed = userSchema.safeParse(obj)
    const customerParsed = customerSchema.safeParse(obj)

    console.group('ZOD')
    fn()
    console.log('person schema: ', personParsed)
    console.table(userParsed.error?.issues)
    console.table(customerParsed.error?.issues)
    console.groupEnd()
}

export default main
