import { Injectable, NotFoundException } from '@nestjs/common';
import { ListResponseDto } from '../common/dto/list-response.dto';
import { FilmListDTO, ScheduleDTO } from './dto/films.dto';
import { FilmRepository } from '../repository/film-repository';

@Injectable()
export class FilmsService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async findAll(): Promise<ListResponseDto<FilmListDTO>> {
    const films = await this.filmRepository.findAll();

    const items = films.map((film) => ({
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags,
      title: film.title,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
    }));

    return {
      total: items.length,
      items,
    };
  }

  async scheduleByFilmId(id: string): Promise<ListResponseDto<ScheduleDTO>> {
    const filmById = await this.filmRepository.findById(id);
    if (!filmById) {
      throw new NotFoundException('Фильм не найден');
    }
    const schedule = filmById.schedule;

    const items = schedule.map((item) => ({
      id: item.id,
      daytime: item.daytime.toISOString(),
      hall: item.hall,
      rows: item.rows,
      seats: item.seats,
      price: item.price,
      taken: item.taken,
    }));

    return {
      total: schedule.length,
      items,
    };
  }
}
