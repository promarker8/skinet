import { Component } from '@angular/core';
import { BreadcrumbService } from 'xng-breadcrumb';

@Component({
  selector: 'app-section-header',
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent {

  // make this one public, because we want access to this service inside the html template
  // as opposed to private, which can only be accessed within the component class itself (SectionHeaderComponent)
  constructor(public bcService: BreadcrumbService) { }
}
