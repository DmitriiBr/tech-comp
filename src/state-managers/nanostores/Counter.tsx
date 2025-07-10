import { atom, computed } from 'nanostores'
import { useStore } from '@nanostores/react'
import { Box, Button } from '@mui/material'

const $counter = atom<number>(0)

const increment = () => $counter.set($counter.get() + 1)
const decrement = () => $counter.set($counter.get() - 1)

const $isZero = computed($counter, value => value === 0)

const NanostoresApp = () => {
	const counter = useStore($counter)
	const isZero = useStore($isZero)

	return (
		<Box>
			{counter}

			<Button onClick={increment}>Increment</Button>
			<Button onClick={decrement}>Decrement</Button>

			{isZero ? 'It is zero' : null}
		</Box>
	)
}

export default NanostoresApp
