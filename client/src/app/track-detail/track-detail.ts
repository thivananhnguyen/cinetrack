// track-detail.ts
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap, map, catchError, of } from 'rxjs';
import { TrackService } from '../services/track';
import { Track } from '../models/track';
import { DurationFormatPipe } from '../pipes/duration-format-pipe';

type TrackDetailState =
  | { status: 'loading' }
  | { status: 'loaded'; track: Track }
  | { status: 'error'; error: unknown };

@Component({
  selector: 'app-track-detail',
  imports: [RouterLink, DurationFormatPipe],
  templateUrl: './track-detail.html',
  styleUrl: './track-detail.css',
})
export class TrackDetail {
  trackId = input.required<number>();
  private service = inject(TrackService);

  protected state = toSignal(
    toObservable(this.trackId).pipe(
      switchMap((id) =>
        this.service.getTrack(id).pipe(
          map((track): TrackDetailState => ({ status: 'loaded', track })),
          catchError((error) => of<TrackDetailState>({ status: 'error', error })),
        ),
      ),
    ),
  );
}
