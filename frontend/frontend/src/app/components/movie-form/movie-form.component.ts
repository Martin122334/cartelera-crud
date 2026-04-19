import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { GENRES } from '../../models/movie.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './movie-form.component.html',
  styleUrls: ['./movie-form.component.scss']
})
export class MovieFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  genres = GENRES;
  isEdit = false;
  movieId?: number;
  loading = false;    // ← siempre empieza en FALSE
  submitted = false;
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // Usar observable en lugar de snapshot
    this.sub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const idNum = Number(idParam);

      // Solo editar si el id es un número válido mayor a 0
      if (idParam && !isNaN(idNum) && idNum > 0) {
        this.movieId = idNum;
        this.isEdit = true;
        this.loadMovie();
      } else {
        // Ruta nueva — resetear todo
        this.isEdit = false;
        this.movieId = undefined;
        this.loading = false;   // ← crítico
        this.submitted = false;
        this.form.reset();
      }
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      director:    ['', [Validators.required, Validators.minLength(2)]],
      genre:       ['', Validators.required],
      duration:    ['', [Validators.required, Validators.min(1), Validators.max(999)]],
      releaseDate: ['', Validators.required],
      rating:      ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      synopsis:    [''],
      imageUrl:    ['']
    });
  }

  get f() { return this.form.controls; }

  loadMovie(): void {
    this.loading = true;

    this.movieService.getOne(this.movieId!).subscribe({
      next: (res) => {
        const data = res.data;
        this.form.patchValue({
          title:       data.title,
          director:    data.director,
          genre:       data.genre,
          duration:    data.duration,
          releaseDate: data.releaseDate?.substring(0, 10),
          rating:      data.rating,
          synopsis:    data.synopsis || '',
          imageUrl:    data.imageUrl || ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar la película', 'error');
        this.router.navigate(['/movies']);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.'
      });
      return;
    }

    this.loading = true;

    const accion = this.isEdit
      ? this.movieService.update(this.movieId!, this.form.value)
      : this.movieService.create(this.form.value);

    accion.subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: res.message,
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/movies']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.errors?.map((e: any) => e.message).join('\n')
          || 'Error al guardar la película';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}