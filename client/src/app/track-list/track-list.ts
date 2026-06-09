import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TrackCard } from '../track-card/track-card';
import { TrackForm } from '../track-form/track-form';
import { TrackService } from '../services/track';
import { Track } from '../models/track';

@Component({
  selector: 'app-track-list',
  imports: [TrackCard, TrackForm],
  templateUrl: './track-list.html',
  styleUrl: './track-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackList {
  private trackService = inject(TrackService);

  protected tracks = toSignal(this.trackService.getTracks(), {
    initialValue: [] as Track[],
  });
  protected selectedId = signal<number | null>(null);
  protected searchTerm = signal('');

  protected filteredTracks = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.tracks();
    return this.tracks().filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.artist.toLowerCase().includes(term),
    );
  });
}
