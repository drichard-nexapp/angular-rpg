export function unwrapApiResponse<T>(response: unknown, defaultValue: T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    const outerData = (response as { data?: unknown }).data

    if (outerData && typeof outerData === 'object' && 'data' in outerData) {
      return (outerData as { data: T }).data ?? defaultValue
    }

    if (Array.isArray(outerData)) {
      return outerData as T
    }

    return (outerData as T) ?? defaultValue
  }
  return defaultValue
}

export function unwrapApiItem<T>(response: unknown, defaultValue: T | null = null): T | null {
  if (response && typeof response === 'object' && 'data' in response) {
    const outerData = (response as { data?: unknown }).data

    if (outerData && typeof outerData === 'object' && 'data' in outerData) {
      return (outerData as { data: T }).data ?? defaultValue
    }

    if (Array.isArray(outerData)) {
      return defaultValue
    }

    return (outerData as T) ?? defaultValue
  }
  return defaultValue
}
