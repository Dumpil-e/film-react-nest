import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  CreateOrderWithContactDataDto,
  OrderResultDto,
} from './dto/order.dto';
import { ListResponseDto } from '../common/dto/list-response.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    // Делаем проверку на два приходящих тела. Как в postman и как во фронте с контактными данными
    @Body() body: CreateOrderDto[] | CreateOrderWithContactDataDto,
  ): Promise<ListResponseDto<OrderResultDto>> {
    const tickets = Array.isArray(body) ? body : body.tickets;
    return this.orderService.createOrder(tickets);
  }
}
