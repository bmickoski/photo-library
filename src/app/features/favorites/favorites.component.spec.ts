import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { FavoritesComponent } from './favorites.component';
import { FavoritesStore } from '../../store/favorites.store';
import { Photo } from '../../core/models/photo.model';

const PHOTO: Photo = { id: '5', url: 'https://picsum.photos/id/5/200/300', width: 200, height: 300, author: 'B' };

function makeFavStore(photos: Photo[] = []) {
  return {
    favorites: signal(photos),
    count: signal(photos.length),
    isFavorite: vi.fn().mockReturnValue(true),
  };
}

describe('FavoritesComponent', () => {
  let favStore: ReturnType<typeof makeFavStore>;

  beforeEach(async () => {
    favStore = makeFavStore();

    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [
        provideRouter([]),
        { provide: FavoritesStore, useValue: favStore },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FavoritesComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows empty state when no favorites', () => {
    const fixture = TestBed.createComponent(FavoritesComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('navigates to /photos/:id when a photo is clicked', async () => {
    favStore = makeFavStore([PHOTO]);
    TestBed.overrideProvider(FavoritesStore, { useValue: favStore });
    const fixture = TestBed.createComponent(FavoritesComponent);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.openPhoto(PHOTO);

    expect(navSpy).toHaveBeenCalledWith(['/photos', '5']);
  });
});
