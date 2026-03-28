import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { FavoritesStore } from '../../../store/favorites.store';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatBadgeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly #router = inject(Router);
  protected readonly favStore = inject(FavoritesStore);

  /** True on / and on /photos/:id so the Photos tab stays highlighted on the detail page */
  protected readonly isPhotosActive = toSignal(
    this.#router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.#router.url),
      startWith(this.#router.url),
      map((url) => url === '/' || url.startsWith('/photos/')),
    ),
    { initialValue: false },
  );
}
