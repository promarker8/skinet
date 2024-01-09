import { Component } from '@angular/core';
import { BasketService } from 'src/app/basket/basket.service';
import { BasketItem } from 'src/app/shared/models/basket';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {

  constructor(public basketService: BasketService) { }

  getCount(items: BasketItem[]) {
    // reduce funciton applies to each item in an array
    // add the item quantity to the sum, and initialise the sum at 0
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }
}
