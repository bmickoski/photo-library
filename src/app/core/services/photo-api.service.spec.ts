import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { vi } from 'vitest';
import { PhotoApiService } from './photo-api.service';
import { Photo } from '../models/photo.model';

const PICSUM_ITEM = {
  id: '10',
  author: 'Test Author',
  width: 2500,
  height: 1667,
  url: 'https://unsplash.com/photos/xyz',
  download_url: 'https://picsum.photos/id/10/2500/1667',
};

describe('PhotoApiService', () => {
  let service: PhotoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PhotoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPhotos', () => {
    it('requests the correct URL with page and limit params', async () => {
      service.getPhotos(1).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'https://picsum.photos/v2/list' &&
          r.params.get('page') === '1' &&
          r.params.get('limit') === '12',
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
      await vi.runAllTimersAsync();
    });

    it('maps picsum response to Photo array', async () => {
      let result: Photo[] = [];
      service.getPhotos(1).subscribe((photos) => (result = photos));

      const req = httpMock.expectOne((r) => r.url === 'https://picsum.photos/v2/list');
      req.flush([PICSUM_ITEM]);
      await vi.runAllTimersAsync();

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('10');
      expect(result[0].author).toBe('Test Author');
      expect(result[0].url).toBe('https://picsum.photos/id/10/200/300');
      expect(result[0].fullUrl).toBe('https://picsum.photos/id/10/1920/1280');
    });

    it('returns an empty array when API returns no items', async () => {
      let result: Photo[] = [];
      service.getPhotos(2).subscribe((photos) => (result = photos));

      const req = httpMock.expectOne((r) => r.url === 'https://picsum.photos/v2/list');
      req.flush([]);
      await vi.runAllTimersAsync();

      expect(result).toEqual([]);
    });

    it('uses page 1 by default and sends correct page param', async () => {
      service.getPhotos(3).subscribe();

      const req = httpMock.expectOne((r) => r.params.get('page') === '3');
      expect(req).toBeTruthy();
      req.flush([]);
      await vi.runAllTimersAsync();
    });
  });

  describe('getPhotoById', () => {
    it('requests the correct info URL', async () => {
      service.getPhotoById('10').subscribe();

      const req = httpMock.expectOne('https://picsum.photos/id/10/info');
      expect(req.request.method).toBe('GET');
      req.flush(PICSUM_ITEM);
      await vi.runAllTimersAsync();
    });

    it('maps picsum item to a Photo', async () => {
      let result: Photo | undefined;
      service.getPhotoById('10').subscribe((p) => (result = p));

      const req = httpMock.expectOne('https://picsum.photos/id/10/info');
      req.flush(PICSUM_ITEM);
      await vi.runAllTimersAsync();

      expect(result?.id).toBe('10');
      expect(result?.url).toBe('https://picsum.photos/id/10/200/300');
      expect(result?.fullUrl).toBe('https://picsum.photos/id/10/1920/1280');
      expect(result?.author).toBe('Test Author');
      expect((result as any).width).toBeUndefined();
      expect((result as any).height).toBeUndefined();
    });
  });
});
