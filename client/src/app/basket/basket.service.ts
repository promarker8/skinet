import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Basket, BasketItem, BasketTotals } from '../shared/models/basket';
import { HttpClient } from '@angular/common/http';
import { Product } from '../shared/models/product';
import { DeliveryMethod } from '../shared/models/deliveryMethod';

@Injectable({
  providedIn: 'root'
})

export class BasketService {
  baseUrl = environment.apiUrl;
  // need to create an observable (BehaviorSubject from rxjs)
  // it's going to be a Basket, or null, then initialise it to null (the (null))
  private basketSource = new BehaviorSubject<Basket | null>(null);
  basketSource$ = this.basketSource.asObservable();
  // this is made inside a service, which is a singleton, so we know it won't be disposed of

  // as our basket gets updates, the basket total is going to be updated
  private basketTotalSource = new BehaviorSubject<BasketTotals | null>(null);
  basketTotalSource$ = this.basketTotalSource.asObservable();


  constructor(private http: HttpClient) { }

  // using the payments controller 
  createPaymentIntent() {
    return this.http.post<Basket>(this.baseUrl + 'payments/' + this.getCurrentBasketValue()?.id, {})
      // want to update the basket observable once we get that back from the API
      .pipe(
        map(basket => {
          this.basketSource.next(basket);
        })
      )
  }

  setShippingPrice(deliveryMethod: DeliveryMethod) {
    const basket = this.getCurrentBasketValue();
    if (basket) {
      basket.shippingPrice = deliveryMethod.price;
      basket.deliveryMethodId = deliveryMethod.id;
      this.setBasket(basket);
    }
  }

  getBasket(id: string) {
    // usually, we would subscribe to the observable in the component, but not TODAY
    return this.http.get<Basket>(this.baseUrl + 'basket?id=' + id).subscribe({
      next: basket => {
        this.basketSource.next(basket);
        this.calculateTotals();
      }
    })
  }

  setBasket(basket: Basket) {
    return this.http.post<Basket>(this.baseUrl + 'basket', basket).subscribe({
      next: basket => {
        this.basketSource.next(basket);
        this.calculateTotals();
      }
    })
  }

  getCurrentBasketValue() {
    return this.basketSource.value;
  }

  addItemToBasket(item: Product | BasketItem, quantity = 1) {
    if (this.isProduct(item)) item = this.mapProductItemToBasketItem(item);
    const basket = this.getCurrentBasketValue() ?? this.createBasket();
    basket.items = this.addOrUpdateItem(basket.items, item, quantity);
    this.setBasket(basket);
  }

  removeItemFromBasket(id: number, quantity = 1) {
    const basket = this.getCurrentBasketValue();
    if (!basket) return;
    const item = basket.items.find(x => x.id === id);
    if (item) {
      // if the item exists, not undefined, then reduce quantity
      item.quantity -= quantity;
      if (item.quantity === 0) {
        // if there is only 1 of the item in the basket, then delete entire item
        // then filter out the rest of the items in the basket (not deleted)
        basket.items = basket.items.filter(x => x.id !== id);
      }
      if (basket.items.length > 0) this.setBasket(basket);
      else this.deleteBasket(basket);
    }
  }

  deleteBasket(basket: Basket) {
    return this.http.delete(this.baseUrl + 'basket?id=' + basket.id).subscribe({
      next: () => {
        this.deleteLocalBasket();
      }
    })
  }

  deleteLocalBasket() {
    this.basketSource.next(null);
    this.basketTotalSource.next(null);
    localStorage.removeItem('basket_id');
  }

  private addOrUpdateItem(items: BasketItem[], itemToAdd: BasketItem, quantity: number): BasketItem[] {
    const item = items.find(x => x.id === itemToAdd.id);

    // check if item is in the basket already
    if (item) item.quantity += quantity;
    else {
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    }
    return items;
  }

  private createBasket(): Basket {
    const basket = new Basket();
    // need to store the basket id in browser storage
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }

  // being specific about what this is returning (: BasketItem) --> type safety and if you forget
  private mapProductItemToBasketItem(item: Product): BasketItem {
    return {
      id: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0,
      pictureUrl: item.pictureUrl,
      brand: item.productBrand,
      type: item.productType
    }
  }

  private calculateTotals() {
    const basket = this.getCurrentBasketValue();
    if (!basket) return;
    const subtotal = basket.items.reduce((a, b) => (b.price * b.quantity) + a, 0);
    const total = subtotal + basket.shippingPrice;
    this.basketTotalSource.next({ shipping: basket.shippingPrice, total, subtotal });
  }

  private isProduct(item: Product | BasketItem): item is Product {
    return (item as Product).productBrand !== undefined;
  }
}
