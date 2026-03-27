import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesStore } from '../../store/favorites.store';
import { PhotoApiService } from '../../core/services/photo-api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { Photo } from '../../core/models/photo.model';

@Component({
  selector: 'app-photo-detail',
  standalone: true,
  imports: [MatButtonModule, LoaderComponent],
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
})
export class PhotoDetailComponent implements OnInit {
  // bound from route param via withComponentInputBinding()
  readonly id = input.required<string>();

  readonly #favStore = inject(FavoritesStore);
  readonly #api = inject(PhotoApiService);
  readonly #router = inject(Router);
  readonly #location = inject(Location);

  protected photo = signal<Photo | null>(null);
  protected loading = signal(false);
  protected readonly isFavorite = computed(() => this.#favStore.isFavorite(this.id()));

  ngOnInit(): void {
    // Prefer cached version from favorites store — avoids extra HTTP round-trip
    const cached = this.#favStore.favorites().find((p) => p.id === this.id());
    if (cached) {
      this.photo.set(cached);
      return;
    }

    this.loading.set(true);
    this.#api.getPhotoById(this.id()).subscribe({
      next: (p) => {
        this.photo.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goBack(): void {
    this.#location.back();
  }

  removeFromFavorites(): void {
    this.#favStore.remove(this.id());
    this.#router.navigate(['/favorites']);
  }
}
