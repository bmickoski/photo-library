import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective implements AfterViewInit, OnDestroy {
  readonly scrolled = output<void>();

  readonly #el = inject(ElementRef<HTMLElement>);
  #observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    this.#observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.scrolled.emit();
        }
      },
      { threshold: 0.1 },
    );

    this.#observer.observe(this.#el.nativeElement);
  }

  ngOnDestroy(): void {
    this.#observer?.disconnect();
  }
}
