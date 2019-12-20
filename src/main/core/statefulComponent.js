import { Component } from 'preact'

export default function statefulComponent(displayName, init) {
  class CustomComponent extends Component {
    constructor(props) {
      super(props)
      this.__mounted = false
      this.__afterMountNotifier = createNotifier(),
      this.__beforeUpdateNotifier = createNotifier(),
      this.__afterUpdateNotifier = createNotifier(),
      this.__beforeUnmountNotifier = createNotifier()
    
      this.__ctrl = {
        getProps: () => this.props,
        isMounted: () => this.__mounted,
        update: () => this.forceUpdate(),
        afterMount: this.__afterMountNotifier.subscribe,
        beforeUpdate: this.__beforeUpdateNotifier.subscribe,
        afterUpdate: this.__afterUpdateNotifier.subscribe,
        beforeUnmount: this.__beforeUnmountNotifier.subscribe
      }

      this.__render = init(this.__ctrl)
    }

    componentDidMount() {
      this.__afterMountNotifier.notify()
    }

    componentDidUpdate() {
      this.__afterUpdateNotifier.notify()
    }
    
    componentWillUnmount() {
      this.__beforeUnmountNotifier.notify()
    }

    render(props) {
      this.__beforeUpdateNotifier.notify()
      return this.__render(props)
    }
  }

  CustomComponent.displayName = displayName

  return CustomComponent
}

function createCtrlAndNotifiers(getProps, isMounted, forceUpdate) {
  const notifiers = {
    afterMount: createNotifier(),
    beforeUpdate: createNotifier(),
    afterUpdate: createNotifier(),
    beforeUnmount: createNotifier()
  }

  return [{
    getProps,
    isMounted,
    update: forceUpdate,
    afterMount: notifiers.afterMount.subscribe,
    beforeUpdate: notifiers.beforeUpdate.subscribe,
    afterUpdate: notifiers.afterUpdate.subscribe,
    beforeUnmount: notifiers.beforeUnmount.subscribe
  }, notifiers]
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
