import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Photo } from '../core/models/photo.model';
import { StorageService } from '../core/services/storage.service';

const STORAGE_KEY = 'favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesStore {
  readonly #storage = inject(StorageService);
  readonly #favorites = signal<Photo[]>(this.#storage.get<Photo[]>(STORAGE_KEY) ?? []);

  readonly favorites = this.#favorites.asReadonly();
  readonly count = computed(() => this.#favorites().length);
  readonly ids = computed(() => new Set(this.#favorites().map((p) => p.id)));

  constructor() {
    effect(() => {
      this.#storage.set(STORAGE_KEY, this.#favorites());
    });
  }

  isFavorite(id: string): boolean {
    return this.ids().has(id);
  }

  add(photo: Photo): void {
    if (!this.isFavorite(photo.id)) {
      this.#favorites.update((list) => [...list, photo]);
    }
  }

  remove(id: string): void {
    this.#favorites.update((list) => list.filter((p) => p.id !== id));
  }


}
