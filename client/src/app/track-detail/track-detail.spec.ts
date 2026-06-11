import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TrackDetail } from './track-detail';
import { TrackService } from '../services/track';
import { AuthService } from '../services/auth';

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

describe('TrackDetail', () => {
  let component: TrackDetail;
  let fixture: ComponentFixture<TrackDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackDetail],
      providers: [
        provideRouter([]),
        {
          provide: TrackService,
          useValue: {
            getTrack: () => of(mockTrack),
            remove: () => of(void 0),
          },
        },
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackDetail);
    fixture.componentRef.setInput('trackId', 1);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
