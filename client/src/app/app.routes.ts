import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./track-list/track-list').then(m => m.TrackList) },
  { path: 'tracks/:trackId', loadComponent: () => import('./track-detail/track-detail').then(m => m.TrackDetail) },
];
