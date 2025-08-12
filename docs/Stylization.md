# React Component Styling Methods

















## Types

1. Runtime
2. Compile-time. Static extraction
3. Atomic CSS (Tailwind, Unocss)
































## Чем будет полезен обзор

1. Посмотреть на целевой подход для MUI 6.x. Это может затронуть текущий шаблон alba,
тк в нём используется MUI 7 с runtime @emotion/styles

2. Посмотреть на будущее v-uik от Сбера

3. В целом ознакомиться с различиями двух подходов

4. Подумать над переходом alba с emotion, на pigment-css. Сейчас alba-front-template на комбинации
emotion и mui v7























## Styled Components (Runtime)

**Styled Components** is a popular CSS-in-JS library that uses tagged template literals
to style components. It allows writing CSS directly in JavaScript.

```jsx
import styled from 'styled-components'

const Button = styled.button`
    background-color: #3498db;
    color: ${props => props.color};
    padding: 10px 20px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #2980b9;
    }
`

const App = () => {
    return <Button color="white">Click me</Button>
}
```

**Pros:**

- Scoped styling prevents conflicts
- Dynamic styling based on props
- Supports theming
- Full CSS feature support including pseudo-classes

**Cons:**

- Learning curve for template literals
- Runtime performance considerations
- Larger bundle size
















## Emotion (Runtime)

**Emotion** is another CSS-in-JS library that provides both styled components
and CSS prop approaches. It offers flexibility in how you write styles.

```jsx
import { css } from '@emotion/react'

const divStyle = (padding) => css`
    margin: 10px;
    padding: ${paadding};
    background-color: #eee;
`

function App() {
    return <div className={divStyle('10px')}>This is styled with Emotion!</div>
}
```

**Pros:**

- Framework agnostic[14]
- Supports both object and string styles[14]
- Excellent performance[14]
- Great developer experience[14]

**Cons:**

- Requires setup and configuration[13]
- Additional dependency[13]



















## JSS (Runtime)

**JSS** allows writing CSS styles as JavaScript objects.
It provides dynamic styling capabilities with JavaScript expressions.

```jsx
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: (props) => props.color,
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',

        '&:hover': {
            backgroundColor: '#0056b3',
        },
    },
})

const Button = () => {
    const classes = useStyles({
        color: 'white'
    })

    return <button className={classes.button}>Click me</button>
}
```

**Pros:**

- Dynamic styling with JavaScript
- Improved theming capabilities
- Scoped styles prevent conflicts
- Framework agnostic

**Cons:**

- Learning curve for JSS syntax
- Runtime performance considerations
- Additional dependency













## Compile time Statistics

| Library             | GitHub Stars | Weekly NPM Downloads                             |
| ------------------- | ------------ | ------------------------------------------------ |
| **Vanilla Extract** | ~9,740       | ~272,921 (Sprinkles), ~172,794 (Recipes)         |
| **Pigment CSS**     | ~1000        | ~18,407[@pigment-css/react]                      |
| **Stylex**          | ~8.700       | ~3,139 (vite-plugin-stylex)                      |
| **linaria**         | ~12,100      | ~4,652 (main), ~182,696 (utils), ~4,465 (rollup) |

> **Note:**
>
> - Vanilla Extract’s ecosystem includes several packages (e.g., `@vanilla-extract/sprinkles`, `@vanilla-extract/recipes`), both with high download counts.
> - Pigment CSS is newer and mainly used via `@pigment-css/react`.
> - Stylex is developed by Meta and is gaining adoption but is not as widely starred or downloaded as others.
> - Linaria’s main package has strong GitHub presence and a healthy number of downloads.















## Pigment CSS (MUI 6,7v + default) (Compile time)

**before:**

```jsx
const FlashCode = styled('div')(
    ({ theme, startLine = 0, endLine = startLine, lineHeight = '0.75rem' }) => ({
        top: `calc(${lineHeight} * 1.5 * ${startLine})`,
        height: `calc(${lineHeight} * 1.5 * ${endLine - startLine + 1})`,
        margin: theme.spacing(4),
        ...theme.typography.caption,
    }),
)

// <FlshCode startLine={1} {...props} />

export default FlashCode
```

**after:**

```jsx
const FlashCodeRoot = styled('div')(({ theme }) => ({
    top: `calc(var(${customVar}) * 1.5 * var(--Flashcode-startLine))`,
    height: `calc(var(--Flashcode-lineHeight) * 1.5 * (var(--Flashcode-endLine) - var(--Flashcode-startLine) + 1))`,
    margin: theme.vars.marginMd, // --123asxkey-theme-vars-marginMD
    ...theme.typography.caption,
}))

const FlashCode = forwardRef((props, ref) => {
    const { children, startLine = 0, endLine = startLine, lineHeight = '0.75rem', ...other } = props

    return (
        <FlashCodeRoot
            ref={ref}
            {...other}
            style={{
                [customVar]: lineHeight,
                '--Flashcode-startLine': startLine,
                '--Flashcode-endLine': endLine,
                ...other.style,
            }}
        >
            {children}
        </FlashCodeRoot>
    )
})

export default FlashCode
```

