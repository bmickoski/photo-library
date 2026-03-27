import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function setup() {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('should create', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a Photos nav link pointing to /', () => {
    const { fixture } = setup();
    const links = fixture.debugElement.queryAll(By.css('a[mat-button]'));
    const photosLink = links.find((l) => l.nativeElement.textContent.trim() === 'Photos');
    expect(photosLink).toBeTruthy();
    expect(photosLink!.attributes['routerLink']).toBe('/');
  });

  it('renders a Favorites nav link pointing to /favorites', () => {
    const { fixture } = setup();
    const links = fixture.debugElement.queryAll(By.css('a[mat-button]'));
    const favLink = links.find((l) => l.nativeElement.textContent.trim() === 'Favorites');
    expect(favLink).toBeTruthy();
    expect(favLink!.attributes['routerLink']).toBe('/favorites');
  });

  it('displays the app title', () => {
    const { el } = setup();
    expect(el.querySelector('.logo')?.textContent).toContain('Photo Library');
  });
});
