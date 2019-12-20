# preactive 

Just trying out some Preact addons...

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
import { useProps, useValue } from 'preactive/hooks'

const counterDefaults = {
  initialValue: 0,
  label: 'Counter'
}

const Counter = statefulComponent('Counter', c => {
  const
    props = useProps(c, counterDefaults),
    [count, setCount] = useValue(c, props.initialValue),
    onIncrement = () => setCount(it => it + 1),
    onInput = ev => setCount(ev.currentTarget.valueAsNumber)

  return () =>
    <div>
      <h3>{props.label}: </h3>
      <input type="number" value={count.value} onInput={onInput} />
      <button onClick={onIncrement}>{count.value}</button>
    </div>
})

render(<Counter/>, document.getElementById('app'))
```
