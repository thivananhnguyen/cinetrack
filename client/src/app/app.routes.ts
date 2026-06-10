import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./track-list/track-list').then(m => m.TrackList) },
  { path: 'search', loadComponent: () => import('./track-search/track-search').then(m => m.TrackSearch) },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'tracks/new', canActivate: [authGuard],
    loadComponent: () => import('./track-form/track-form').then(m => m.TrackForm) },
  { path: 'tracks/:trackId', loadComponent: () => import('./track-detail/track-detail').then(m => m.TrackDetail) },
  { path: 'tracks/:trackId/edit', canActivate: [authGuard],
    loadComponent: () => import('./track-form/track-form').then(m => m.TrackForm) },
];
