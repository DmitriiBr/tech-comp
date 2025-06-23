import { $user } from './userStore'
import { createFetcherStore } from './fetcher'

export interface Post {
	id: number
	userId: number
	title: string
	body: string
}

export const $posts = createFetcherStore<Post[]>([$user, 'postsByUserId'], {
	fetcher: async user => {
		const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`)
		const json = response.json()

		return json
	},
})
