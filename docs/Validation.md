# Validation

## Statistics

| Library     | GitHub Stars | NPM Weekly Downloads | NPM Size (min+gzip) | Speed / Performance Summary                                                                                                |
| ----------- | ------------ | -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Yup**     | ~22,000      | ~5,000,000           | ~12 KB              | Slower runtime validation; heavier bundle; good for forms but less performant overall                                      |
| **Zod**     | ~38,000      | ~31,000,000          | ~14.2 KB              | Mid-speed; well-optimized but slower than Valibot; good TS support                                                         |
| **Valibot** | ~7,000       | ~800,000             | ~1.4 KB             | Very fast runtime validation (~2x faster than Zod); extremely small bundle size; optimized for speed and minimal footprint |
| **Effect?**  | ~4,000       | ~120,000             | ~19 KB (effect-ts)  | Larger bundle; performance varies; less widely benchmarked but generally slower than Valibot                               |

## Cases

1. Default api. Required, number, string, nullable etc.
2. Dependent fields
3. Custom logic inside validation schema. Yup test, custom functions for transforming.
4. Typescript

## API Comparison

### Yup

#### Default api. Required, number, string, nullable etc.

```typescript
import { string, object, number, array, type InferType, mixed } from 'yup'

// shapes
type ItemType = 'a' | 'b' | 'c'

const personShape = {
    name: string(),
    age: number(),
    email: string().required().email(),
}

const userShape = {
    items: array().of(
        object({
            type: string<ItemType>().nullable(),
            price: number()
                .required()
                .when('type', {
                    is: 'a',
                    then: schema => schema.min(1).max(10),
                    otherwise: schema => schema.min(2).max(20),
                }),
        }),
    ),
}

// schemas, concat and strip
const personSchema = object().shape(personShape)
const userSchema = object().shape(userShape)
const customerSchema = object().shape(personShape).shape(userShape).shape({ age: mixed().strip() })

// types
type PersonSchemaType = InferType<typeof personSchema>
type UserSchemaType = InferType<typeof userSchema>
type CustomerSchemaType = InferType<typeof customerSchema>

const obj = {
    name: 'test name',
    age: 12,
    email: 'example@gmail.com',
    items: [
        {
            price: 1,
            type: 'a',
        },
    ],
}

const main = () => {
    console.log('person schema: ', personSchema.cast(obj))
    console.log('user schema: ', userSchema.cast(obj))
    console.log('customer schema: ', customerSchema.cast(obj))
}

export default main
```

#### Dependent fields

```typescript
const userShape = {
    type: string<ItemType>().nullable(),
    price: number()
        .required()
        .when('type', {
            is: 'a',
            then: schema => schema.min(1).max(10),
            otherwise: schema => schema.min(2).max(20),
        }),
}

const userNestedShape = {
    items: array().when('age', {
        is: (age: number) => {
            console.log('Age: ', age)

            return age === 20
        },
        then: () =>
            array().of(
                object(userShape).shape({
                    price: number().min(3).max(30),
                }),
            ),
        otherwise: () => array().of(object(userShape)),
    }),
}
```

#### Custom logic inside validation schema. Yup test, custom functions for transforming.

```typescript
let jimmySchema = string().test(
    'is-jimmy',
    '${path} is not Jimmy',
    (value, context) => value === 'jimmy',
)

await schema.isValid('jimmy') // => true
```

### Zod (Most popular)

First class typescript support
**Mental model** - typescript types, yup-like chaining but without schema mutations

#### Default api. Required, number, string, nullable etc.

```typescript
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
const userSchema = z.object(userShape)

// Merge schemas and strip `age`
const customerSchema = personSchema.merge(userSchema).omit({ age: true })

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

const main = () => {
    const personParsed = personSchema.parse(obj)
    const userParsed = userSchema.safeParse(obj)
    const customerParsed = customerSchema.safeParse(obj)

    console.group('ZOD')
    console.log('person schema: ', personParsed)
    console.table(userParsed.error?.issues)
    console.table(customerParsed.error?.issues)
    console.groupEnd()
}

export default main
```

#### Dependent fields

```typescript
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
```

#### Custom logic inside validation schema. Yup test, custom functions for transforming.

```typescript
z.object({...}).refine(val => val > 10)
```

### Valibot

Есть LLMs.txt для загрузки контекста в ИИ.

Mental model - Zod-like, but with modularity.

Pipe -> Schema -> Actions
`v.pipe(v.string(), v.trim(), v.toMinValue(20))`

#### Default api. Required, number, string, nullable etc.

```typescript
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

// Person schema without `age` (for customerSchema)
const personSchemaWithoutAge = object({
    name: optional(string()),
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
const customerSchema = intersect([personSchemaWithoutAge, userSchema])

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

const main = () => {
    const personParsed = parse(personSchema, obj)
    const userParsed = safeParse(userSchema, obj)
    const customerParsed = safeParse(customerSchema, obj)

    console.group('VALIBOT')
    console.log('person schema: ', personParsed)
    console.table(userParsed.issues)
    console.table(customerParsed.issues)
    console.groupEnd()
}

export default main
```

#### Dependent fields

```typescript
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
```

#### Custom logic inside validation schema. Yup test, custom functions for transforming.

```typescript
import { object, string, custom, pipe, parse, safeParse } from 'valibot'

// Example: Passwords must not contain the username
const UserSchema = object({
    username: string(),
    password: pipe(
        string(),
        custom((password, ctx) => {
            if (ctx.parent && password.includes(ctx.parent.username)) {
                return false
            }
            return true
        }, 'Password must not contain the username'),
    ),
})

// Example data
const data = {
    username: 'john',
    password: 'john1234',
}

// Throws on error
try {
    parse(UserSchema, data)
} catch (e) {
    console.error(e.issues)
}

// Or use safeParse for non-throwing validation
const result = safeParse(UserSchema, data)
console.log(result.success) // false
console.log(result.error?.issues)
```

### Effect

Не только про валидацию.

Можно назвать полноценным фреймворком для работы с данными и ошибками.
Если брать его, то нужно рассматнивать как основу для логикиприложении.
Основы функционального программирования (Пайп, монады, каррирование, функции высшего порядка)

#### Default api. Required, number, string, nullable etc.

```typescript

```

#### Dependent fields

```typescript

```

#### Custom logic inside validation schema. Yup test, custom functions for transforming.

```typescript

```

#### Casting, extraction

```typescript

```
