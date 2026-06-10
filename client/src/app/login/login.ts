import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  protected email = signal('');
  protected password = signal('');
  protected error = signal('');
  protected loading = signal(false);
  protected emailTouched = signal(false);
  protected passwordTouched = signal(false);

  protected emailInvalid = computed(() => {
    const e = this.email().trim();
    return e.length > 0 && !this.EMAIL_REGEX.test(e);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    const emailClean = this.email().trim().toLowerCase();
    const password = this.password();

    if (!emailClean || !password) return;
    if (!this.EMAIL_REGEX.test(emailClean)) {
      this.error.set('Format d\'email invalide.');
      return;
    }

    this.error.set('');
    this.loading.set(true);

    this.auth.login(emailClean, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Email ou mot de passe incorrect.');
      },
    });
  }
}
