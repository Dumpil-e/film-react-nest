import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Film, FilmSchema } from '../films/schemas/film.schema';
import { FilmRepository } from '../repository/film-repository';
import { MongoFilmRepository } from '../repository/mongo-film-repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: FilmRepository, useClass: MongoFilmRepository },
  ],
})
export class OrderModule {}
