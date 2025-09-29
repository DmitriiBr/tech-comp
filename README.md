# Фронтовый тех-радар

## Описание

Статья - результат цикла встреч, где обсуждались и выбирались технологий для использования в фронтенд приложении. Она содержит набор выводов и рекомендаций по тому или иному аспекту разработки. В конце сопоставляется старый и новый стек, делается вывод, на основе которого можно принять решение о переходе на другие решения.

Оригинал сравнений и все примеры кода расположены в репозитории: https://github.com/DmitriiBr/tech-comp

## Управление состоянием

_Как ни странно, здесь всё очень не просто._
Сравниваются библиотеки по параметрам:

**Config-first** подход к описанию логики работы с состоянием - это подход, когда для реализации большего числа задач достаточно описать статические параметры или прокинуть колбеки в те же самые параметры. Как пример, apiSlice из RTK Query:

```typescript
export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://jsonplaceholder.typicode.com/',
    }),
    tagTypes: ['Posts'],
    endpoints: builder => ({
        getPostsByUser: builder.query<Post[], number>({
            query: userId => `posts?userId=${userId}`,
            providesTags: ['Posts'],
        }),
    }),
})
```

Всё, что мы видим на примере, по сути просто описание и минимум логики. То есть, разработчики библиотеки дают определенный объект с заданными параметрами, где каждый параметр отвечает за что-то свое, а пользователь просто задает в эти параметры свои собственные значения, и вся "магия" происходит под капотом библиотеки.
Такой подход является строгим и позволяет сделать только то, что задумано конфигом. Это позволяет писать более стандартизируемый код, но менее гибкий.

**Logic-first** подход - это противоположный подход, когда разработчики библиотеки предоставляют определенный набор "атомарных" сущностей, манипулируя которыми можно описывать логику. Напрример:

```typescript
// state management
const counter = atom(0)
const increment = () => counter.set(counter() + 1)
const decrement = () => counter.set(counter() - 1)

// API example
export const listResource = computed(async () => {
    const response = await wrap(fetch('https://jsonplaceholder.typicode.com/posts'))
    const data: Post[] = await wrap(response.json())

    return data
}, 'listResource').extend(withAsyncData({ initState: [] }))
```

Здесь отсутствует какой-либо конфиг, используются атомарные методы `atom`, `computed`. А остальное - это привычная логика. Получается, что такой подход является более декларативным и более гибким, но теряет в строгости.

1. Размер библиотеки;
2. Удобство АПИ;
3. Гибкость АПИ:
4. Популярность:
5. Документация;

### Redux Toolkit

Текущее и самое используемое решение для управления состоянием - это **Redux Toolkit**, а вместе с ник и кеш-менеджер **RTK Query**.
И Redux и RTK Query использует config-first подход для создания и организации составных частей логики. Это значит, что для создания слайса (или АПИ слайса) разработчик заполняет заполняет части одного большого конфига, с небольшими вставками логики в некоторые параметры.

1. Размер библиотеки - 6.84 MB;
2. Удобство АПИ - Очень много бойлерплейта;
3. Гибкость АПИ - **config-first**, поэтому для экзотических кейсов, буду экзотеческие решения;
4. Популярность - Сейчас начинает немного уступать Tanstack Query. _3,700,972 weekly downloads_;
5. Документация - очень много, по RTK она не сильно уступает Tanstack;

Когда стоит брать? Так как это самое популярное решение, то в любой непонятной ситуации.

### Tanstack Query

Второе в индустрии по популярности решение. Однако, в отличие от Redux Toolkit в себе содержит только кеш-менеджмент. Это значит, что манипулировать будет возможно только данными запросов и для решения проблем глобального состояния придется использовать либо стороннюю библиотеку, либо React Context.

Так же представляет собой **config-first** подход, но с описанием параметров в хуке, а не с отдельном файле для АПИ.

