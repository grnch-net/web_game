export {}

declare global {
  type Associative<T> = { [key: string]: T };
  type AnyClass = { new(...constructorArgs: any[]) };
}
