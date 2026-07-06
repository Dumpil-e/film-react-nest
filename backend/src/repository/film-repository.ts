import { FilmListDTO, FilmWithScheduleDTO } from '../films/dto/films.dto';

export abstract class FilmRepository {
  abstract findAll(): Promise<FilmListDTO[]>;
  abstract findById(id: string): Promise<FilmWithScheduleDTO | null>;
  abstract update(film: FilmWithScheduleDTO): Promise<FilmWithScheduleDTO>;
}
