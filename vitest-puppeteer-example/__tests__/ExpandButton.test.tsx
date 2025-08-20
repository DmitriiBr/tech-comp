import { fireEvent, render } from '@testing-library/react'
import { ExpandButton } from '../src/ExpandButton'
import { expect, it, describe } from 'vitest'

describe('ExpandButton', () => {
    it('Should render collapsed button text on initial render, and after clicking on button, render expanded text', () => {
        const collapsedText = 'collapsed'
        const expandedText = 'expanded'

        const { getByText, getByRole, queryByText } = render(
            <ExpandButton collapsedText={collapsedText} expandedText={expandedText} />,
        )

        expect(getByText(collapsedText)).toBeInTheDocument()

        fireEvent.click(getByRole('button'))

        expect(getByText(expandedText)).toBeInTheDocument()
        expect(queryByText(collapsedText)).not.toBeInTheDocument()
    })

    it('Should render title and text, when expanded', () => {
        const title = 'Title'
        const text = 'Text'

        const { getByText } = render(
            <ExpandButton
                collapsedText="collapsed"
                expandedText="expanded"
                title={title}
                text={text}
            />,
        )

        fireEvent.click(getByText('collapsed'))

        expect(getByText(title)).toBeInTheDocument()
        expect(getByText(text)).toBeInTheDocument()
    })
})
