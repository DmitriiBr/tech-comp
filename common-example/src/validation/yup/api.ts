/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ObjectSchema } from 'valibot'
import {
    string,
    object,
    number,
    array,
    type InferType,
    mixed,
    ArraySchema,
    type AnyObject,
} from 'yup'

// shapes
type ItemType = 'a' | 'b' | 'c'

const personShape = {
    name: string(),
    age: number(),
    email: string().required().email(),
}

const userShape = {
    type: string<ItemType>().nullable(),
    price: number()
        .required()
        .when('type', {
            is: () => ...,
            then: schema => schema.min(1).max(10),
            otherwise: schema => schema.min(2).max(20),
        }),
}

const userFlatShape = {
    field: number(),
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

const userNestedShape = {
    items: array().when('age', {
        is: (age: number) => {
            console.log('Age: ', age)

            return age === 20
        },
        then: () => array().of(object(userShape).shape({ price: number().min(3).max(30) })),
        otherwise: () => array().of(object(userShape)),
    }),
}

// schemas, concat and strip
const personSchema = object().shape(personShape)
const userSchema = object().shape(userFlatShape)
const userNestedSchema = object().shape(userNestedShape)
const customerSchema = object()
    .shape(personShape)
    .shape(userFlatShape)
    .shape({ age: mixed().strip() })

// types
type PersonSchemaType = InferType<typeof personSchema>
type UserSchemaType = InferType<typeof userSchema>
type CustomerSchemaType = InferType<typeof customerSchema>

const obj = {
    name: 'test name',
    age: 20,
    email: 'example@gmail.com',
    items: [
        {
            price: 1,
            type: 'a',
        },
    ],
}

const main = () => {
    console.group('YUP')
    console.log('person schema: ', personSchema.cast(obj))
    console.log('user schema: ', userSchema.cast(obj))
    console.log('customer schema: ', customerSchema.cast(obj))
    console.groupEnd()
}

export default main
