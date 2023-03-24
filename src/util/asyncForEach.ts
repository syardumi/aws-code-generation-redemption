/**
 *
 * @param array
 * @param callback
 */
export async function asyncForEach<T>(
  array: T[],
  callback: (
    elem: T,
    index: number,
    array: T[],
    breakFn?: () => void
  ) => void | Promise<void>
): Promise<void> {
  let cancelLoop = false
  const breakFn = () => {
    cancelLoop = true
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array, breakFn)
    if (cancelLoop) break
  }
}
