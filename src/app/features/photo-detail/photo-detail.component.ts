import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesStore } from '../../store/favorites.store';
import { PhotoApiService } from '../../core/services/photo-api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { Photo } from '../../core/models/photo.model';

@Component({
  selector: 'app-photo-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, LoaderComponent],
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
})
export class PhotoDetailComponent {
  // bound from route param via withComponentInputBinding()
  readonly id = input.required<string>();

  readonly #favStore = inject(FavoritesStore);
  readonly #api = inject(PhotoApiService);
  readonly #router = inject(Router);
  readonly #location = inject(Location);
  readonly #title = inject(Title);

  protected photo = signal<Photo | null>(null);
  protected loading = signal(false);
  readonly error = signal(false);
  protected readonly fullImageReady = signal(false);
  protected readonly fullImageError = signal(false);
  protected readonly isFavorite = computed(() => this.#favStore.isFavorite(this.id()));

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.#title.setTitle(`Photo ${id} - Photo Library`);
          this.photo.set(null);
          this.error.set(false);
          this.fullImageReady.set(false);
          this.fullImageError.set(false);

          const cached = this.#favStore.favorites().find((p) => p.id === id);
          if (cached?.fullUrl) {
            return of(cached);
          }

          this.loading.set(true);
          return this.#api.getPhotoById(id);
        }),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (p) => {
          this.photo.set(p);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        },
      });
  }

  goBack(): void {
    this.#location.back();
  }

  addToFavorites(): void {
    this.#favStore.add(this.photo()!);
  }

  removeFromFavorites(): void {
    this.#favStore.remove(this.id());
    this.#router.navigate(['/favorites']);
  }
}
