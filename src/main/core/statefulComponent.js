import { Component, options } from 'preact'

// Brrrr, this is horrible as hell - please fix asap!!!!
const
  isMinimized = Component.name !== 'Component',
  keyContextId = isMinimized ? '__c' : '_id',
  keyContextDefaultValue = isMinimized ? '__' : '_defaultValue'

export default function statefulComponent(displayName, init) {
  class CustomComponent extends Component {
    constructor(props) {
      super(props)
      
      let mounted = false

      const
        afterMountNotifier = createNotifier(),
        beforeUpdateNotifier = createNotifier(),
        afterUpdateNotifier = createNotifier(),
        beforeUnmountNotifier = createNotifier(),

        ctrl = {
          getProps: () => this.props,
          isMounted: () => mounted,
          update: () => this.forceUpdate(),

          getContextValue: ctx => {
            const provider = this.context[ctx[keyContextId]]
            const ret = !provider ? ctx[keyContextDefaultValue]: provider.props.value
            return ret
          },
          afterMount: afterMountNotifier.subscribe,
          beforeUpdate: beforeUpdateNotifier.subscribe,
          afterUpdate: afterUpdateNotifier.subscribe,
          beforeUnmount: beforeUnmountNotifier.subscribe
        },

        render = init(ctrl)

      this.componentDidMount = () => {
        mounted = true
        afterMountNotifier.notify()
      }

      this.componentDidUpdate = afterUpdateNotifier.notify
      this.componentWillUnmount = beforeUnmountNotifier.notify

      this.render = () => {
        beforeUpdateNotifier.notify()
        return render(props)
      }
    }
  }

  CustomComponent.displayName = displayName

  return CustomComponent
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
