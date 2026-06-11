import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of, startWith } from 'rxjs';
import { TrackCard } from '../track-card/track-card';
import { TrackService } from '../services/track';
import { Track } from '../models/track';
import { AuthService } from '../services/auth';

type ListState =
  | { status: 'loading' }
  | { status: 'loaded'; tracks: Track[] }
  | { status: 'error'; error: unknown };

@Component({
  selector: 'app-track-list',
  imports: [TrackCard],
  templateUrl: './track-list.html',
  styleUrl: './track-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackList {
  private trackService = inject(TrackService);
  protected auth = inject(AuthService);

  protected selectedId = signal<number | null>(null);
  protected searchTerm = signal('');
  protected actionError = signal('');
  private refreshTick = signal(0);

  private queryState = computed(() => ({
    query: this.searchTerm(),
    tick: this.refreshTick(),
  }));

  protected state = toSignal(
    toObservable(this.queryState).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(({ query }) => {
        const q = query;
        const req = q.trim().length >= 2
          ? this.trackService.search(q)
          : this.trackService.getTracks();
        return req.pipe(
          map((tracks): ListState => ({ status: 'loaded', tracks })),
          catchError((error) => of<ListState>({ status: 'error', error })),
          startWith({ status: 'loading' } satisfies ListState),
        );
      }),
    ),
    { initialValue: { status: 'loading' } satisfies ListState },
  );

  protected toggleFavorite(track: Track): void {
    if (!this.auth.isLoggedIn()) return;
    this.actionError.set('');

    const request$ = track.favorite
      ? this.trackService.removeFavorite(track.id).pipe(map(() => null))
      : this.trackService.addFavorite(track.id).pipe(map(() => null));

    request$.subscribe({
      next: () => this.refreshTick.update((v) => v + 1),
      error: () => this.actionError.set('Impossible de mettre à jour le favori.'),
    });
  }
}
