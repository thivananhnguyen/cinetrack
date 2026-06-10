// track-detail.ts
import { Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { switchMap, map, catchError, of } from 'rxjs';
import { TrackService } from '../services/track';
import { AuthService } from '../services/auth';
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
  private router = inject(Router);
  protected auth = inject(AuthService);
  protected deleting = signal(false);

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

  onDelete() {
    if (!confirm('Supprimer ce morceau ?')) return;
    this.deleting.set(true);
    this.service.remove(this.trackId()).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.deleting.set(false),
    });
  }
}
