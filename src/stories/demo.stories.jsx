import { h, createContext } from 'preact'
import { statefulComponent } from '../public/preactive'
import { useContext, useProps, useValue, useState, useInterval } from '../public/preactive-hooks'
import { toRef } from '../public/preactive-utils'

export default {
  title: 'Demos'
}

export const counterDemo = () => <CounterDemo/>
export const intervalDemo = () => <IntervalDemo/>
export const contextDemo = () => <ContextDemo/>

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

// === Context demo ==================================================

const translations = {
  en: {
    salutation: 'Hello, ladies and gentlemen!'
  },
  de: {
    salutation: 'Hallo, meine Damen und Herren!'
  },
  fr: {
    salutation: 'Salut, Mesdames, Messieurs!'
  }
}

const LocaleCtx = createContext('en')

const ContextDemo = statefulComponent('ContextDemo', c => {
  const
    [locale, setLocale] = useValue(c, 'en'),
    onLocaleChange = ev => setLocale(ev.target.value)

  return () => (
    <LocaleCtx.Provider value={locale.value}>
      <div>
        <label htmlFor="lang-selector">Select language: </label>
        <select id="lang-selector" value={locale.value} onChange={onLocaleChange}>
          <option value="en">en</option>
          <option value="fr">fr</option>
          <option value="de">de</option>
        </select>
        <LocaleText id="salutation"/>
      </div>
    </LocaleCtx.Provider>
  )
})

const LocaleText = statefulComponent('LocaleText', c => {
  const
    locale = useContext(c, LocaleCtx),
    props = useProps(c)

  return () => (
    <p>
      { translations[locale.value][props.id] }
    </p>
  )
})
