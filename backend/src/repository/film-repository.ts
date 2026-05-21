import { Film } from '../films/schemas/film.schema';

export abstract class FilmRepository {
  abstract findAll(): Promise<Film[]>;
  abstract findById(id: string): Promise<Film | null>;
  abstract update(film: Film): Promise<Film>;
}
