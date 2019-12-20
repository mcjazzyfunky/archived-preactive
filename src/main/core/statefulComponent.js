import { Component } from 'preact'

// Brrrr, this is horrible as hell - please fix asap!!!!
const
  isMinimized = Component.name !== 'Component',
  keyContextId = isMinimized ? '__c' : '_id',
  keyContextDefaultValue = isMinimized ? '__' : '_defaultValue'

export default function statefulComponent(displayName, init) {
  class CustomComponent extends BaseComponent {}
  
  CustomComponent.init = init
  CustomComponent.displayName = displayName

  return CustomComponent
}

class BaseComponent extends Component {
  // will be set by function `staefulComponent`:
  //
  // static init(c) {
  //  . ..
  // }

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

      render = this.constructor.init(ctrl)

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


function createNotifier() {
  let
    subscriptions = [],
    isNotifying = false,
    changedWhileNotifying = false
    
  return {
    notify(value) {
      isNotifying = true

      try {
        const length = subscriptions.length

        for (let i = 0; i < length; ++i) {
          const subscription = subscriptions[i]

          subscription && subscription(value)
        }
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
          const index = subscriptions.findIndex(it => it && it === listener)
          
          listener = null

          if (isNotifying) {
            subscriptions[index] = null
            changedWhileNotifying = true
          } else {
            subscriptions.splice(index, 1)
          }
        }
      }

      subscriptions.push(listener)
      return unsubscribe
    },

    dismiss() {
      subscriptions.length = 0
    }
  }
}
