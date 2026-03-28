import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loader-wrap">
      <mat-spinner diameter="48" />
    </div>
  `,
  styles: [`
    .loader-wrap {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }
  `],
})
export class LoaderComponent {}
