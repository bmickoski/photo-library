import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PhotoStreamStore } from './photo-stream.store';
import { PhotoApiService } from '../core/services/photo-api.service';
import { Photo } from '../core/models/photo.model';

const makePhoto = (id: string): Photo => ({
  id,
  url: `https://picsum.photos/id/${id}/200/300`,
  fullUrl: `https://picsum.photos/id/${id}/1920/1280`,
  author: `Author ${id}`,
});

const PAGE = [makePhoto('1'), makePhoto('2'), makePhoto('3')];

describe('PhotoStreamStore', () => {
  let store: PhotoStreamStore;
  let apiSpy: { getPhotos: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    // Pin Math.random to 0 so the random start page is always 1 (0 * 80 + 1).
    vi.spyOn(Math, 'random').mockReturnValue(0);
    apiSpy = { getPhotos: vi.fn().mockReturnValue(of(PAGE)) };

    TestBed.configureTestingModule({
      providers: [{ provide: PhotoApiService, useValue: apiSpy }],
    });

    store = TestBed.inject(PhotoStreamStore);
  });

  afterEach(() => vi.restoreAllMocks());

  it('starts empty and not loading', () => {
    expect(store.photos()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.hasMore()).toBe(true);
    expect(store.isEmpty()).toBe(true);
  });

  describe('loadMore', () => {
    it('appends photos and clears loading', () => {
      store.loadMore();
      expect(store.photos()).toEqual(PAGE);
      expect(store.loading()).toBe(false);
    });

    it('calls the API with incrementing page numbers', () => {
      store.loadMore();
      expect(apiSpy.getPhotos).toHaveBeenCalledWith(1);
      store.loadMore();
      expect(apiSpy.getPhotos).toHaveBeenCalledWith(2);
    });

    it('accumulates photos across multiple calls', () => {
      store.loadMore();
      store.loadMore();
      expect(store.photos().length).toBe(6);
    });

    it('sets hasMore to false when API returns empty array', () => {
      apiSpy.getPhotos.mockReturnValue(of([]));
      store.loadMore();
      expect(store.hasMore()).toBe(false);
    });

    it('does not call API when hasMore is false', () => {
      apiSpy.getPhotos.mockReturnValue(of([]));
      store.loadMore();
      apiSpy.getPhotos.mockClear();
      store.loadMore();
      expect(apiSpy.getPhotos).not.toHaveBeenCalled();
    });

    it('recovers from API error - loading resets to false', () => {
      apiSpy.getPhotos.mockReturnValue(throwError(() => new Error('network')));
      store.loadMore();
      expect(store.loading()).toBe(false);
    });

    it('sets error to true on network failure', () => {
      apiSpy.getPhotos.mockReturnValue(throwError(() => new Error('network')));
      store.loadMore();
      expect(store.error()).toBe(true);
    });

    it('clears error on the next successful loadMore', () => {
      apiSpy.getPhotos.mockReturnValueOnce(throwError(() => new Error('network')));
      store.loadMore();
      apiSpy.getPhotos.mockReturnValue(of(PAGE));
      store.loadMore();
      expect(store.error()).toBe(false);
    });

    it('isEmpty is false once photos are loaded', () => {
      store.loadMore();
      expect(store.isEmpty()).toBe(false);
    });

    it('start page shifts with Math.random - different sessions begin at different pages', () => {
      vi.restoreAllMocks();
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // 0.5 * 80 + 1 = 41

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PhotoApiService, useValue: apiSpy }],
      });
      const freshStore = TestBed.inject(PhotoStreamStore);

      freshStore.loadMore();
      expect(apiSpy.getPhotos).toHaveBeenCalledWith(41);
    });
  });
});
