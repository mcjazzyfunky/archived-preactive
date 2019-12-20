import { useState, useEffect, useRef } from 'preact/hooks'

export default function statefulComponent(displayName, init) {
  const preactComponent = props => {
    let mountedRef = useRef(false)

    const
      propsRef = useRef(props),
      [, setDummy] = useState(true) // used for update - see below
    
    propsRef.current = props

    const [render, notifiers] = useState(() => {
      const notifiers = {
        afterMount: createNotifier(),
        beforeUpdate: createNotifier(),
        afterUpdate: createNotifier(),
        beforeUnmount: createNotifier()
      }

      return [init({
        getProps: () => propsRef.current,
        isMounted: () => mountedRef.current,
        update: () => setDummy(it => !it),
        afterMount: notifiers.afterMount.subscribe,
        beforeUpdate: notifiers.beforeUpdate.subscribe,
        afterUpdate: notifiers.afterUpdate.subscribe,
        beforeUnmount: notifiers.beforeUnmount.subscribe
      }), notifiers]
    })[0]

    useEffect(() => {
      if (mountedRef.current) {
        notifiers.afterUpdate.notify()
      }
    })
    
    useEffect(() => {
      notifiers.afterMount.notify()
      mountedRef.current = true

      return notifiers.beforeUnmount.notify
    }, [])

    notifiers.beforeUpdate.notify()
    const content = render(props)

    return content
  }
  
  preactComponent.displayName = displayName

  return preactComponent
}

function createNotifier() {
  let
    subscriptions = [],
    isNotifying = false,
    changedWhileNotifying = false
    
  return {
    notify(value) {
      isNotifying = true

      try {
        subscriptions.forEach(subscription => {
          subscription && subscription[0](value)
        })
      } finally {
        isNotifying = false

        if (changedWhileNotifying) {
          changedWhileNotifying = false
          subscriptions = subscriptions.filter(it => it !== null)
        }
      }
    },

    subscribe(subscriber) {
      let listener = subscriber.bind(null)

      const unsubscribe = () => {
        if (listener !== null) {
          const index = subscriptions.findIndex(it => it && it[0] === listener)
          
          listener = null

          if (isNotifying) {
            subscriptions[index] = null
            changedWhileNotifying = true
          } else {
            subscriptions.splice(index, 1)
          }
        }
      }

      subscriptions.push([listener, unsubscribe])
      return unsubscribe
    },

    clear() {
      try {
        subscriptions.forEach(it => it && it[1]())
      } finally {
        subscriptions = []
      }
    }
  }
}
