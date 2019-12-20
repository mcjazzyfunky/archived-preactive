import isEqualArray from '../internal/isEqualArray'
export default function useMemo(c, getValue, getDeps) {
  let oldDeps = getDeps()

  const memo = { value: getValue.apply(null, oldDeps) }

  c.beforeUpdate(() => {
    const newDeps = getDeps()

    if (!isEqualArray(oldDeps, newDeps)) {
      oldDeps = newDeps
      memo.value = getValue.apply(null, newDeps)
    }
  })

  return memo
}
