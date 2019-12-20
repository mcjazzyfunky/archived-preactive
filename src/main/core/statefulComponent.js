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
      deferredTasks = [],

      ctrl = {
        getProps: () => this.props,
        isMounted: () => mounted, // TODO: this is obviously sugar - shall it be removed???
        update: () => this.forceUpdate(),

        getContextValue: ctx => {
          const provider = this.context[ctx[keyContextId]]
          const ret = !provider ? ctx[keyContextDefaultValue]: provider.props.value
          return ret
        },
        afterMount: afterMountNotifier.subscribe,
        beforeUpdate: beforeUpdateNotifier.subscribe,
        afterUpdate: afterUpdateNotifier.subscribe,
        beforeUnmount: beforeUnmountNotifier.subscribe,

        runOnceBeforeUpdate: task => deferredTasks.push(task) // TODO - shall this be merged with `update`???
      },

      render = this.constructor.init(ctrl)

    this.componentDidMount = () => {
      mounted = true
      afterMountNotifier.notify()
    }

    this.componentDidUpdate = afterUpdateNotifier.notify
    this.componentWillUnmount = beforeUnmountNotifier.notify

    this.render = () => {
      while (deferredTasks.length > 0) {
        deferredTasks.pop()()
      }

      beforeUpdateNotifier.notify()
      return render(props)
    }
  }
}


function createNotifier() {
  const subscribers = []

  return {
    notify(value) {
      for (let i = 0; i < subscribers.length; ++i) {
        const subscription = subscribers[i]

        subscription && subscription(value)
      }
    },

    subscribe: subscriber => subscribers.push(subscriber)
  }
}
