import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('returns null when key does not exist', () => {
      expect(service.get('missing')).toBeNull();
    });

    it('returns parsed value for an existing key', () => {
      localStorage.setItem('key', JSON.stringify({ a: 1 }));
      expect(service.get<{ a: number }>('key')).toEqual({ a: 1 });
    });

    it('returns null when stored value is invalid JSON', () => {
      localStorage.setItem('bad', 'not-json{{{');
      expect(service.get('bad')).toBeNull();
    });
  });

  describe('set', () => {
    it('serialises and stores the value', () => {
      service.set('nums', [1, 2, 3]);
      expect(JSON.parse(localStorage.getItem('nums')!)).toEqual([1, 2, 3]);
    });

    it('overwrites an existing key', () => {
      service.set('x', 'first');
      service.set('x', 'second');
      expect(service.get<string>('x')).toBe('second');
    });
  });

  describe('remove', () => {
    it('removes the key from storage', () => {
      service.set('toRemove', 'value');
      service.remove('toRemove');
      expect(service.get('toRemove')).toBeNull();
    });

    it('does not throw when key does not exist', () => {
      expect(() => service.remove('nonExistent')).not.toThrow();
    });
  });
});
