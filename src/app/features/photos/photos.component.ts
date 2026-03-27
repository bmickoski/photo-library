import { Component, OnInit, inject } from '@angular/core';
import { PhotoStreamStore } from '../../store/photo-stream.store';
import { FavoritesStore } from '../../store/favorites.store';
import { PhotoGridComponent } from '../../shared/components/photo-grid/photo-grid.component';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { Photo } from '../../core/models/photo.model';

@Component({
  selector: 'app-photos',
  standalone: true,
  imports: [PhotoGridComponent, PhotoCardComponent, LoaderComponent, InfiniteScrollDirective],
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.scss',
})
export class PhotosComponent implements OnInit {
  protected readonly stream = inject(PhotoStreamStore);
  protected readonly favStore = inject(FavoritesStore);

  ngOnInit(): void {
    if (this.stream.photos().length === 0) {
      this.stream.loadMore();
    }
  }

  addToFavorites(photo: Photo): void {
    this.favStore.add(photo);
  }
}
