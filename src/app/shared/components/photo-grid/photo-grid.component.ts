import { Component } from '@angular/core';

@Component({
  selector: 'app-photo-grid',
  standalone: true,
  template: `<div class="grid"><ng-content /></div>`,
  styleUrl: './photo-grid.component.scss',
})
export class PhotoGridComponent {}
