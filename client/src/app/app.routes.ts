import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { environment } from '../environments/environment';

const favoritesRoute: Routes = environment.features.favorites
  ? [
      {
        path: 'favorites',
        canActivate: [authGuard],
        loadComponent: () => import('./favorites/favorites').then((m) => m.Favorites),
      },
    ]
  : [{ path: 'favorites', redirectTo: 'tracks', pathMatch: 'full' }];

export const routes: Routes = [
  { path: '', redirectTo: 'tracks', pathMatch: 'full' },
  { path: 'tracks', loadComponent: () => import('./track-list/track-list').then((m) => m.TrackList) },
  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
  {
    path: 'tracks/new',
    canActivate: [authGuard],
    loadComponent: () => import('./track-form/track-form').then((m) => m.TrackForm),
  },
  {
    path: 'tracks/:trackId',
    loadComponent: () => import('./track-detail/track-detail').then((m) => m.TrackDetail),
  },
  {
    path: 'tracks/:trackId/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./track-form/track-form').then((m) => m.TrackForm),
  },
  ...favoritesRoute,
];
