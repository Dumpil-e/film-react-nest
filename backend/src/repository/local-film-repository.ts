import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmRepository } from './film-repository';
import { Film } from '../films/schemas/film.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalFilmRepository extends FilmRepository {
  private films: Film[];

  constructor() {
    super();

    const filePath = path.join(
      __dirname,
      '../../test/mongodb_initial_stub.json',
    );
    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    this.films = (rawData as any[]).map((film: any) => ({
      ...film,
      schedule: film.schedule.map((s: any) => ({
        ...s,
        daytime: new Date(s.daytime),
      })),
    }));
  }

  async findAll(): Promise<Film[]> {
    return this.films;
  }

  async findById(id: string): Promise<Film | null> {
    const film = this.films.find((f) => f.id === id);
    return film || null;
  }

  async update(film: Film): Promise<Film> {
    const index = this.films.findIndex((f) => f.id === film.id);
    if (index === -1) {
      throw new NotFoundException(`Фильм с id ${film.id} не найден`);
    }

    this.films[index] = film;
    return this.films[index];
  }
}
