import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TrackList } from './track-list/track-list';
import { TrackForm } from './track-form/track-form';
import { TrackService } from './services/track';
import { Track } from './models/track';

@Component({
  selector: 'app-root',
  imports: [TrackList, TrackForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private trackService = inject(TrackService);

  protected tracks = toSignal(this.trackService.getTracks(), {
    initialValue: [] as Track[],
  });
}
