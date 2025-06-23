// src/api/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface User {
	id: number
	name: string
	// ... other fields
}

export interface Post {
	id: number
	userId: number
	title: string
	body: string
}

export const api = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://jsonplaceholder.typicode.com/',
	}),
	tagTypes: ['Posts'],
	endpoints: builder => ({
		getUser: builder.query<User, void>({
			query: () => `users/1`, // Example: always fetch user with id 1
		}),
		getPostsByUser: builder.query<Post[], number>({
			query: userId => `posts?userId=${userId}`,
			providesTags: ['Posts'],
		}),
		updatePost: builder.mutation<Post, Partial<Post> & Pick<Post, 'id'>>({
			query: ({ id, ...patch }) => ({
				url: `posts/${id}`,
				method: 'PATCH',
				body: patch,
			}),
			invalidatesTags: ['Posts'],
		}),
	}),
})

export const { useGetUserQuery, useGetPostsByUserQuery, useUpdatePostMutation } = api
