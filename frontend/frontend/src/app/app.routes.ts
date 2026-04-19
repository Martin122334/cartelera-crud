import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'movies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/movie-list/movie-list.component')
        .then(m => m.MovieListComponent)
  },
  {
    path: 'movies/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/movie-form/movie-form.component')
        .then(m => m.MovieFormComponent)
  },
  {
    path: 'movies/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/movie-form/movie-form.component')
        .then(m => m.MovieFormComponent)
  },
  {
    path: 'movies/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/movie-detail/movie-detail.component')
        .then(m => m.MovieDetailComponent)
  },
  { path: '**', redirectTo: 'login' }  
];