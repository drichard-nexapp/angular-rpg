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
import { loadingInterceptor } from './loading.interceptor'
import { LoadingService } from '../services/loading.service'

describe('loadingInterceptor', () => {
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let loadingService: LoadingService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    })

    httpClient = TestBed.inject(HttpClient)
    httpTestingController = TestBed.inject(HttpTestingController)
    loadingService = TestBed.inject(LoadingService)
  })

  afterEach(() => {
    httpTestingController.verify()
    loadingService.reset()
  })

  it('should show loading when request starts', () => {
    expect(loadingService.isLoading()).toBe(false)

    httpClient.get('https://api.artifactsmmo.com/test').subscribe()

    expect(loadingService.isLoading()).toBe(true)

    const req = httpTestingController.expectOne(
      'https://api.artifactsmmo.com/test',
    )
    req.flush({})

    expect(loadingService.isLoading()).toBe(false)
  })

  it('should hide loading when request completes', (done) => {
    httpClient.get('https://api.artifactsmmo.com/test').subscribe(() => {
      setTimeout(() => {
        expect(loadingService.isLoading()).toBe(false)
        done()
      })
    })

    const req = httpTestingController.expectOne(
      'https://api.artifactsmmo.com/test',
    )
    req.flush({})
  })

  it('should hide loading when request fails', (done) => {
    httpClient.get('https://api.artifactsmmo.com/test').subscribe({
      error: () => {
        setTimeout(() => {
          expect(loadingService.isLoading()).toBe(false)
          done()
        })
      },
    })

    const req = httpTestingController.expectOne(
      'https://api.artifactsmmo.com/test',
    )
    req.error(new ProgressEvent('error'))
  })

  it('should handle multiple concurrent requests', () => {
    httpClient.get('https://api.artifactsmmo.com/test1').subscribe()
    httpClient.get('https://api.artifactsmmo.com/test2').subscribe()

    expect(loadingService.isLoading()).toBe(true)

    const req1 = httpTestingController.expectOne(
      'https://api.artifactsmmo.com/test1',
    )
    req1.flush({})

    expect(loadingService.isLoading()).toBe(true)

    const req2 = httpTestingController.expectOne(
      'https://api.artifactsmmo.com/test2',
    )
    req2.flush({})

    expect(loadingService.isLoading()).toBe(false)
  })
})
