import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/shared/models/product';
import { ShopService } from '../shop.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { BasketService } from 'src/app/basket/basket.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  // product is going to be undefined initially, hence the optional thing (?)
  product?: Product;
  // quantity of the amount selected (like between the plus minus buttons)
  quantity = 1;
  quantityInBasket = 0;


  // inject our private shop service
  constructor(private shopService: ShopService, private activatedRoute: ActivatedRoute, private bcService: BreadcrumbService, private basketService: BasketService) {
    // until it loads, it will show an empty string
    this.bcService.set('@productDetails', ' ')
  }

  ngOnInit(): void {
    this.loadProduct();
  }


  // METHOD TO LOAD INDIVIDUAL PRODUCT
  loadProduct() {
    // first, have to capture the id, so it can become a number, not a string (the GET retrieves a string)
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    // check if not null, then can feed into the method so we can actually cast it (using +)
    // then, subscribe to the observable that is returned when we make the API request
    if (id) this.shopService.getProduct(+id).subscribe({
      next: product => {
        // set the product
        this.product = product;
        // using the alias we set up in the shop-routing module
        // now the breadcrumb will show the product name, not random number
        this.bcService.set('@productDetails', product.name)

        // adding functionality for the basket updating
        // the take method (from rxjs) effectively unsubscribes from the observable once 1 value is found
        this.basketService.basketSource$.pipe(take(1)).subscribe({
          next: basket => {
            const item = basket?.items.find(x => x.id === +id);
            if (item) {
              this.quantity = item.quantity;
              this.quantityInBasket = item.quantity;
            }
          }
        })
      },
      error: error => console.log(error)
    })

  }

  incremementQuantity() {
    this.quantity++;
  }

  decremementQuantity() {
    this.quantity--;
  }

  updateBasket() {
    if (this.product) {
      if (this.quantity > this.quantityInBasket) {
        const itemsToAdd = this.quantity - this.quantityInBasket;
        this.quantityInBasket += itemsToAdd;
        this.basketService.addItemToBasket(this.product, itemsToAdd);
      } else {
        const itemsToRemove = this.quantityInBasket - this.quantity;
        this.quantityInBasket -= itemsToRemove;
        this.basketService.removeItemFromBasket(this.product.id, itemsToRemove);
      }
    }
  }

  // getter? need to know the value that already exists inside another component
  get buttonText() {
    return this.quantityInBasket === 0 ? 'Add to basket' : 'Update basket';
  }

}