**Pros:**

- MUI new default method
- Compile time, so it is faster

**Cons:**

- More verbose
- Another paradigm. Now you cannot inject js inside css inline














## Vanilla extract (compile time)

**before:**

```typescript
// Component.ts
const useStyles = createUseStyles(theme => ({
    someClass: {
        padding: theme.spacing(4),

        color: theme.palette.red,

        background: ({ isRed }) => isRed : 'red' : 'blue'
    },
}))

const Comp = () => {
    const [isRed, setIsRed] = useState(false)
    const classes = useStyles({ isRed })

    //...
}
```

**after:**

```css
:root {
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
}
```

```tsx
// theme.css.ts
const [_themeClass, theme] = createTheme({
    vars: {
        spacing: {
            xs: '4px',
            sm: '8px',
            md: '12px',
        },
        palette: {
            red: '#ff00ff',
        },
    },
})

// Component.ts
import { theme, scopedVar } from './theme.css.ts'

const className = style({
    padding: theme.vars.spacing.md, // 12px, NOT theme.spacing(x)
    color: theme.vars.palette.red,
    margin: RED
})
const redClassName = style({ backGroundColor: 'red' })
const blueClassName = style({ backGroundColor: 'blue' })

const Comp = () => {
    const [isRed, setIsRed] = useState(false)

    // clsx, claassnames - utility functions for classNames
    const resultClassName = clsx(className, {
        [blueClassName]: !isRed,
        [redClassName]: isRed,
    })

    return <div className={resultClassName} />
}
```

```jsx
import { style, createVar } from '@vanilla-extract/css'

export const scopedVar = createVar()
export const RED = '12px'

export const className = style({
    display: 'flex',
    vars: {
        [scopedVar]: 'green',
        '--global-variable': 'purple',
    },
    ':hover': {
        color: 'red',
    },
    selectors: {
        '&:nth-child(2n)': {
            background: '#fafafa',
        },
    },
    '@media': {
        'screen and (min-width: 768px)': {
            padding: 10,
        },
    },
    '@supports': {
        '(display: grid)': {
            display: 'grid',
        },
    },
})
```

**Pros:**

- Compile time
- Typescript safety

**Cons:**

- Like in Pigment, css is static

## StyleX

```jsx
import * as React from 'react'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({...})
const colorStyles = stylex.create({...})

function ReactDiv({ color, isActive, style }) {
    return (
        <div
            {...stylex.props(
                styles.main,
                // apply styles conditionally
                isActive && styles.active,
                // choose a style variant based on a prop
                colorStyles[color],
                // styles passed as props
                style,
            )}
        />
    )
}
```











## Linaria

```tsx
import { styled } from '@linaria/react'
import { families, sizes } from './fonts'

// Write your styles in `styled` tag
const Title = styled.h1`
    font-family: ${families.serif};
`

const Container = styled.div`
    font-size: ${sizes.medium}px;
    color: ${props => props.color};
    border: 1px solid red;

    &:hover {
        border-color: blue;
    }

    ${Title} {
        margin-bottom: 24px;
    }
`

// Then use the resulting component
;<Container color="#333">
    <Title>Hello world</Title>
</Container>
```

**Pros**

- Compile time
- Can use something like dynamic variables inside styles

**Cons**

- Only babel
- Magic behind dynamic props in react bindings
























## Tailwind

```tsx
import React from 'react'

function Button({ children }) {
    return (
        <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
            {children}
        </button>
    )
}

function App() {
    return (
        <div className="flex justify-center items-center h-screen">
            <Button>Click Me</Button>
        </div>
    )
}

export default App
```

**Pros**

- No need of creating own classes
- Compile time

**Cons**

- Classes

## Tailwind CSS (Compile time)

**Tailwind CSS** is a utility-first CSS framework that provides low-level
utility classes. It enables rapid UI development without writing custom CSS.

```jsx
const Button = () => {
    return (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Click Me
        </button>
    )
}
```

**Pros:**

- Utility-first approach for rapid development
- Highly customizable
- No need to write custom CSS
- Built-in responsive design

**Cons:**

- Large number of utility classes to learn
- HTML can become verbose
- Requires purging unused CSS in production

## Sass/SCSS (Compile time)

**Sass/SCSS** is a CSS preprocessor that extends CSS with variables, nested rules, mixins,
and functions. It compiles to regular CSS.

```css
// Button.module.scss
.button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    font-size: 1rem;
    cursor: pointer;

    &:hover {
        background-color: darken(#007bff, 10%);
    }
}
```

```jsx
import styles from './Button.module.scss'

const Button = () => {
    return <button className={styles.button}>Click me;</button>
}
```

**Pros:**

- Enhanced CSS with variables and mixins
- Nested rules improve readability
- Better maintainability for large projects
- Works with CSS Modules

**Cons:**

- Requires compilation step
- Learning curve for Sass features
- Additional build configuration
