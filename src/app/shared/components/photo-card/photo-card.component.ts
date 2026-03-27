import { Component, input, output } from '@angular/core';
import { Photo } from '../../../core/models/photo.model';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  templateUrl: './photo-card.component.html',
  styleUrl: './photo-card.component.scss',
})
export class PhotoCardComponent {
  photo = input.required<Photo>();
  isFavorite = input(false);

  cardClicked = output<Photo>();
}
