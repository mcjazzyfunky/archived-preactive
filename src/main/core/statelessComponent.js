export default function statelessComponent(displayName, main) {
  const ret = main.bind(null)
  ret.displayName = displayName
  return ret
}
