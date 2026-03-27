import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { Photo } from '../models/photo.model';

const BASE_URL = 'https://picsum.photos';
const PAGE_SIZE = 12;
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 300;

interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
}

@Injectable({
  providedIn: 'root',
})
export class PhotoApiService {
  readonly #http = inject(HttpClient);

  getPhotos(page: number): Observable<Photo[]> {
    return this.#http
      .get<PicsumPhoto[]>(`${BASE_URL}/v2/list`, {
        params: { page: page.toString(), limit: PAGE_SIZE.toString() },
      })
      .pipe(
        delay(randomDelay()),
        map((items) =>
          items.map((item) => ({
            id: item.id,
            url: `${BASE_URL}/id/${item.id}/200/300`,
            width: item.width,
            height: item.height,
            author: item.author,
          })),
        ),
      );
  }

  getPhotoById(id: string): Observable<Photo> {
    return this.#http.get<PicsumPhoto>(`${BASE_URL}/id/${id}/info`).pipe(
      delay(randomDelay()),
      map((item) => ({
        id: item.id,
        url: `${BASE_URL}/id/${item.id}/400/400`,
        width: item.width,
        height: item.height,
        author: item.author,
      })),
    );
  }
}
