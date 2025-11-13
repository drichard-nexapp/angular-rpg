export function unwrapApiResponse<T>(
  response: unknown,
  defaultValue: T
): T {
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data?: { data?: T } }).data
    return data?.data ?? defaultValue
  }
  return defaultValue
}

export function unwrapApiItem<T>(
  response: unknown,
  defaultValue: T | null = null
): T | null {
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data?: T }).data
    return data ?? defaultValue
  }
  return defaultValue
}
