// TODO - this must be optimized
export default function useProps(c, defaultProps = null) {
  const props = Object.assign({}, defaultProps, c.getProps())

  c.beforeUpdate(() => {
    for (const key in props) {
      delete props[key]
    }

    Object.assign(props, defaultProps, c.getProps())
  })

  return props
}
