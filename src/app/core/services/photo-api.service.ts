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
        map((items) => items.map((item) => this.#mapToPhoto(item))),
      );
  }

  getPhotoById(id: string): Observable<Photo> {
    return this.#http
      .get<PicsumPhoto>(`${BASE_URL}/id/${id}/info`)
      .pipe(delay(Math.random() * 100 + 200), map((item) => this.#mapToPhoto(item)));
  }

  #mapToPhoto(item: PicsumPhoto): Photo {
    // cap at 1920px on the longest side so the detail view doesn't download a 50 MB original
    const MAX = 1920;
    const scale = Math.min(1, MAX / Math.max(item.width, item.height));
    const fw = Math.round(item.width * scale);
    const fh = Math.round(item.height * scale);

    return {
      id: item.id,
      url: `${BASE_URL}/id/${item.id}/200/300`,
      fullUrl: `${BASE_URL}/id/${item.id}/${fw}/${fh}`,
      author: item.author,
    };
  }
}
