import { Component } from 'preact'

// Brrrr, this is horrible as hell - please fix asap!!!!
const
  isMinimized = Component.name !== 'Component',
  keyContextId = isMinimized ? '__c' : '_id',
  keyContextDefaultValue = isMinimized ? '__' : '_defaultValue'

export function statefulComponent(displayName, init) {
  const CustomComponent = function (props) {
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

      render = init(ctrl)

    this.props = props

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

  CustomComponent.prototype = Object.create(Component.prototype)
  CustomComponent.displayName = displayName

  return CustomComponent
}

function createNotifier() {
  const subscribers = []

  return {
    notify: () => subscribers.forEach(it => it()),
    subscribe: subscriber => subscribers.push(subscriber)
  }
}
export function statelessComponent(displayName, render) {
  const ret = render.bind(null)
  ret.displayName = displayName
  return ret
}
