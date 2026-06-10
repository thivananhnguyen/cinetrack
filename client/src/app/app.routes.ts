import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./track-list/track-list').then(m => m.TrackList) },
  { path: 'search', loadComponent: () => import('./track-search/track-search').then(m => m.TrackSearch) },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'tracks/:trackId', loadComponent: () => import('./track-detail/track-detail').then(m => m.TrackDetail) },
  { path: 'tracks/:trackId/edit', loadComponent: () => import('./track-form/track-form').then(m => m.TrackForm) },
];