```typescript
// RTK
export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://jsonplaceholder.typicode.com/',
    }),
    tagTypes: ['Posts'],
    endpoints: builder => ({
        getPostsByUser: builder.query<Post[], number>({
            query: userId => `posts?userId=${userId}`,
            providesTags: ['Posts'],
        }),
    }),
})

// Tanstack Query
const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorObj,
} = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => {
        const { data } = await axios.get(
            `https://jsonplaceholder.typicode.com/posts?userId=${user.id}`,
        )
        return data
    },
    enabled: !!user,
})
```

На примере видно, что теперь конфиг - это параметры хука, а не АПИ слайса.

1. Размер библиотеки - 732 kB;
2. Удобство АПИ - Нужно придумывать свою организация множества эндпоинтов. Однако АПИ более минималистичное, чем в RTK;
3. Гибкость АПИ - Так как конфиг прокидывается сразу в хук, а не лежит в отдельном файле, гибкости больше, чем у RTK. Но всё равно, теряет в ней из-за **config-first** подхода;
4. Популярность - Обгоняет RTK по популярности. _ weekly downloads_;
5. Документация - очень много и она очень качественная.

Когда стоит брать? Если приложение представляет собой **классическое SPA**. То есть, в нем будет много запросов, а логика будет на сервере и на фронте не требуется реализовывать сложные кейсы по управлению состоянием, тк в Tanstack Query только кеш.

### Nanostores, Nanostores query

Nanostores является изначально стейт-менеджером, а управление кешом идет от дополнительной библиотеки Nanostores Query.
Представляет собой **logic-first** подход к управлению состоянием. То есть, как в примере выше, всё описыватеся декларативно и вне компонента.

```typescript
const $counter = atom<number>(0)

const increment = () => $counter.set($counter.get() + 1)
const decrement = () => $counter.set($counter.get() - 1)

const $isZero = computed($counter, value => value === 0)

const Comp = () => {
    const counter = useStore($counter)
    const isZero = useStore($isZero)

    //..
}
```

1. Размер библиотеки - 47.5 kB + 67 kB;
2. Удобство АПИ - Атомарный подход, описание стейта получается очень лакончиным и понятным. Его можноь и нужно выносить вне компонентов;
3. Гибкость АПИ - Нет привязанности к конфигу, поэтому гибкость безгранична. Однако, как общий минус **logic-first**, придется придумать свои стандарты и свой код-стайл, чтобы держать всё в одинковом виде;
4. Популярность - Не популярное решение, как и сам подход к вынесению логики из компонентов _84,014 weekly downloads_;
5. Документация - ее очень мало, это самый большой минус

Когда стоит брать? Отдельно, с использованием nanostores/query только если есть желание попробовать что-то новое, иногда тратить время на исследования решений. Хорошо подходит для приложений с большим количеством логики (например offline-first), где весь стейт будет вынесен за компоненты. Так же, хороший вариант для дополнительного стейт менеджера в связку к Tanstack Query.

### Reatom

Так же как и nanostores пропагандирует **logic-first** подход к управлению состоянием. Однако, яляется более полноценным решением. Например, позволяет управлять не только пользовательским стейтом, но и кешем, формами, предоставляет различные хелперы для базовых сценарием, например для синхронизации URL и стейтс или роутинга.

```tsx
// v1000
const counter = atom(0)
const increment = () => counter.set(counter() + 1)
const decrement = () => counter.set(counter() - 1)

const Cmop = reactomComponent(() => (
    <div>
        {counter()}
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
    </div>
))
```

1. Размер библиотеки - 137 kB;
2. Удобство АПИ - Самое удобное среди рассматриваемых, идея с `reatomComponent` - то, что позволяет сделать **logic-first** решение более стандартизированным. Работа с кешем гораздо удобнее чем в nanostores;
3. Гибкость АПИ - Можно сделать буквально что-угодно, впрочем как и в nanostores;
4. Популярность - На удивление, еще менее популярен чем nanostores. _~3000 weekly downloads_;
5. Документация - Для 3ей версии она достойная, для v1000 пока набирает обороты. Но в разы лучше чем в nanostores;

Когда стоит брать? Решение в себе содержит массу возможностей сделать что угодно очень красивым и лаконичным способом. Решения явно более полное, чем nanostores, идея с `reatomComponent` позволяет лучше представить, как вся логика по работе со стейтом будет вынесена вне компонентов. Поэтому, если сравнивать с **nanostores** в качестве единственного решения для стейт и кеш менеджмента, то тут однозначно побеждает **reatom**. Если только как стейт-менеджер к Tanstack, то смысла мало, тк большая часть функционала будет утеряна.

## Формы

С библиотеками форм - выбор не очень большой. Существует 2 хороших и популярных решения:

1. React hook form;
2. Tanstack form;

При сравнении показалось, что единственным отличием является интерфейс взаимодествия с АПИ библиотеки.
В react-hook-form - подход, основанный по большей части на хуках. А в tanstack-form - на компонентах.

Пример:

```tsx
// react-hook-form
const Input = ({ name }) => {
    const { field, fieldState } = useController({
        name,
    })

    return (
        <TextField
            {...field}
            label="ID"
            fullWidth
            error={fieldState.invalid}
            helperText={fieldState.error?.message}
        />
    )
}

