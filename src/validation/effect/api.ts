import { Schema, Either } from 'effect'

// Define ItemType union (nullable)
const ItemTypeSchema = Schema.Union(Schema.Literal('b'), Schema.Literal('c'), Schema.Undefined)

// Person schema
const personSchema = Schema.Struct({
    name: Schema.optional(Schema.String),
    age: Schema.optional(Schema.Number),
    email: Schema.String,
})

// Item schemas with discriminated union on 'type' and conditional price validation
const itemASchema = Schema.Struct({
    type: Schema.Literal('a'),
    price: Schema.Number.pipe(
        Schema.lessThanOrEqualTo(10, { message: () => 'Some message max 10' }),
        Schema.greaterThanOrEqualTo(1, { message: () => 'Some message min 1' }),
        Schema.int({ message: () => 'Some int message' }),
    ),
})

const itemOtherSchema = Schema.Struct({
    type: ItemTypeSchema,
    price: Schema.Number.pipe(
        Schema.lessThanOrEqualTo(20, { message: () => 'Some message max 20' }),
        Schema.greaterThanOrEqualTo(2, { message: () => 'Some message min 2' }),
        Schema.int({ message: () => 'Some int message 1' }),
    ),
})

const itemSchema = Schema.Union(itemASchema, itemOtherSchema)

// User schema
const userSchema = Schema.Struct({
    items: Schema.Array(itemSchema),
})

// Compose customerSchema without `age` by explicitly omitting it
const customerSchema = Schema.Struct({
    name: Schema.optional(Schema.String),
    email: Schema.String,
    items: Schema.Array(itemSchema),
})

// Types inferred automatically by Effect Schema
type PersonSchemaType = typeof personSchema
type UserSchemaType = typeof userSchema
type CustomerSchemaType = typeof customerSchema

const obj = {
    name: 'test name',
    age: 12,
    email: 'example@gmail.com',
    items: [
        {
            price: 10,
            type: 'a',
        },
        {
            price: 21,
            type: 'b',
        },
    ],
}

const main = () => {
    // Parse synchronously, throws on error
    const personParsed = Schema.validateSync(personSchema)(obj)

    // Validate without throwing, returns Either
    const userParsed = Schema.validate(userSchema)(obj)
    const customerParsed = Schema.validate(customerSchema)(obj)

    console.group('EFFECT')
    console.log('person schema: ', personParsed)
    console.table(Either.left(userParsed))
    console.table(Either.left(customerParsed))
    console.groupEnd()
}

export default main
