import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

let capturedCallback: ObserverCallback | null = null;
const observeSpy = vi.fn();
const disconnectSpy = vi.fn();

// Must be a real class — arrow functions can't be called with `new`
class MockIntersectionObserver {
  constructor(cb: ObserverCallback) {
    capturedCallback = cb;
  }
  observe = observeSpy;
  disconnect = disconnectSpy;
}

@Component({
  template: '<div appInfiniteScroll (scrolled)="onScrolled()"></div>',
  imports: [InfiniteScrollDirective],
})
class TestHostComponent {
  scrolledCount = 0;
  onScrolled(): void {
    this.scrolledCount++;
  }
}

describe('InfiniteScrollDirective', () => {
  beforeEach(() => {
    capturedCallback = null;
    observeSpy.mockClear();
    disconnectSpy.mockClear();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    TestBed.configureTestingModule({ imports: [TestHostComponent] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function setup() {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    return {
      fixture,
      host: fixture.componentInstance,
      sentinel: fixture.debugElement.query(By.directive(InfiniteScrollDirective)),
    };
  }

  it('creates an IntersectionObserver on init', () => {
    setup();
    expect(capturedCallback).not.toBeNull();
  });

  it('observes the host element', () => {
    const { sentinel } = setup();
    expect(observeSpy).toHaveBeenCalledWith(sentinel.nativeElement);
  });

  it('emits scrolled when the element intersects', () => {
    const { host } = setup();
    capturedCallback!([{ isIntersecting: true } as IntersectionObserverEntry]);
    expect(host.scrolledCount).toBe(1);
  });

  it('does not emit when element is not intersecting', () => {
    const { host } = setup();
    capturedCallback!([{ isIntersecting: false } as IntersectionObserverEntry]);
    expect(host.scrolledCount).toBe(0);
  });

  it('emits multiple times on repeated intersections', () => {
    const { host } = setup();
    capturedCallback!([{ isIntersecting: true } as IntersectionObserverEntry]);
    capturedCallback!([{ isIntersecting: true } as IntersectionObserverEntry]);
    expect(host.scrolledCount).toBe(2);
  });

  it('disconnects the observer on destroy', () => {
    const { fixture } = setup();
    fixture.destroy();
    expect(disconnectSpy).toHaveBeenCalledOnce();
  });
});
