import { options } from 'preact'

const COMPONENT_KEY = '__c' // that's ugly, isn't it?

let currComponent
let oldBeforeRender = options._render
let oldAfterDiff = options.diffed
let oldCommit = options._commit
let oldBeforeUnmount = options.unmount

options.diffed = vnode => {
  oldAfterDiff && oldAfterDiff(vnode)
  currComponent = vnode[COMPONENT_KEY]
  
  const data = currComponent && currComponent.__data
  
  if (data) {
    if (data.mounted) {
      data.notifiers.afterUpdate.notify() // TODO: What about commit?
    } else {
      data.mounted = true
      data.notifiers.afterMount.notify()
    }
  }
}

options._render = vnode => {
  currComponent = vnode[COMPONENT_KEY]
  oldBeforeRender && oldBeforeRender(vnode)
}

options._commit = (vnode, commitQueue) => {
  oldCommit && oldCommit(vnode, commitQueue)

  // TODO - what to do here?
}

options.unmount = vnode => {
  oldBeforeUnmount && oldBeforeUnmount(vnode)

  const
    component = vnode && vnode[COMPONENT_KEY],
    data = component && component.__data

  if (data) {
    data.notifiers.beforeUnmount.notify()
  }
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

export default function statefulComponent(displayName, init) {
  const preactComponent = props => {

    if (!currComponent.__data) {
      const [ctrl, notifiers] = createCtrlAndNotifiers(
        () => data.props,
        () => data.mounted,
        () => data.component.forceUpdate()
      )

      const data = {
        component: currComponent,
        props,
        mounted: false,
        notifiers,
        ctrl,

        render: null
      }

      currComponent.__data = data

      data.render = init(ctrl)
    } else {
      currComponent.__data.notifiers.beforeUpdate.notify()
    }
    
    return currComponent.__data.render(props)
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
