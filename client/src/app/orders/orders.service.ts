import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../shared/models/order';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllOrders() {
    return this.http.get<Order[]>(this.baseUrl + 'orders');
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'orders/' + id);
  }
}
