export async function preventThrottle(delay: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("I have waited long enough")
    }, delay)
  })
}
