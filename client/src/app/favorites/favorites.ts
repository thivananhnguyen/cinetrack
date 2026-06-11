import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { TrackCard } from '../track-card/track-card';
import { TrackService } from '../services/track';
import { Track } from '../models/track';

type FavoritesState =
  | { status: 'loading' }
  | { status: 'loaded'; tracks: Track[] }
  | { status: 'error'; error: unknown };

@Component({
  selector: 'app-favorites',
  imports: [TrackCard],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Favorites {
  private trackService = inject(TrackService);
  private refreshTick = signal(0);
  protected actionError = signal('');

  protected state = toSignal(
    toObservable(this.refreshTick).pipe(
      switchMap(() =>
        this.trackService.getFavorites().pipe(
          map((tracks): FavoritesState => ({ status: 'loaded', tracks })),
          catchError((error) => of<FavoritesState>({ status: 'error', error })),
          startWith({ status: 'loading' } satisfies FavoritesState),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } satisfies FavoritesState },
  );

  protected toggleFavorite(track: Track): void {
    this.actionError.set('');
    this.trackService.removeFavorite(track.id).subscribe({
      next: () => this.refreshTick.update((v) => v + 1),
      error: () => this.actionError.set('Impossible de retirer ce favori.'),
    });
  }
}
