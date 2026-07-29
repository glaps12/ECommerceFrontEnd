import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderResponse } from '../common/order';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly apiUrl = `${inject(API_BASE_URL)}/checkout`;

  constructor(private readonly http: HttpClient) {}

  placeOrder(request: unknown): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/purchase`, request);
  }
}