// tanstack form
const Input = () => {
    return (
        <Field name="subType">
            {({ input, meta }) => (
                <TextField
                    {...input}
                    select
                    label="SubType"
                    fullWidth
                    disabled={!values.type}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                >
                    {subTypeOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </TextField>
            )}
        </Field>
    )
}
```

Быстрое сравнение разных библиотек форм есть на официальном сайте Tansktack: https://tanstack.com/form/latest/docs/comparison

### React hook form

На данный момент лучшее решение, по нашему мнению. Из минусов только отсутствие поддержки SSR.

1. Удобный интерфейс;
2. Гибкая настройка;
3. Оптимизация;

### Tanstack form

Уступает react-hook-form по удобству и популярности. Единственный плюсь - поддержка SSR.

1. Гибкая настройка;
2. Поддержка SSR;

## Валидация

В сравнении учавствовали 3 библиотеки:

1. Yup - текущее решение;
2. Zod - самое популярное, почти стандарт индустрии;
3. Valibot - самая минималистичная библиотека валидации;

### Yup

В новый проект не стоит брать никогда, по причинам:

1. Оптимизация. По сравнению с 2мя другими вариантами - медленнее;
2. Поддержка typescript. Хуже, так как изначально библиотека разрабатывалась без него;
3. Возможность "мутации" схем валидации. То есть, при любое условие в схеме происходи НЕ через описание кейсов схемы, а через мутацию её самой. См. пример ниже.

```typescript
// shema mutation
const a = string()
    .min(10)
    .required()
    .when({
        is: val => val === 'STR',
        then: schema => schema.min(20),
        otherwise: () => number().min(10),
    })

a // -> type ??
```

### Zod

Наш выбор остановился на Zod.
Стоит брать всегда в новый проект, хотя бы потому, что это самое популярное ршение и поддерживается множеством сторонних библиотек из коробки.

**Плюсы:**

1. Typescript first;
2. Популярность, очень и очень много примеров;
3. Скорость по сравнению с yup;

Пример такой же `yup` схемы, но на Zod:

```typescript
const a = z.union([z.string(), z.number()]).refine(val => {
    if (typeof val === 'string') {
        if (val === 'STR') {
            return val.length >= 20
        }
        return val.length >= 10
    } else if (typeof val === 'number') {
        return val >= 10
    }
    return false
})

a // -> type is string | number, because of union
```

### Valibot

Минималистичная библиотека, по философии схожая с Zod. Отличается только размером и подходом к составлению схем.

```typescript
// Zod
import z from 'zod'

const a = z.string().max(10)
const b = z.number().min(20)

// Valibot

import { string, pipe, maxLength, minValue } from 'valibot'

const a = pipe(string(), maxLength(10))
const b = pipe(number(), minValue(20))
```

То есть, АПИ не "вырастает" из единого источника как в Zod или Yup. Вместо этого библиотека предоставляет атомарные обработчики (они называются action'ами), которые пользователь может по своему желению соединить и получить схемы для вылидации.

Плюсы:

1. Typescript first;
2. Скорость по сравнению с yup;

Однако, из-за непривычности АПИ и меньшей популярности, выбор остановился на Zod.

## Стилизация

Данный раздел является просто информационным, без конкретного выбора.

Есть большое разнообразие библиотек для стилизиции, к которым относятся:

1. UI киты;
2. Библиотеки для изоляции стилей;
3. Atomic CSS подходы (Tailwind, atomic css);

Однако, несмотря на разнообразие, все они об одном - стилизация, и какой бы UI кит разработчик ни взял, какой бы подход к стилизации не выбрал, каждый будет представлять из себя либо компоненты с пропсами для кастомизации, либо АПИ для вынесения стилей из компонента. Если наложить на это особенности каждого отедльно взятого проекта, то выбор решения становится почти бессмысленным.
Поэтому, в цикле тех-радара стилизация рассмытривалась с теоретической точки зрения на примере двух подходов: **Runtime** и **Compiletime**.

### Runtime

Стилизация применяется динамически в процессе исполнения страницы браузером. Например, CSS-стили загружаются и применяются непосредственно перед отображением элементов на экране.
Это позволяет гибко менять стили компонентов в зависимости от условий. Такой подход позволяет воспринимать CSS как часть логики приложения и менять его "на лету" когда захочешь, но увеличивается бандл и замедляет работу приложения.

### Compiletime

Стилизация заранее компилируется в статический код (например `index.css`), который затем используется при рендеринге страницы.
Такой подход является более оптимальным, ускоряет загрузку интерфейсов и снижает нагрузку на браузер, так как готовое оформление загружается сразу вместе с HTML-кодом.

### Список ссылок на полезные статьи с сравнениями

- Сравнение compile-time и runtime подходов
  https://dev.to/hamed-fatehi/css-in-js-comparing-compile-time-and-runtime-approaches-51bn

- Сравнение лучших `zero-runtime CSS-in-JS` библиотек
  https://blog.logrocket.com/comparing-top-zero-runtime-css-js-libraries/

- CSS vs. CSS-in-JS сравнение производительности  
  https://pustelto.com/blog/css-vs-css-in-js-perf/

## Тестирование

В рамках темы тестирования рассмытривались библиотеки:

1. Unit тестирование

1.1. Jest
1.2. Vitest

2. E2E тестирование

2.1. Cypress
2.2. Playwright

### Unit тестирование

Тут всё довольно просто:

1. Vitest быстрее;
2. Vitest новее;
3. Vitest достаточно популярен, чтобы поддерживать нужные плагины и дополнения;

В остальном, Vitest обратно совместим с Jest с точки зрения АПИ:

```typescript
// Jest and Vitest are the same
describe('test', () => {
    it('Should be correct', () => {
        expect(treu).toBe(false)
    })
})
```

Вывод, если есть возможность выбирать, то можно и нужно брыть Vitest как решение для Unit тестирования.
Несполько статей подробным сравнением:

- Vitest vs Jest | Better Stack Community  
  https://betterstack.com/community/guides/scaling-nodejs/vitest-vs-jest/

- Vitest: Переход на Vitest с Jest - Semaphore CI  
  https://semaphore.io/blog/vitest

- Почему Vite может быть лучше для ваших JevaScript проектов (Divotion)  
  https://www.divotion.com/blog/why-vitest-might-be-better-than-jest-for-your-javascript-projects

- Vitest vs Jest - (Очень наглядное сравнение с точки зрения фич)
  https://www.speakeasy.com/blog/vitest-vs-jest

### E2E тестирование

Тут немного сложнее. Сравнивались два решения: **Cypress** и **Playwright**. Они оба обладают похожим функционалом, UI режим, Headless (без UI) режим, но, как обычно, есть решающие нюанса, которые в конечном итоге влияют на выбор.

1. Playwright умеет в параллельный запуск (без подписки), в отличии от Cypress. А для долгих E2E это довольно важно;
2. У Playwright АПИ (См. ниже примеры) очень похоже на Jest\Vitest. У Cypress АПИ слишком "нестандартное";
3. У Cypress даже при первичном рассмотрении прослеживается разграничение на платный\бесплатный вариант использования;
4. Playwright поддерживает все браузеры, Cypress только Chromium и Firefox;

Учитывая всё это, выбор остановился на **Playwright**.

**Примеры АПИ:**

```typescript
// Cypress
describe('template spec', () => {
    it('Should show loader, and then remove it after response is ready ', () => {
        cy.contains('Posts List').should('exist')
        cy.get('[role="progressbar"]').should('exist')

        // Request is ready here
        cy.get('[role="progressbar"]').should('not.exist')
    })
})

// Playwright
test('Should show loader, and then remove it after response is ready', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await expect(page.getByRole('progressbar')).toBeInViewport()
    await page.getByRole('progressbar').waitFor({ state: 'hidden' })
    await expect(page.getByRole('progressbar')).not.toBeInViewport()
})
```

Полезные статьи, по аналогии с Jest\Vitest:

- Playwright vs Cypress: Ключевые отличия (LambdaTest)  
  https://www.lambdatest.com/blog/cypress-vs-playwright/

- Cypress vs Playwright - Общее сравнение на 2025 (BugBug.io)  
  https://bugbug.io/blog/test-automation-tools/cypress-vs-playwright/

- Playwright vs Cypress: Основные отличия на 2025 (Katalon)  
  https://katalon.com/resources-center/blog/playwright-vs-cypress

- Playwright vs. Cypress - сравнение E2E фреймворков (Gorzelinski)  
  https://gorzelinski.com/blog/playwright-vs-cypress-comparison-of-e2e-testing-frameworks/

## Реализация микрофронтов
