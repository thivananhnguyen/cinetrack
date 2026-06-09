// track-detail.ts
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { TrackService } from '../services/track';
import { DurationFormatPipe } from '../pipes/duration-format-pipe';

@Component({
  selector: 'app-track-detail',
  imports: [RouterLink, DurationFormatPipe],
  templateUrl: './track-detail.html',
  styleUrl: './track-detail.css',
})
export class TrackDetail {
  trackId = input.required<number>();
  private service = inject(TrackService);

  protected track = toSignal(
    toObservable(this.trackId).pipe(
      switchMap((id) => this.service.getTrack(id)),
    ),
  );
}
