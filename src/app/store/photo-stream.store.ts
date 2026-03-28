import { Injectable, computed, inject, signal } from '@angular/core';
import { Photo } from '../core/models/photo.model';
import { PhotoApiService } from '../core/services/photo-api.service';

@Injectable({ providedIn: 'root' })
export class PhotoStreamStore {
  readonly #api = inject(PhotoApiService);

  readonly #photos = signal<Photo[]>([]);
  readonly #loading = signal(false);
  readonly #hasMore = signal(true);
  readonly #error = signal(false);

  readonly photos = this.#photos.asReadonly();
  readonly loading = this.#loading.asReadonly();
  readonly hasMore = this.#hasMore.asReadonly();
  readonly error = this.#error.asReadonly();
  readonly isEmpty = computed(() => !this.#loading() && this.#photos().length === 0);

  loadMore(): void {
    if (this.#loading() || !this.#hasMore()) return;

    // Pick a random page
    // Picsum signals end-of-content with an empty array.
    const page = Math.floor(Math.random() * 100) + 1;

    this.#loading.set(true);
    this.#error.set(false);

    this.#api.getPhotos(page).subscribe({
      next: (photos) => {
        // An empty response just means we picked a page beyond the dataset; keep streaming.
        if (photos.length > 0) {
          this.#photos.update((current) => {
            const seen = new Set(current.map((p) => p.id));
            return [...current, ...photos.filter((p) => !seen.has(p.id))];
          });
        }

        this.#loading.set(false);
      },
      error: () => {
        this.#loading.set(false);
        this.#error.set(true);
      },
    });
  }
}
