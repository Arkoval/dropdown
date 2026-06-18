export function mergeClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ')
}
