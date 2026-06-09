import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { form, FormField, required, min, max, pattern, minLength, maxLength } from '@angular/forms/signals';
import { Track } from '../models/track';

const SAFE_TEXT = /^[\p{L}\p{N}\s'\-&.,:!?]+$/u;

@Component({
  selector: 'app-track-form',
  imports: [FormField],
  templateUrl: './track-form.html',
  styleUrl: './track-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackForm {
  existingTracks = input<Track[]>([]);
  addTrack = output<Track>();

  protected duplicateError = signal(false);
  protected model = signal({ title: '', artist: '', rating: 5 });

  protected trackForm = form(this.model, (path) => {
    required(path.title, { message: 'Le titre est requis' });
    minLength(path.title, 2, { message: 'Minimum 2 caractères' });
    maxLength(path.title, 50, { message: 'Maximum 50 caractères' });
    pattern(path.title, SAFE_TEXT, { message: 'Caractères non autorisés' });
    required(path.artist, { message: "L'artiste est requis" });
    minLength(path.artist, 2, { message: 'Minimum 2 caractères' });
    maxLength(path.artist, 50, { message: 'Maximum 50 caractères' });
    pattern(path.artist, SAFE_TEXT, { message: 'Caractères non autorisés' });
    min(path.rating, 0);
    max(path.rating, 10);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.trackForm().valid()) return;

    const data = this.model();
    const title = data.title.trim();
    const artist = data.artist.trim();

    const isDuplicate = this.existingTracks().some(
      (t) =>
        t.title.toLowerCase() === title.toLowerCase() &&
        t.artist.toLowerCase() === artist.toLowerCase(),
    );

    if (isDuplicate) {
      this.duplicateError.set(true);
      return;
    }

    this.duplicateError.set(false);
    const id = Date.now();
    const newTrack: Track = {
      id,
      title,
      artist,
      album: 'Single',
      genre: 'Unknown',
      durationSeconds: 200,
      year: new Date().getFullYear(),
      rating: data.rating,
      favorite: data.rating >= 9,
      coverUrl: `https://picsum.photos/seed/${id}/300`,
    };

    this.addTrack.emit(newTrack);
    this.model.set({ title: '', artist: '', rating: 5 });
  }
}