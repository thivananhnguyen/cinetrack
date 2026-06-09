import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { form, FormField, required, min, max } from '@angular/forms/signals';
import { Track } from '../models/track';

@Component({
  selector: 'app-track-form',
  imports: [FormField],
  templateUrl: './track-form.html',
  styleUrl: './track-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackForm {
  addTrack = output<Track>();

  protected model = signal({ title: '', artist: '', rating: 5 });

  protected trackForm = form(this.model, (path) => {
    required(path.title, { message: 'Le titre est requis' });
    required(path.artist, { message: "L'artiste est requis" });
    min(path.rating, 0);
    max(path.rating, 10);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.trackForm().valid()) return;

    const data = this.model();
    const id = Date.now();
    const newTrack: Track = {
      id,
      title: data.title,
      artist: data.artist,
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
    this.trackForm().reset();
  }
}