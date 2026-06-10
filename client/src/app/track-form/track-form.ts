import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, min, max, pattern, minLength, maxLength } from '@angular/forms/signals';
import { Track } from '../models/track';
import { TrackService } from '../services/track';
import { AuthService } from '../services/auth';

const SAFE_TEXT = /^[\p{L}\p{N}\s'\-&.,:!?]+$/u;

@Component({
  selector: 'app-track-form',
  imports: [FormField, RouterLink],
  templateUrl: './track-form.html',
  styleUrl: './track-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackForm {
  trackId = input<number>();

  private trackService = inject(TrackService);
  private router = inject(Router);
  protected auth = inject(AuthService);

  protected isEditMode = computed(() => !!this.trackId());
  protected serverError = signal('');
  protected saving = signal(false);
  protected loading = signal(false);
  protected model = signal({ title: '', artist: '', rating: 5 });

  constructor() {
    effect(() => {
      const id = this.trackId();
      if (!id) return;
      this.loading.set(true);
      this.trackService.getTrack(id).subscribe({
        next: (track) => {
          this.model.set({ title: track.title, artist: track.artist, rating: track.rating });
          this.loading.set(false);
        },
        error: () => {
          this.serverError.set('Impossible de charger le morceau.');
          this.loading.set(false);
        },
      });
    });
  }

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
    if (!this.trackForm().valid() || this.saving()) return;

    const data = this.model();
    const title = data.title.trim();
    const artist = data.artist.trim();

    this.serverError.set('');
    this.saving.set(true);

    const id = this.trackId();

    if (id) {
      this.trackService.update(id, { title, artist, rating: data.rating }).subscribe({
        next: () => this.router.navigate(['/tracks', id]),
        error: (err) => {
          this.saving.set(false);
          this.serverError.set(
            err.status === 401
              ? 'Veuillez vous connecter pour modifier.'
              : 'Erreur lors de la modification.',
          );
        },
      });
    } else {
      const payload: Omit<Track, 'id'> = {
        title,
        artist,
        album: 'Single',
        genre: 'Unknown',
        durationSeconds: 200,
        year: new Date().getFullYear(),
        rating: data.rating,
        favorite: data.rating >= 9,
        coverUrl: `https://picsum.photos/seed/${Date.now()}/300`,
      };

      this.trackService.create(payload).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          this.saving.set(false);
          this.serverError.set(
            err.status === 401
              ? 'Veuillez vous connecter pour ajouter un morceau.'
              : 'Erreur lors de la création. Veuillez réessayer.',
          );
        },
      });
    }
  }
}