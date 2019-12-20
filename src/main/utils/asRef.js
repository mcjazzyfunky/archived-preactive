export default function asRef(arg) {
  return arg && Object.prototype.hasOwnProperty.call(arg, 'current')
    ? arg
    : { current: arg }
}
