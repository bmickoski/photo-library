import { Injectable, computed, inject, signal } from '@angular/core';
import { Photo } from '../core/models/photo.model';
import { PhotoApiService } from '../core/services/photo-api.service';

// Conservative upper bound for the initial random page.
// We randomize the session start to satisfy the "random photostream" requirement.
// The actual end of available content is detected from empty responses via #hasMore.
// (Picsum's /v2/list Link header only exposes rel="next"/"prev"  no rel="last"
//  and there is no X-Total header, so the total page count cannot be queried at runtime.)
const MAX_START_PAGE = 80;

@Injectable({ providedIn: 'root' })
export class PhotoStreamStore {
  readonly #api = inject(PhotoApiService);

  readonly #photos = signal<Photo[]>([]);
  readonly #loading = signal(false);
  readonly #hasMore = signal(true);
  readonly #error = signal(false);
  // Start at a random page each session; incremented sequentially from there.
  readonly #page = signal(Math.floor(Math.random() * MAX_START_PAGE) + 1);

  readonly photos = this.#photos.asReadonly();
  readonly loading = this.#loading.asReadonly();
  readonly hasMore = this.#hasMore.asReadonly();
  readonly error = this.#error.asReadonly();
  readonly isEmpty = computed(() => !this.#loading() && this.#photos().length === 0);

  loadMore(): void {
    if (this.#loading() || !this.#hasMore()) return;

    this.#loading.set(true);
    this.#error.set(false);

    this.#api.getPhotos(this.#page()).subscribe({
      next: (photos) => {
        if (photos.length === 0) {
          this.#hasMore.set(false);
        } else {
          this.#photos.update((current) => [...current, ...photos]);
          this.#page.update((p) => p + 1);
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
