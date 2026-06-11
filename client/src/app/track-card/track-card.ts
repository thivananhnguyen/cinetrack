import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Track } from '../models/track';
import { DurationFormatPipe } from '../pipes/duration-format-pipe';
import { HighlightFavorite } from '../directives/highlight-favorite';
import { environment } from '../../environments/environment';

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
  favoriteActionEnabled = input(false);
  select = output<Track>();
  toggleFavorite = output<number>();
  protected favoritesEnabled = environment.features.favorites;

  protected onToggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleFavorite.emit(this.track().id);
  }
}
