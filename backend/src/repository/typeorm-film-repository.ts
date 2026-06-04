import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmRepository } from './film-repository';
import { FilmListDTO, FilmWithScheduleDTO } from '../films/dto/films.dto';
import { Film } from '../films/entities/film.entity';

@Injectable()
export class TypeOrmFilmRepository extends FilmRepository {
  constructor(
    @InjectRepository(Film) private filmRepository: Repository<Film>,
  ) {
    super();
  }

  async findAll(): Promise<FilmListDTO[]> {
    const films = await this.filmRepository.find({
      order: { title: 'ASC' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return films.map(({ schedule, ...rest }) => rest);
  }

  async findById(id: string): Promise<FilmWithScheduleDTO | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
      order: {
        schedule: {
          daytime: 'ASC',
        },
      },
    });

    if (!film) {
      return null;
    }

    return {
      ...film,
      schedule: film.schedule.map((s) => ({
        ...s,
        taken: s.taken ? [...s.taken] : [],
      })),
    };
  }

  async update(filmDto: FilmWithScheduleDTO): Promise<FilmWithScheduleDTO> {
    const entity = await this.filmRepository.findOne({
      where: { id: filmDto.id },
      relations: ['schedule'],
    });

    if (!entity) {
      throw new NotFoundException(`Фильм с ID ${filmDto.id} не найден`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schedule, id, ...filmData } = filmDto;
    Object.assign(entity, filmData);

    filmDto.schedule.forEach((dtoSchedule) => {
      const entitySchedule = entity.schedule.find(
        (s) => s.id === dtoSchedule.id,
      );
      if (entitySchedule) {
        entitySchedule.taken = [...(dtoSchedule.taken || [])];
      }
    });

    await this.filmRepository.save(entity);

    const updatedFilm = await this.findById(filmDto.id);
    if (!updatedFilm) {
      throw new NotFoundException('Не найден фильм после обновления');
    }
    return updatedFilm;
  }
}
