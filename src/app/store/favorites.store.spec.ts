import { TestBed } from '@angular/core/testing';
import { FavoritesStore } from './favorites.store';
import { StorageService } from '../core/services/storage.service';
import { Photo } from '../core/models/photo.model';

const makePhoto = (id: string): Photo => ({
  id,
  url: `https://picsum.photos/id/${id}/200/300`,
  fullUrl: `https://picsum.photos/id/${id}/1920/1280`,
  author: `Author ${id}`,
});

describe('FavoritesStore', () => {
  let store: FavoritesStore;
  let storageSpy: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storageSpy = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storageSpy }],
    });

    store = TestBed.inject(FavoritesStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('starts with an empty favorites list when storage is empty', () => {
    expect(store.favorites()).toEqual([]);
    expect(store.count()).toBe(0);
  });

  it('loads persisted favorites from storage on init', () => {
    const persisted = [makePhoto('1'), makePhoto('2')];
    storageSpy.get.mockReturnValue(persisted);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storageSpy }],
    });
    const freshStore = TestBed.inject(FavoritesStore);

    expect(freshStore.favorites()).toEqual(persisted);
    expect(freshStore.count()).toBe(2);
  });

  describe('add', () => {
    it('adds a photo to favorites', () => {
      const photo = makePhoto('10');
      store.add(photo);
      expect(store.favorites()).toContain(photo);
      expect(store.count()).toBe(1);
    });

    it('does not add a duplicate photo', () => {
      const photo = makePhoto('10');
      store.add(photo);
      store.add(photo);
      expect(store.count()).toBe(1);
    });

    it('adds multiple distinct photos', () => {
      store.add(makePhoto('1'));
      store.add(makePhoto('2'));
      store.add(makePhoto('3'));
      expect(store.count()).toBe(3);
    });
  });

  describe('remove', () => {
    it('removes a photo by id', () => {
      const photo = makePhoto('10');
      store.add(photo);
      store.remove('10');
      expect(store.favorites()).not.toContain(photo);
      expect(store.count()).toBe(0);
    });

    it('does not throw when removing a non-existent id', () => {
      expect(() => store.remove('999')).not.toThrow();
    });

    it('only removes the targeted photo', () => {
      store.add(makePhoto('1'));
      store.add(makePhoto('2'));
      store.remove('1');
      expect(store.count()).toBe(1);
      expect(store.favorites()[0].id).toBe('2');
    });
  });

  describe('isFavorite', () => {
    it('returns true for an added photo', () => {
      store.add(makePhoto('42'));
      expect(store.isFavorite('42')).toBe(true);
    });

    it('returns false for a photo not in favorites', () => {
      expect(store.isFavorite('99')).toBe(false);
    });

    it('returns false after the photo is removed', () => {
      store.add(makePhoto('5'));
      store.remove('5');
      expect(store.isFavorite('5')).toBe(false);
    });
  });

  describe('ids computed', () => {
    it('returns a Set of favorite ids', () => {
      store.add(makePhoto('a'));
      store.add(makePhoto('b'));
      expect(store.ids().has('a')).toBe(true);
      expect(store.ids().has('b')).toBe(true);
      expect(store.ids().has('c')).toBe(false);
    });
  });

  describe('persistence', () => {
    it('calls storage.set when a photo is added', () => {
      TestBed.tick();
      const callsBefore = storageSpy.set.mock.calls.length;
      store.add(makePhoto('7'));
      TestBed.tick();
      expect(storageSpy.set.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
