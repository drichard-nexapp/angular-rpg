import { unwrapApiResponse, unwrapApiItem } from './api-response.handler'

describe('API Response Handler', () => {
  describe('unwrapApiResponse', () => {
    it('should unwrap nested data structure', () => {
      const response = {
        data: {
          data: [{ id: 1, name: 'Test' }],
        },
      }
      const result = unwrapApiResponse<{ id: number; name: string }[]>(response, [])
      expect(result).toEqual([{ id: 1, name: 'Test' }])
    })

    it('should return default value when response is null', () => {
      const result = unwrapApiResponse(null, [])
      expect(result).toEqual([])
    })

    it('should return default value when response is undefined', () => {
      const result = unwrapApiResponse(undefined, [])
      expect(result).toEqual([])
    })

    it('should return default value when data is missing', () => {
      const response = { other: 'field' }
      const result = unwrapApiResponse(response, [])
      expect(result).toEqual([])
    })

    it('should return empty object when nested data is missing', () => {
      const response = { data: {} }
      const result = unwrapApiResponse<unknown>(response, [])
      expect(result).toEqual({})
    })

    it('should return default value when nested data is null', () => {
      const response = { data: { data: null } }
      const result = unwrapApiResponse(response, [])
      expect(result).toEqual([])
    })

    it('should work with different default values', () => {
      const result = unwrapApiResponse(null, { empty: true })
      expect(result).toEqual({ empty: true })
    })

    it('should work with string default values', () => {
      const response = {
        data: {
          data: 'test string',
        },
      }
      const result = unwrapApiResponse(response, '')
      expect(result).toEqual('test string')
    })

    it('should work with number default values', () => {
      const response = {
        data: {
          data: 42,
        },
      }
      const result = unwrapApiResponse(response, 0)
      expect(result).toEqual(42)
    })

    it('should handle direct array structure { data: [...] }', () => {
      const response = {
        data: [
          { id: 1, name: 'Test' },
          { id: 2, name: 'Test2' },
        ],
      }
      const result = unwrapApiResponse<{ id: number; name: string }[]>(response, [])
      expect(result).toEqual([
        { id: 1, name: 'Test' },
        { id: 2, name: 'Test2' },
      ])
    })

    it('should handle direct object structure { data: T }', () => {
      const response = {
        data: { id: 1, name: 'Test', value: 42 },
      }
      const result = unwrapApiResponse<{
        id: number
        name: string
        value: number
      } | null>(response, null)
      expect(result).toEqual({ id: 1, name: 'Test', value: 42 })
    })

    it('should handle empty array in direct structure', () => {
      const response = { data: [] }
      const result = unwrapApiResponse(response, [])
      expect(result).toEqual([])
    })

    it('should prioritize nested structure over direct structure', () => {
      const response = {
        data: {
          data: [{ id: 1, name: 'Nested' }],
          extra: 'field',
        },
      }
      const result = unwrapApiResponse<{ id: number; name: string }[]>(response, [])
      expect(result).toEqual([{ id: 1, name: 'Nested' }])
    })
  })

  describe('unwrapApiItem', () => {
    it('should unwrap single-level data structure', () => {
      const response = {
        data: { id: 1, name: 'Test' },
      }
      const result = unwrapApiItem<{ id: number; name: string }>(response)
      expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('should return default value when response is null', () => {
      const result = unwrapApiItem<unknown>(null)
      expect(result).toBeNull()
    })

    it('should return default value when response is undefined', () => {
      const result = unwrapApiItem<unknown>(undefined)
      expect(result).toBeNull()
    })

    it('should return default value when data is missing', () => {
      const response = { other: 'field' }
      const result = unwrapApiItem<unknown>(response)
      expect(result).toBeNull()
    })

    it('should return default value when data is null', () => {
      const response = { data: null }
      const result = unwrapApiItem<unknown>(response)
      expect(result).toBeNull()
    })

    it('should return null for array values since this is for single items', () => {
      const response = {
        data: [1, 2, 3],
      }
      const result = unwrapApiItem<number>(response)
      expect(result).toBeNull()
    })

    it('should work with complex nested objects', () => {
      const response = {
        data: {
          character: { name: 'Hero', level: 10 },
          cooldown: { total_seconds: 30 },
        },
      }
      const result = unwrapApiItem<{
        character: { name: string; level: number }
        cooldown: { total_seconds: number }
      }>(response)
      expect(result).toEqual({
        character: { name: 'Hero', level: 10 },
        cooldown: { total_seconds: 30 },
      })
    })

    it('should handle nested response structure { data: { data: T } }', () => {
      const response = {
        data: {
          data: { id: 1, name: 'Test', x: 5, y: 10 },
        },
      }
      const result = unwrapApiItem<{
        id: number
        name: string
        x: number
        y: number
      }>(response)
      expect(result).toEqual({ id: 1, name: 'Test', x: 5, y: 10 })
    })

    it('should return default value when data is an array', () => {
      const response = {
        data: [{ id: 1 }, { id: 2 }],
      }
      const result = unwrapApiItem<{ id: number }>(response)
      expect(result).toBeNull()
    })

    it('should prioritize nested structure { data: { data: T } } over direct { data: T }', () => {
      const response = {
        data: {
          data: { id: 1, name: 'Nested' },
          extra: 'This should be ignored',
        },
      }
      const result = unwrapApiItem<{ id: number; name: string }>(response)
      expect(result).toEqual({ id: 1, name: 'Nested' })
    })

    it('should handle custom default value', () => {
      const defaultValue = { id: 0, name: 'Default' }
      const result = unwrapApiItem(null, defaultValue)
      expect(result).toEqual(defaultValue)
    })

    it('should handle nested null data correctly', () => {
      const response = { data: { data: null } }
      const defaultValue = { id: 0, name: 'Default' }
      const result = unwrapApiItem(response, defaultValue)
      expect(result).toEqual(defaultValue)
    })
  })
})
