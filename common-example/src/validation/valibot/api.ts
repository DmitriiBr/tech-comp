import {
    object,
    string,
    number,
    array,
    union,
    literal,
    nullable,
    optional,
    pipe,
    email,
    intersect,
    type InferOutput,
    parse,
    safeParse,
    minValue,
    maxValue,
    omit,
} from 'valibot'

// Define ItemType union
const itemTypeSchema = union([literal('b'), literal('c')])
const nullableItemTypeSchema = nullable(itemTypeSchema)

// Person schema (full)
const personSchema = object({
    name: optional(string()),
    age: optional(number()),
    email: pipe(string(), email()),
})

// Item schemas with discriminated union on 'type'
const itemASchema = object({
    type: literal('a'),
    price: pipe(number(), minValue(1), maxValue(10)),
})

const itemOtherSchema = object({
    type: nullableItemTypeSchema,
    price: pipe(
        number('Must be number'),
        minValue(2, 'Some message'),
        maxValue(20, 'Some message'),
    ),
})

const itemSchema = union([itemASchema, itemOtherSchema])

// User schema
const userSchema = object({
    items: array(itemSchema),
})

// Compose customerSchema using `intersect` to combine schemas
const customerSchema = intersect([omit(personSchema, ['age']), userSchema])

// Types
type PersonType = InferOutput<typeof personSchema>
type UserType = InferOutput<typeof userSchema>
type CustomerType = InferOutput<typeof customerSchema>

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

const fn = async () => {
    const res = union([
        object({
            x: pipe(number(), maxValue(10)),
            newField: string(),
        }),
        object({
            x: pipe(number(), maxValue(20)),
            anotherField: string(),
        }),
    ])

    // Validate the input object
    const result = safeParse(res, {
        x: 11,
        newField: '123',
        anotherField: 'some',
    })

    console.log('Validation result:', result)
}

const main = () => {
    const personParsed = parse(personSchema, obj)
    const userParsed = safeParse(userSchema, obj)
    const customerParsed = safeParse(customerSchema, obj)

    console.group('VALIBOT')
    fn()
    console.log('person schema: ', personParsed)
    console.table(userParsed.issues)
    console.table(customerParsed.issues)
    console.groupEnd()
}

export default main
