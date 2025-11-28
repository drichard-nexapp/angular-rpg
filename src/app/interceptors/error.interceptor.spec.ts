import { TestBed } from '@angular/core/testing'
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { errorInterceptor } from './error.interceptor'
import { ErrorHandlerService } from '../services/error-handler.service'

describe('errorInterceptor', () => {
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let errorHandler: ErrorHandlerService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        ErrorHandlerService,
      ],
    })

    httpClient = TestBed.inject(HttpClient)
    httpTestingController = TestBed.inject(HttpTestingController)
    errorHandler = TestBed.inject(ErrorHandlerService)
  })

  afterEach(() => {
    httpTestingController.verify()
  })

  it('should handle 404 errors', (done) => {
    spyOn(errorHandler, 'handleError')

    httpClient.get('https://api.artifactsmmo.com/test').subscribe({
      error: () => {
        expect(errorHandler.handleError).toHaveBeenCalled()
        done()
      },
    })

    const req = httpTestingController.expectOne('https://api.artifactsmmo.com/test')
    req.flush('Not Found', { status: 404, statusText: 'Not Found' })
  })

  it('should handle 500 errors', (done) => {
    spyOn(errorHandler, 'handleError')

    httpClient.get('https://api.artifactsmmo.com/test').subscribe({
      error: () => {
        expect(errorHandler.handleError).toHaveBeenCalled()
        done()
      },
    })

    const req = httpTestingController.expectOne('https://api.artifactsmmo.com/test')
    req.flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    })
  })

  it('should handle network errors', (done) => {
    spyOn(errorHandler, 'handleError')

    httpClient.get('https://api.artifactsmmo.com/test').subscribe({
      error: () => {
        expect(errorHandler.handleError).toHaveBeenCalled()
        done()
      },
    })

    const req = httpTestingController.expectOne('https://api.artifactsmmo.com/test')
    req.error(new ProgressEvent('error'), { status: 0 })
  })
})
