import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Film, FilmSchema } from './schemas/film.schema';
import { FilmRepository } from '../repository/film-repository';
import { MongoFilmRepository } from '../repository/mongo-film-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
  ],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    { provide: FilmRepository, useClass: MongoFilmRepository },
  ],
})
export class FilmsModule {}
