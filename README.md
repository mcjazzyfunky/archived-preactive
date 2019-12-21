# Preactive 

A R&D project to evaluate an alternative API for developing
components and hook functions with Preact.<br>
The main advantages of the new API are:

- 0% magic
- Does not make any trouble for the garbage collector
- No rules of hooks
- No special linter necessary
- 100% accurately typeable - in the function type signature
  of hook functions or function that generate hook functions etc.,
  it will always be visible what we are dealing with.

### Installation

```
git clone https://github.com/mcjazzyfunky/preactive.git
cd preactive
npm install
```

### Running demos

```
npm run storybook
```

## Example

```jsx
import { h, render } from 'preact'
import { statefulComponent } from 'preactive'
import { useValue } from 'preactive/hooks'

const Counter = statefulComponent('Counter', (c, props) => {
  const
    [count, setCount] = useValue(c, props.initialValue || 0),
    onIncrement = () => setCount(it => it + 1),
    onInput = ev => setCount(ev.currentTarget.valueAsNumber)

  return () =>
    <div>
      <label>{props.label || 'Counter'}: </label>
      <input type="number" value={count.value} onInput={onInput} />
      <button onClick={onIncrement}>{count.value}</button>
    </div>
})

render(<Counter/>, document.getElementById('app'))
```

### Alternative syntax

```jsx
import { h, render } from 'preact'
import { statefulComponent } from 'preactive'
import { useValue } from 'preactive/hooks'

const Counter = statefulComponent({
  displayName: 'Counter',
  
  defaultProps: {
    initialValue: 0,
    label: 'Counter'
  }
}, (c, props) => {
  const
    [count, setCount] = useValue(c, props.initialValue),
    onIncrement = () => setCount(it => it + 1),
    onInput = ev => setCount(ev.currentTarget.valueAsNumber)

  return () =>
    <div>
      <label>{props.label}: </label>
      <input type="number" value={count.value} onInput={onInput} />
      <button onClick={onIncrement}>{count.value}</button>
    </div>
})

render(<Counter/>, document.getElementById('app'))
```

In the above example the `c` is a so called component controller
(some kind of representation for the component instance).
The type of the component controller is currently the following
(please be aware that "normal" developers will never have to use these
methods directly they will only be used internally by some basic
hook and utility functions):

```typescript
type Ctrl = {
  isMounted(): boolean,
  update(): void,
  getContextValue<T>(Context<T>): T,
  afterMount(subscriber: Subscriber): void,
  beforeUpdate(subscriber: Subscriber): void,
  afterUpdate(subscriber: Subscriber): void,
  beforeUnmount(subscriber: Subscriber): void,
  runOnceBeforeUpdate(task: Task): void
}

type Props = Record<string, any>
type Subscriber = () => void
type Task = () => void
type Context<T> = Preact.Context<T>
```

## API

### *Package 'preactive'*

- `statelessComponent(displayName, render: props => vnode)`
- `statefulComponent(displayName, init: c => props => vnode)`

### *Package 'preactive/utils'*

- `getProps(c, defaultProps?)`
- `isMounted(c)`
- `forceUpdate(c)`
- `asRef(valueOrRef)`
- `toRef(getter)`

### *Package 'preactive/hooks'*

- `useValue(c, initialValue)`
- `useState(c, initialStateObject)`
- `useContext(c, context)`
- `useMemo(c, calculation, () => dependencies)`
- `useEffect(c, action, () => dependencies)`
- `useInterval(c, action, milliseconds)`

## Project status

This R&D project is still in a very early development state
