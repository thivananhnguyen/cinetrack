import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Track } from '../models/track';

@Component({
  selector: 'app-track-card',
  templateUrl: './track-card.html',
  styleUrl: './track-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackCard {
  track = input.required<Track>();
  active = input(false);
  select = output<Track>();
}
