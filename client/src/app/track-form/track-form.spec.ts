import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { TrackForm } from './track-form';
import { TrackService } from '../services/track';
import { AuthService } from '../services/auth';

describe('TrackForm', () => {
  let component: TrackForm;
  let fixture: ComponentFixture<TrackForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackForm],
      providers: [
        provideRouter([]),
        {
          provide: TrackService,
          useValue: {
            getTrack: () => of(null),
            create: () => of(null),
            update: () => of(null),
          },
        },
        {
          provide: AuthService,
          useValue: {
            isLoggedIn: () => true,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrackForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
