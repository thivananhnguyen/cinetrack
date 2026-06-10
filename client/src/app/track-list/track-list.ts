import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError, of, startWith } from 'rxjs';
import { TrackCard } from '../track-card/track-card';
import { TrackService } from '../services/track';
import { Track } from '../models/track';

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

  protected selectedId = signal<number | null>(null);
  protected searchTerm = signal('');

  protected state = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        const req = q.trim().length >= 2
          ? this.trackService.search(q)
          : this.trackService.getTracks();
        return req.pipe(
          map((tracks): ListState => ({ status: 'loaded', tracks })),
          catchError((error) => of<ListState>({ status: 'error', error })),
          startWith({ status: 'loading' } as ListState),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as ListState },
  );
}
