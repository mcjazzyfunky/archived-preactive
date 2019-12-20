export default function statelessComponent(displayName, render) {
  const ret = render.bind(null)
  ret.displayName = displayName
  return ret
}
