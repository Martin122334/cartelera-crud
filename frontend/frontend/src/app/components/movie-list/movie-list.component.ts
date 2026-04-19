import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { Movie, GENRES } from '../../models/movie.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  genres = GENRES;
  selectedGenre = '';
  searchTerm = '';
  loading = false;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.movieService.getAll(this.selectedGenre, this.searchTerm).subscribe({
      next: (res) => { this.movies = res.data; this.loading = false; },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudieron cargar las películas', 'error');
      }
    });
  }

  onSearch(): void { this.loadMovies(); }
  onFilter(): void { this.loadMovies(); }

  confirmDelete(movie: Movie): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará "${movie.title}" de la cartelera`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.movieService.delete(movie.id!).subscribe({
          next: () => {
            Swal.fire('¡Eliminada!', 'La película fue removida de cartelera.', 'success');
            this.loadMovies();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la película', 'error')
        });
      }
    });
  }

  getRatingColor(rating: number): string {
    if (rating >= 7) return 'text-success';
    if (rating >= 5) return 'text-warning';
    return 'text-danger';
  }
}