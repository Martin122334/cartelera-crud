import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form!: FormGroup;
  isRegister = false;
  loading = false;
  submitted = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.buildForm();
    if (this.authService.isLoggedIn()) {
    this.router.navigate(['/movies']);
  }
}

  buildForm(): void {
    this.form = this.fb.group({
      name:     [''],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.form.controls; }

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.submitted = false;
    this.form.reset();
    if (this.isRegister) {
      this.f['name'].setValidators([Validators.required, Validators.minLength(2)]);
    } else {
      this.f['name'].clearValidators();
    }
    this.f['name'].updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;

    const action = this.isRegister
      ? this.authService.register(this.form.value)
      : this.authService.login(this.f['email'].value, this.f['password'].value);

    action.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.isRegister ? '¡Registro exitoso!' : '¡Bienvenido!',
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/movies']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Error al iniciar sesión';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    });
  }
}