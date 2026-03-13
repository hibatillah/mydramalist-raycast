export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function sleep(time = 500) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
