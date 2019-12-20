export default function useContext(c, context) {
  const ret = { value: undefined }

  c.beforeUpdate(() => {
     ret.value = c.getContextValue(context)
  })

  return ret
}