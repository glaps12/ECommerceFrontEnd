import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderResponse } from '../common/order';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly apiUrl = 'http://localhost:8080/api/checkout';

  constructor(private readonly http: HttpClient) {}

  placeOrder(request: any, email?: string): Observable<OrderResponse> {
    const params = email ? `?email=${email}` : '';
    return this.http.post<OrderResponse>(`${this.apiUrl}/purchase${params}`, request);
  }
}
