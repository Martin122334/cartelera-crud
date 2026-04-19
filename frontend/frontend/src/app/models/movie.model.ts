export interface Movie {
  id?: number;
  title: string;
  director: string;
  genre: string;
  duration: number;
  releaseDate: string;
  rating: number;
  synopsis?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}

export const GENRES = [
  'Acción', 'Comedia', 'Drama', 'Terror',
  'Ciencia Ficción', 'Animación', 'Romance', 'Thriller'
];