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

## Examples

### Stateless components (variant 1)

```jsx
import { h, render } from 'preact'
import { statelessComponent } from 'preactive'

const HelloWorld = statelessComponent('HelloWorld', props => {
  return (
    <div>
      {props.salutation || 'Hello'}, {props.name || 'world'}
    </div>
  )
})
```

### Stateless components (variant 2)

```jsx
import { h, render } from 'preact'
import { statelessComponent } from 'preactive'

const HelloWorld = statelessComponent('HelloWorld', ({
  salutation = 'Hello',
  name = 'world'
}) => {
  return (
    <div>
      {props.salutation}, {props.name}
    </div>
  )
})
```
### Stateless components (variant 3)

```jsx
import { h, render } from 'preact'
import { statelessComponent } from 'preactive'

const HelloWorld = statelessComponent({
  displayName: 'HelloWorld',

  defaultProps: {
    salutation: 'Hello',
    name: 'world'
  }
}, props => {
  return (
    <div>
      {props.salutation}, {props.name}
    </div>
  )
})
```

### Stateless components (variant 4)

```jsx
import { h, render } from 'preact'
import { statelessComponent } from 'preactive'

const HelloWorld = statelessComponent({
  displayName: 'HelloWorld',

  defaultProps: {
    salutation: 'Hello',
    name: 'world'
  },

  render: renderHelloWorld
}

function renderHelloWorld(props) {
  return (
    <div>
      {props.salutation}, {props.name}
    </div>
  )
}
```

### Stateful components (variant 1)

```jsx
import { h, render } from 'preact'
import { statefulComponent, useValue } from 'preactive'

const Counter = statefulComponent('Counter', (c, props) => {
  const
    [count, setCount] = useValue(c, props.initialValue || 0),
    onIncrement = () => setCount(it => it + 1)

  return () =>
    <div>
      <label>{props.label || 'Counter'}: </label>
      <button onClick={onIncrement}>{count.value}</button>
    </div>
})

render(<Counter/>, document.getElementById('app'))
```

### Stateful components (variant 2)

```jsx
import { h, render } from 'preact'
import { statefulComponent, useValue } from 'preactive'

const Counter = statefulComponent({
  displayName: 'Counter',
  memoize: true,
  
  defaultProps: {
    initialValue: 0,
    label: 'Counter'
  }
}, (c, props) => {
  const
    [count, setCount] = useValue(c, props.initialValue),
    onIncrement = () => setCount(it => it + 1)

  return () =>
    <div>
      <label>{props.label}: </label>
      <button onClick={onIncrement}>{count.value}</button>
    </div>
})

render(<Counter/>, document.getElementById('app'))
```

### Stateful components (variant 3)

```jsx
import { h, render } from 'preact'
import { statefulComponent, useValue } from 'preactive'

const Counter = statefulComponent({
  displayName: 'Counter',
  memoize: true,
  
  defaultProps: {
    initialValue: 0,
    label: 'Counter'
  },

  init: initCounter
})

function initCounter(c, props) {
  const
    [count, setCount] = useValue(c, props.initialValue),
    onIncrement = () => setCount(it => it + 1)

  return () =>
    <div>
      <label>{props.label}: </label>
      <button onClick={onIncrement}>{count.value}</button>
    </div>
})

render(<Counter/>, document.getElementById('app'))
```

In the above examples the `c` is a so called component controller
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

### Component definition

- `statelessComponent(displayName, render: props => vnode)`
- `statelessComponent(meta, render: props => vnode)`
- `statelessComponent(config)`
- `statefulComponent(displayName, init: c => props => vnode)`
- `statefulComponent(meta, init: c => props => vnode)`
- `statefulComponent(config)`

### Utility functions

- `isMounted(c)`
- `forceUpdate(c)`
- `asRef(valueOrRef)`
- `toRef(getter)`

### Hooks

- `useValue(c, initialValue)`
- `useState(c, initialStateObject)`
- `useContext(c, context)`
- `useMemo(c, calculation, () => dependencies)`
- `useEffect(c, action, () => dependencies)`
- `useInterval(c, action, milliseconds)`

## Project state

This R&D project is still in a very early development state
