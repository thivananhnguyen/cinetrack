// track-card.ts (enrichi)
import { Component, input, output } from '@angular/core';
import { Track } from '../models/track';

@Component({
  selector: 'app-track-card',
  templateUrl: './track-card.html',
  styleUrl: './track-card.css',
})
export class TrackCard {
  track = input.required<Track>();
  active = input(false);
  select = output<Track>();
}
