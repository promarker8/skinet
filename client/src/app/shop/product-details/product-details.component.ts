import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/shared/models/product';
import { ShopService } from '../shop.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {

  product?: Product;
  // product is going to be undefined initially, so added the optional thing

  // inject our private shop service
  constructor(private shopService: ShopService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadProduct();
  }


  // METHOD TO LOAD INDIVIDUAL PRODUCT
  loadProduct() {
    // first, have to capture the id, so it can become a number, not a string (the GET retrieves a string)
    const id = this.activatedRoute.snapshot.paramMap.get('id');

    // then, check if not null, then can feed into the method so we can actually cast it (using +)
    // then, subscribe to the observable that is returned when we make the API request
    if (id) this.shopService.getProduct(+id).subscribe({
      next: product => this.product = product,
      error: error => console.log(error)
    })

  }

}