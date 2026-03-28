import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PhotoGridComponent, PhotoCardComponent, LoaderComponent, InfiniteScrollDirective, MatButtonModule, MatIconModule],
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.scss',
})
export class PhotosComponent implements OnInit {
  protected readonly stream = inject(PhotoStreamStore);
  protected readonly favStore = inject(FavoritesStore);
  readonly showScrollTop = signal(false);
  readonly skeletons = Array.from({ length: 12 });
  readonly #snackBar = inject(MatSnackBar);

  readonly #destroyRef = inject(DestroyRef);
  readonly #title = inject(Title);

  ngOnInit(): void {
    this.#title.setTitle('Photos - Photo Library');
    if (this.stream.photos().length === 0) {
      this.stream.loadMore();
    }

    fromEvent(window, 'scroll')
      .pipe(
        throttleTime(100, undefined, { leading: true, trailing: true }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe(() => this.onScroll());
  }

  onScroll(): void {
    this.showScrollTop.set(window.scrollY > 300);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToFavorites(photo: Photo): void {
    this.favStore.add(photo);
    this.#snackBar.open('Added to favorites', undefined, { duration: 2000 });
  }
}
