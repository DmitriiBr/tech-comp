import { describe, expect, it } from 'vitest'
import { sum } from '../../src/utils/sum'

describe('sum', () => {
    it('Should sum 40 and 2, to get 42', () => {
        expect(sum(40, 2)).toBe(42)
    })
})
