export default function useValue(c, initialValue) {
  const
    value = { value: initialValue },

    setValue = updater => {
      c.deferTask(() => {
        value.value = typeof updater === 'function'
          ? updater(value.value)
          : updater
      })

      c.update()
    }

  return [value, setValue]
}
