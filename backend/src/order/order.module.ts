import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { FilmRepository } from '../repository/film-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { TypeOrmFilmRepository } from '../repository/typeorm-film-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Film, Schedule])],
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: FilmRepository, useClass: TypeOrmFilmRepository },
  ],
})
export class OrderModule {}
