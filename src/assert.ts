export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(_x: never): never {
  throw new Error('This case should have never been reached');
}
