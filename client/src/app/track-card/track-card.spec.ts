import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TrackCard } from './track-card';

const mockTrack = {
  id: 1,
  title: 'Test',
  artist: 'Artist',
  album: 'Album',
  genre: 'Pop',
  durationSeconds: 180,
  year: 2024,
  rating: 8,
  favorite: false,
  coverUrl: 'https://example.com/cover.jpg',
};

describe('TrackCard', () => {
  let component: TrackCard;
  let fixture: ComponentFixture<TrackCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackCard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackCard);
    fixture.componentRef.setInput('track', mockTrack);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
