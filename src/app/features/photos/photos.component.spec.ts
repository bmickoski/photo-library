import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PhotosComponent } from './photos.component';
import { PhotoStreamStore } from '../../store/photo-stream.store';
import { FavoritesStore } from '../../store/favorites.store';
import { Photo } from '../../core/models/photo.model';
import { signal } from '@angular/core';

const PHOTO: Photo = { id: '1', url: 'https://picsum.photos/id/1/200/300', fullUrl: 'https://picsum.photos/id/1/1920/1280', author: 'A' };

// IntersectionObserver is not available in jsdom
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(cb: IntersectionObserverCallback) {}
}

function makeStreamStore(photos: Photo[] = [], loading = false) {
  return {
    photos: signal(photos),
    loading: signal(loading),
    hasMore: signal(true),
    isEmpty: signal(photos.length === 0 && !loading),
    error: signal(false),
    loadMore: vi.fn(),
  };
}

function makeFavStore() {
  return {
    favorites: signal<Photo[]>([]),
    isFavorite: vi.fn().mockReturnValue(false),
    add: vi.fn(),
  };
}

describe('PhotosComponent', () => {
  let streamStore: ReturnType<typeof makeStreamStore>;
  let favStore: ReturnType<typeof makeFavStore>;

  afterEach(() => vi.unstubAllGlobals());

  beforeEach(async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    streamStore = makeStreamStore();
    favStore = makeFavStore();

    await TestBed.configureTestingModule({
      imports: [PhotosComponent],
      providers: [
        provideRouter([]),
        { provide: PhotoStreamStore, useValue: streamStore },
        { provide: FavoritesStore, useValue: favStore },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PhotosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls loadMore on init when photos list is empty', () => {
    TestBed.createComponent(PhotosComponent).detectChanges();
    expect(streamStore.loadMore).toHaveBeenCalledOnce();
  });

  it('does not call loadMore on init when photos already loaded', () => {
    streamStore = makeStreamStore([PHOTO]);
    TestBed.overrideProvider(PhotoStreamStore, { useValue: streamStore });
    TestBed.createComponent(PhotosComponent).detectChanges();
    expect(streamStore.loadMore).not.toHaveBeenCalled();
  });

  it('calls favStore.add when addToFavorites is triggered', () => {
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.componentInstance.addToFavorites(PHOTO);
    expect(favStore.add).toHaveBeenCalledWith(PHOTO);
  });

  it('shows a snackbar after adding to favorites', () => {
    const snackBar = TestBed.inject(MatSnackBar);
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.componentInstance.addToFavorites(PHOTO);
    expect(snackBar.open).toHaveBeenCalledWith('Added to favorites', undefined, { duration: 2000 });
  });

  it('showScrollTop is false initially', () => {
    const fixture = TestBed.createComponent(PhotosComponent);
    expect(fixture.componentInstance.showScrollTop()).toBe(false);
  });

  it('showScrollTop becomes true when scrolled past 300px', () => {
    Object.defineProperty(window, 'scrollY', { value: 400, writable: true, configurable: true });
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.componentInstance.onScroll();
    expect(fixture.componentInstance.showScrollTop()).toBe(true);
  });

  it('scrollToTop calls window.scrollTo with smooth behavior', () => {
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const fixture = TestBed.createComponent(PhotosComponent);
    fixture.componentInstance.scrollToTop();
    expect(spy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
