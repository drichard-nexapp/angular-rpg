import { TestBed } from '@angular/core/testing'
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { authInterceptor } from './auth.interceptor'

describe('authInterceptor', () => {
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    })

    httpClient = TestBed.inject(HttpClient)
    httpTestingController = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpTestingController.verify()
  })

  it('should add Authorization header to API requests', () => {
    httpClient.get('https://api.artifactsmmo.com/test').subscribe()

    const req = httpTestingController.expectOne(
      'https://api.artifactsmmo.com/test',
    )
    expect(req.request.headers.has('Authorization')).toBe(true)
    expect(req.request.headers.get('Authorization')).toContain('Bearer ')
    req.flush({})
  })

  it('should not add Authorization header to non-API requests', () => {
    httpClient.get('https://example.com/test').subscribe()

    const req = httpTestingController.expectOne('https://example.com/test')
    expect(req.request.headers.has('Authorization')).toBe(false)
    req.flush({})
  })
})
