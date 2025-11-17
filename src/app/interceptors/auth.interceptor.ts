import { HttpInterceptorFn } from '@angular/common/http'
import { environmentLocal } from '../../environments/environment.local'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('api.artifactsmmo.com')) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${environmentLocal.token}`,
      },
    })
    return next(clonedReq)
  }

  return next(req)
}
