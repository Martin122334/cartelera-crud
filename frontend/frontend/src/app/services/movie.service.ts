import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private apiUrl = `${environment.apiUrl}/movies`;

  constructor(private http: HttpClient) {}

  getAll(genre?: string, search?: string): Observable<any> {
    let params = new HttpParams();
    if (genre) params = params.set('genre', genre);
    if (search) params = params.set('search', search);
    return this.http.get(this.apiUrl, { params });
  }

  getOne(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(movie: Movie): Observable<any> {
    return this.http.post(this.apiUrl, movie);
  }

  update(id: number, movie: Movie): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, movie);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}