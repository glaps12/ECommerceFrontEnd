import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../common/address';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly apiUrl = 'http://localhost:8080/api/addresses';

  constructor(private readonly http: HttpClient) {}

  getAddresses(email: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}?email=${email}`);
  }

  createAddress(email: string, address: Address): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}?email=${email}`, address);
  }

  updateAddress(id: number, email: string, address: Address): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}?email=${email}`, address);
  }

  deleteAddress(id: number, email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?email=${email}`);
  }
}
