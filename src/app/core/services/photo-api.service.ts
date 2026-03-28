import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map } from 'rxjs';
import { Photo } from '../models/photo.model';

const BASE_URL = 'https://picsum.photos';
const PAGE_SIZE = 12;

interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoApiService {
  readonly #http = inject(HttpClient);

  getPhotos(page: number): Observable<Photo[]> {
    return this.#http
      .get<PicsumPhoto[]>(`${BASE_URL}/v2/list`, {
        params: { page: page.toString(), limit: PAGE_SIZE.toString() },
      })
      .pipe(
        delay(Math.random() * 100 + 200),
        map((items) => items.map(this.mapToPhoto)),
      );
  }

  getPhotoById(id: string): Observable<Photo> {
    return this.#http
      .get<PicsumPhoto>(`${BASE_URL}/id/${id}/info`)
      .pipe(delay(Math.random() * 100 + 200), map(this.mapToPhoto));
  }

  mapToPhoto(item: PicsumPhoto): Photo {
    return {
      id: item.id,
      url: `${BASE_URL}/id/${item.id}/200/300`,
      width: item.width,
      height: item.height,
      author: item.author,
    };
  }
}
