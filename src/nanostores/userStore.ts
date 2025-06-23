import { createFetcherStore } from './fetcher'

export interface User {
	id: number
	name: string
	// other fields if needed
}

// Fetch user with fixed id=1
export const $user = createFetcherStore<User>(['https://jsonplaceholder.typicode.com/users/1'])
