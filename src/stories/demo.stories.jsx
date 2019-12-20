import { h } from 'preact'
import { statefulComponent } from '../public/preactive'
import { useProps, useValue, useState, useInterval } from '../public/preactive-hooks'
import { toRef } from '../public/preactive-utils'

export default {
  title: 'Demos'
}

export const counterDemo = () => <CounterDemo/>
export const intervalDemo = () => <IntervalDemo/>

// === Counter demo ==================================================

const counterDefaults = {
  initialValue: 0
}

const CounterDemo = statefulComponent('CounterDemo', c => {
  const
    props = useProps(c, counterDefaults),
    [count, setCount] = useValue(c, props.initialValue),
    onIncrement = () => setCount(it => it + 1),
    onInput = ev => setCount(ev.currentTarget.valueAsNumber)

  return () =>
    <div>
      <h3>Counter demo:</h3>
      <input type="number" value={count.value} onInput={onInput} />
      <button onClick={onIncrement}>{count.value}</button>
    </div>
})

// === Interval demo =================================================

const IntervalDemo = statefulComponent('IntervalDemo', c => {
  const
    [state, setState] = useState(c, {
      count: 0,
      delay: 1000
    }),

    onReset = () => setState('delay', 1000)

  useInterval(c, () => {
    setState('count', it => it + 1)
  }, toRef(() => state.delay))

  useInterval(c, () => {
    if (state.delay > 10) {
      setState('delay', it => it / 2)
    }
  }, 1000)

  return () =>
    <div>
      <h3>Interval demo:</h3>
      <div>Counter: {state.count}</div>
      <div>Delay: {state.delay}</div>
      <br/>
      <button onClick={onReset}>
        Reset delay
      </button>
    </div>
})
