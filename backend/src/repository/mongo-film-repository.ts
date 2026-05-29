import { FilmRepository } from './film-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Film, FilmDocument } from '../films/schemas/film.schema';
import { Model } from 'mongoose';

@Injectable()
export class MongoFilmRepository extends FilmRepository {
  constructor(@InjectModel(Film.name) private FilmModel: Model<FilmDocument>) {
    super();
  }

  findAll(): Promise<Film[]> {
    return this.FilmModel.find().lean().exec();
  }

  findById(id: string): Promise<Film | null> {
    return this.FilmModel.findOne({ id }).lean().exec();
  }

  async update(film: Film): Promise<Film> {
    const updatedFilm = await this.FilmModel.findOneAndUpdate(
      { id: film.id },
      film,
      { new: true, lean: true, runValidators: true },
    ).exec();

    if (!updatedFilm) {
      throw new NotFoundException(`Фильм с id ${film.id} не найден`);
    }
    return updatedFilm;
  }
}
