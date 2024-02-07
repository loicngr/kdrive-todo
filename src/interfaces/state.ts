export interface StateStorage {
  promises: Array<{ id: string, promise: Promise<unknown>, resolve: CallableFunction | undefined }>
}
