import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Track } from '../models/track';
import { DurationFormatPipe } from '../pipes/duration-format-pipe';
import { HighlightFavorite } from '../directives/highlight-favorite';

@Component({
  selector: 'app-track-card',
  imports: [DurationFormatPipe, HighlightFavorite, RouterLink],
  templateUrl: './track-card.html',
  styleUrl: './track-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackCard {
  track = input.required<Track>();
  active = input(false);
  select = output<Track>();
}
