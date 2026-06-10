import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

const TOKEN_KEY = 'cinetrack.accessToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private tokenSignal = signal<string | null>(this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null);
  private userSignal = signal<AuthUser | null>(null);

  readonly isLoggedIn = computed(() => this.tokenSignal() !== null);
  readonly user = computed(() => this.userSignal());

  get token() {
    return this.tokenSignal();
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          this.tokenSignal.set(res.accessToken);
          this.userSignal.set(res.user);
          if (this.isBrowser) localStorage.setItem(TOKEN_KEY, res.accessToken);
        }),
      );
  }

  logout() {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
  }
}
