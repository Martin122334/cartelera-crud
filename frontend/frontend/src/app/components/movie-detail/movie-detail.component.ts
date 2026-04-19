import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  movie?: Movie;
  loading = true;
  error = false;
  private sub!: Subscription;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Observable en lugar de snapshot — detecta navegación entre películas
    this.sub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id || isNaN(id)) {
        this.error = true;
        this.loading = false;
        return;
      }
      this.loadMovie(id);
    });
  }

  loadMovie(id: number): void {
    this.loading = true;
    this.error = false;
    this.movie = undefined;

    this.movieService.getOne(id).subscribe({
      next: (res) => {
        this.movie = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;  // sin alerta — muestra mensaje en pantalla
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  confirmDelete(): void {
    Swal.fire({
      title: '¿Eliminar película?',
      text: `"${this.movie?.title}" será removida de la cartelera`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.movieService.delete(this.movie!.id!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminada!',
              text: 'Película removida correctamente.',
              timer: 1500,
              showConfirmButton: false
            });
            this.router.navigate(['/movies']);
          },
          error: () => {
            this.error = true;
          }
        });
      }
    });
  }

  getRatingClass(rating: number): string {
    if (rating >= 7) return 'rating-high';
    if (rating >= 5) return 'rating-medium';
    return 'rating-low';
  }
}