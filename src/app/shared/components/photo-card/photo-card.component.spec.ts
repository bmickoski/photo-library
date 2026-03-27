import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PhotoCardComponent } from './photo-card.component';
import { Photo } from '../../../core/models/photo.model';

const PHOTO: Photo = {
  id: '42',
  url: 'https://picsum.photos/id/42/200/300',
  width: 200,
  height: 300,
  author: 'Test Author',
};

@Component({
  template: `
    <app-photo-card [photo]="photo" [isFavorite]="fav" (cardClicked)="clicked = $event" />
  `,
  imports: [PhotoCardComponent],
})
class HostComponent {
  photo = PHOTO;
  fav = false;
  clicked: Photo | null = null;
}

describe('PhotoCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  function setup(fav = false) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.fav = fav;
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance };
  }

  it('should create', () => {
    const { fixture } = setup();
    expect(fixture.debugElement.query(By.directive(PhotoCardComponent))).toBeTruthy();
  });

  it('renders the photo image with correct src and alt', () => {
    const { fixture } = setup();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('picsum.photos/id/42/200/300');
    expect(img.alt).toBe('Test Author');
  });

  it('emits cardClicked with the photo when card is clicked', () => {
    const { fixture, host } = setup();
    fixture.nativeElement.querySelector('.card').click();
    expect(host.clicked).toEqual(PHOTO);
  });

  it('does not show favorite badge when isFavorite is false', () => {
    const { fixture } = setup(false);
    expect(fixture.nativeElement.querySelector('.favorite-badge')).toBeNull();
  });

  it('shows favorite badge when isFavorite is true', () => {
    const { fixture } = setup(true);
    expect(fixture.nativeElement.querySelector('.favorite-badge')).toBeTruthy();
  });

  it('adds is-favorite class when isFavorite is true', () => {
    const { fixture } = setup(true);
    expect(fixture.nativeElement.querySelector('.card.is-favorite')).toBeTruthy();
  });
});
