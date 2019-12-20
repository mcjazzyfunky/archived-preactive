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
  // static init(c) { ... } // will be set by function `statefulComponent`

  constructor(props) {
    super(props)
    
    let mounted = false

    const
      afterMountNotifier = createNotifier(),
      beforeUpdateNotifier = createNotifier(),
      afterUpdateNotifier = createNotifier(),
      beforeUnmountNotifier = createNotifier(),
      runOnceBeforeUpdateTasks = [],

      ctrl = {
        getProps: () => this.props,
        isMounted: () => mounted,
        update: () => this.forceUpdate(),

        getContextValue: ctx => {
          const provider = this.context[ctx[keyContextId]]

          return  !provider ? ctx[keyContextDefaultValue] : provider.props.value
        },

        afterMount: afterMountNotifier.subscribe,
        beforeUpdate: beforeUpdateNotifier.subscribe,
        afterUpdate: afterUpdateNotifier.subscribe,
        beforeUnmount: beforeUnmountNotifier.subscribe,

        runOnceBeforeUpdate: task => runOnceBeforeUpdateTasks.push(task)
      },

      render = this.constructor.init(ctrl)

    this.componentDidMount = () => {
      mounted = true
      afterMountNotifier.notify()
    }

    this.componentDidUpdate = afterUpdateNotifier.notify
    this.componentWillUnmount = beforeUnmountNotifier.notify

    this.render = () => {
      const taskCount = runOnceBeforeUpdateTasks.length

      for (let i = 0; i < taskCount; ++i) {
        runOnceBeforeUpdateTasks[i]()
      }

      if (taskCount === runOnceBeforeUpdateTasks.length) {
        runOnceBeforeUpdateTasks.length = 0
      } else {
        runOnceBeforeUpdateTasks.splice(0, taskCount)
      }

      beforeUpdateNotifier.notify()
      return render(props)
    }
  }
}

function createNotifier() {
  const subscribers = []

  return {
    notify: () => subscribers.forEach(it => it()),
    subscribe: subscriber => subscribers.push(subscriber)
  }
}
