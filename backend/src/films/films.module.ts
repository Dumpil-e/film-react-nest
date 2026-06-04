import { Module } from '@nestjs/common';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmRepository } from '../repository/film-repository';
import { TypeOrmFilmRepository } from '../repository/typeorm-film-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Film } from './entities/film.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Schedule])],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    { provide: FilmRepository, useClass: TypeOrmFilmRepository },
  ],
})
export class FilmsModule {}
