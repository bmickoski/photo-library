import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FavoritesStore } from '../../store/favorites.store';
import { PhotoGridComponent } from '../../shared/components/photo-grid/photo-grid.component';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';
import { Photo } from '../../core/models/photo.model';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [PhotoGridComponent, PhotoCardComponent, RouterLink],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  protected readonly favStore = inject(FavoritesStore);
  readonly #router = inject(Router);

  openPhoto(photo: Photo): void {
    this.#router.navigate(['/photos', photo.id]);
  }
}
