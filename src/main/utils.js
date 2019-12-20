// --- asRef ---------------------------------------------------------

export function asRef(arg) {
  return arg && Object.prototype.hasOwnProperty.call(arg, 'current')
    ? arg
    : { current: arg }
} 

// --- forceUpdate ---------------------------------------------------

export function forceUpdate(c) {
  c.update()
}
export function getProps(c, defaultProps = null) {
  return !defaultProps
    ? c.getProps()
    : Object.assign({}, defaultProps, c.getProps())
}

// --- isMounted -----------------------------------------------------

export function isMounted(c) {
  return c.isMounted()
}

// --- toRef ---------------------------------------------------------
export function toRef(getter) {
  const ref = {}

  Object.defineProperty(ref, 'current', {
    enumerable: true,
    get: getter,
    set: () => {
      throw new Error('<ref>.current is read-only')
    }
  })

  return ref
}
