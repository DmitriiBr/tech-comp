import { Box, Button } from '@mui/material'
import { atom, createCtx } from '@reatom/core'
import { reatomContext, useAtom } from '@reatom/npm-react'

const ctx = createCtx()

const counterAtom = atom(0)
const isZeroAtom = atom(ctx => ctx.spy(counterAtom) === 0)

const ReatomApp = () => {
	const [counter, setCounter] = useAtom(counterAtom)
	const [isZero] = useAtom(isZeroAtom)

	return (
		<Box>
			{counter}

			<Button onClick={() => setCounter(counter + 1)}>Increment</Button>
			<Button onClick={() => setCounter(counter - 1)}>Decrement</Button>

			{isZero ? 'It is zero' : null}
		</Box>
	)
}

export const App = () => {
	return (
		<reatomContext.Provider value={ctx}>
			<ReatomApp />
		</reatomContext.Provider>
	)
}

export default App
