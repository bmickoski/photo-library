import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Location } from '@angular/common';
import { signal } from '@angular/core';
import { PhotoDetailComponent } from './photo-detail.component';
import { FavoritesStore } from '../../store/favorites.store';
import { PhotoApiService } from '../../core/services/photo-api.service';
import { Photo } from '../../core/models/photo.model';
import { of, throwError } from 'rxjs';
import { ComponentFixture } from '@angular/core/testing';

const PHOTO: Photo = {
  id: '42',
  url: 'https://picsum.photos/id/42/200/300',
  fullUrl: 'https://picsum.photos/id/42/1920/1080',
  author: 'Test',
};

function makeFavStore(photos: Photo[] = []) {
  const list = signal(photos);
  return {
    favorites: list,
    isFavorite: (id: string) => list().some((p) => p.id === id),
    add: vi.fn(),
    remove: vi.fn(),
  };
}

describe('PhotoDetailComponent', () => {
  let favStore: ReturnType<typeof makeFavStore>;
  let apiSpy: { getPhotoById: ReturnType<typeof vi.fn> };

  function createFixture(): ComponentFixture<PhotoDetailComponent> {
    const fixture = TestBed.createComponent(PhotoDetailComponent);
    // simulate route input binding
    fixture.componentRef.setInput('id', '42');
    return fixture;
  }

  beforeEach(async () => {
    favStore = makeFavStore([PHOTO]);
    apiSpy = { getPhotoById: vi.fn().mockReturnValue(of(PHOTO)) };

    await TestBed.configureTestingModule({
      imports: [PhotoDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FavoritesStore, useValue: favStore },
        { provide: PhotoApiService, useValue: apiSpy },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    expect(createFixture().componentInstance).toBeTruthy();
  });

  it('loads photo from favorites store without hitting the API', () => {
    createFixture().detectChanges();
    expect(apiSpy.getPhotoById).not.toHaveBeenCalled();
  });

  it('renders the photo image', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img.full-photo') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain('picsum.photos/id/42/1920/1080');
  });

  it('shows Remove button when photo is a favorite', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    const removeBtn = Array.from(buttons).find((b) => b.textContent?.includes('Remove from favorites'));
    expect(removeBtn).toBeTruthy();
  });

  it('calls favStore.remove and navigates to /favorites on remove', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.removeFromFavorites();

    expect(favStore.remove).toHaveBeenCalledWith('42');
    expect(navSpy).toHaveBeenCalledWith(['/favorites']);
  });

  it('fetches from API when photo is not in favorites', () => {
    favStore = makeFavStore([]); // empty favorites
    TestBed.overrideProvider(FavoritesStore, { useValue: favStore });
    const fixture = createFixture();
    fixture.detectChanges();
    expect(apiSpy.getPhotoById).toHaveBeenCalledWith('42');
  });

  it('shows Add to favorites button when photo is not a favorite', () => {
    favStore = makeFavStore([]);
    TestBed.overrideProvider(FavoritesStore, { useValue: favStore });
    const fixture = createFixture();
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button');
    const addBtn = Array.from(buttons).find((b) => b.textContent?.includes('Add to favorites'));
    expect(addBtn).toBeTruthy();
  });

  it('addToFavorites calls favStore.add with the current photo', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    fixture.componentInstance.addToFavorites();
    expect(favStore.add).toHaveBeenCalledWith(PHOTO);
  });

  it('goBack calls location.back()', () => {
    const fixture = createFixture();
    const location = TestBed.inject(Location);
    const backSpy = vi.spyOn(location, 'back').mockImplementation(() => {});
    fixture.componentInstance.goBack();
    expect(backSpy).toHaveBeenCalled();
  });

  it('shows error message and hides image when full-size image fails to load', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img.full-photo') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.image-load-error')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('img.full-photo')).toBeNull();
  });

  it('sets error signal when API call fails', () => {
    favStore = makeFavStore([]);
    apiSpy.getPhotoById.mockReturnValue(throwError(() => new Error('network')));
    TestBed.overrideProvider(FavoritesStore, { useValue: favStore });
    TestBed.overrideProvider(PhotoApiService, { useValue: apiSpy });
    const fixture = createFixture();
    fixture.detectChanges();
    expect(fixture.componentInstance.error()).toBe(true);
  });
});
