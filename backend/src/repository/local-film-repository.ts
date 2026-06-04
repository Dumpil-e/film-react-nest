import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmRepository } from './film-repository';
import { FilmListDTO, FilmWithScheduleDTO } from '../films/dto/films.dto';
import * as fs from 'fs';
import * as path from 'path';

type RawFilmJson = FilmWithScheduleDTO;

@Injectable()
export class LocalFilmRepository extends FilmRepository {
  private films: FilmWithScheduleDTO[];

  constructor() {
    super();
    const filePath = path.join(
      __dirname,
      '../../test/mongodb_initial_stub.json',
    );

    const rawData: RawFilmJson[] = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    );
    this.films = rawData;
  }

  async findAll(): Promise<FilmListDTO[]> {
    return this.films.map(({ schedule: _schedule, ...rest }) => rest);
  }

  async findById(id: string): Promise<FilmWithScheduleDTO | null> {
    return this.films.find((f) => f.id === id) || null;
  }

  async update(filmDto: FilmWithScheduleDTO): Promise<FilmWithScheduleDTO> {
    const index = this.films.findIndex((f) => f.id === filmDto.id);

    if (index === -1) {
      throw new NotFoundException(`Фильм с ID ${filmDto.id} не найден`);
    }
    this.films[index] = filmDto;

    return filmDto;
  }
}
