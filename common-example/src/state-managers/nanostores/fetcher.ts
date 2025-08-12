import { nanoquery } from '@nanostores/query'

export const [createFetcherStore, createMutatorStore] = nanoquery({
	fetcher: (...keys) =>
		fetch(keys.join('')).then(r => {
			if (!r.ok) throw new Error(`HTTP error ${r.status}`)
			return r.json()
		}),
})
