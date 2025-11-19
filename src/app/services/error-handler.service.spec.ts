import { TestBed, fakeAsync, tick } from '@angular/core/testing'
import { ErrorHandlerService } from './error-handler.service'

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorHandlerService],
    })
    service = TestBed.inject(ErrorHandlerService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should have no errors initially', () => {
    expect(service.hasError()).toBe(false)
    expect(service.currentError()).toBeNull()
    expect(service.allErrors().length).toBe(0)
  })

  it('should handle Error instances', () => {
    const error = new Error('Test error')
    service.handleError(error, 'TestContext')

    expect(service.hasError()).toBe(true)
    expect(service.currentError()?.message).toBe('Test error')
    expect(service.currentError()?.context).toBe('TestContext')
  })

  it('should handle string errors', () => {
    service.handleError('Simple error message')

    expect(service.hasError()).toBe(true)
    expect(service.currentError()?.message).toBe('Simple error message')
  })

  it('should handle unknown error types', () => {
    service.handleError({ unexpected: 'object' })

    expect(service.hasError()).toBe(true)
    expect(service.currentError()?.message).toBe('An unknown error occurred')
  })

  it('should extract error code if present', () => {
    const error = { message: 'API Error', code: 'ERR_404' }
    service.handleError(error)

    expect(service.currentError()?.code).toBe('ERR_404')
  })

  it('should store multiple errors', () => {
    service.handleError('First error')
    service.handleError('Second error')
    service.handleError('Third error')

    expect(service.allErrors().length).toBe(3)
    expect(service.currentError()?.message).toBe('First error')
  })

  it('should clear specific error', () => {
    service.handleError('Error 1')
    service.handleError('Error 2')

    const firstError = service.currentError()
    expect(service.allErrors().length).toBe(2)

    if (firstError) {
      service.clearError(firstError)
    }

    expect(service.allErrors().length).toBe(1)
    expect(service.currentError()?.message).toBe('Error 2')
  })

  it('should clear all errors', () => {
    service.handleError('Error 1')
    service.handleError('Error 2')
    service.handleError('Error 3')

    expect(service.allErrors().length).toBe(3)

    service.clearAllErrors()

    expect(service.hasError()).toBe(false)
    expect(service.allErrors().length).toBe(0)
  })

  it('should auto-clear errors after 5 seconds', fakeAsync(() => {
    service.handleError('Temporary error')

    expect(service.hasError()).toBe(true)

    tick(5000)

    expect(service.hasError()).toBe(false)
  }))

  it('should store timestamp with error', () => {
    const beforeTime = new Date()
    service.handleError('Test error')
    const afterTime = new Date()

    const error = service.currentError()
    expect(error?.timestamp).toBeDefined()
    expect(error?.timestamp.getTime()).toBeGreaterThanOrEqual(
      beforeTime.getTime(),
    )
    expect(error?.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime())
  })

  it('should handle errors with message property', () => {
    const error = { message: 'Custom error object' }
    service.handleError(error)

    expect(service.currentError()?.message).toBe('Custom error object')
  })
})
