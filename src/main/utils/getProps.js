export default function getProps(c, defaultProps = null) {
  return !defaultProps
    ? c.getProps()
    : Object.assign({}, defaultProps, c.getProps())
}
