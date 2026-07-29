import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { readStoredAuth } from './auth-storage';
import { API_BASE_URL } from './api.config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = readStoredAuth();
  const apiBaseUrl = inject(API_BASE_URL);
  if (!auth || !request.url.startsWith(apiBaseUrl)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: {
      Authorization: `Bearer ${auth.token}`,
    },
  }));
};
