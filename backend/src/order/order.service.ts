import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrderDto, OrderResultDto } from './dto/order.dto';
import { ListResponseDto } from '../common/dto/list-response.dto';
import { FilmRepository } from '../repository/film-repository';

@Injectable()
export class OrderService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async createOrder(
    dtos: CreateOrderDto[],
  ): Promise<ListResponseDto<OrderResultDto>> {
    if (!dtos.length) {
      throw new BadRequestException('Список заказов пуст');
    }

    const film = await this.filmRepository.findById(dtos[0].film);
    if (film == null) {
      throw new NotFoundException('Фильм не найден');
    }

    const session = film.schedule.find((s) => s.id === dtos[0].session);
    if (!session) {
      throw new NotFoundException('Сеанс не найден');
    }

    const results: OrderResultDto[] = [];

    for (const dto of dtos) {
      // Запрещаем бронировать разные сеансы в одном запросе
      if (dto.film !== dtos[0].film || dto.session !== dtos[0].session) {
        throw new BadRequestException(
          'Все кресла должны относиться к одному сеансу',
        );
      }

      const seatKey = `${dto.row}:${dto.seat}`;

      if (session.taken.includes(seatKey)) {
        throw new ConflictException(`Место ${seatKey} уже занято`);
      }

      session.taken.push(seatKey);

      results.push({
        film: dto.film,
        session: dto.session,
        daytime: String(session.daytime),
        row: dto.row,
        seat: dto.seat,
        price: session.price,
        id: randomUUID(),
      });
    }

    await this.filmRepository.update(film);

    return {
      total: results.length,
      items: results,
    };
  }
}
