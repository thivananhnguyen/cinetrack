import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { TrackService } from '../services/track';
import { TrackCard } from '../track-card/track-card';

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

  protected results = toSignal(
    toObservable(this.searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((q) => q.trim().length >= 2),
      switchMap((q) => this.trackService.search(q)),
    ),
    { initialValue: [] },
  );
}
