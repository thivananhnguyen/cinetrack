import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, map, catchError, of, startWith } from 'rxjs';
import { TrackService } from '../services/track';
import { TrackCard } from '../track-card/track-card';
import { Track } from '../models/track';

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; results: Track[] }
  | { status: 'error'; error: unknown };

@Component({
  selector: 'app-track-search',
  imports: [TrackCard],
  templateUrl: './track-search.html',
  styleUrl: './track-search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackSearch {
  private trackService = inject(TrackService);

  protected searchTerm = signal('');

  protected state = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((q) => q.trim().length >= 2),
      switchMap((q) =>
        this.trackService.search(q).pipe(
          map((results): SearchState => ({ status: 'loaded', results })),
          catchError((error) => of<SearchState>({ status: 'error', error })),
          startWith({ status: 'loading' } satisfies SearchState),
        ),
      ),
    ),
    { initialValue: { status: 'idle' } satisfies SearchState },
  );
}
