import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto, CreateOrderWithContactDataDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /order', () => {
    const mockTicket: CreateOrderDto = {
      film: 'film-uuid-1',
      session: 'session-uuid-1',
      row: 1,
      seat: 1,
      price: 250,
    };

    const mockResult = {
      total: 1,
      items: [
        {
          id: 'order-uuid',
          ...mockTicket,
          daytime: '2026-07-07T10:00:00.000Z',
        },
      ],
    };

    it('должен передать массив билетов напрямую, если пришёл массив (как из Postman)', async () => {
      const body: CreateOrderDto[] = [mockTicket];
      mockOrderService.createOrder.mockResolvedValue(mockResult);

      const result = await controller.create(body);

      expect(result).toEqual(mockResult);
      expect(service.createOrder).toHaveBeenCalledWith(body);
    });

    it('должен извлечь tickets из объекта с контактными данными (как с фронтенда)', async () => {
      const body: CreateOrderWithContactDataDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [mockTicket],
      };
      mockOrderService.createOrder.mockResolvedValue(mockResult);

      const result = await controller.create(body);

      expect(result).toEqual(mockResult);
      // Важно: сервис должен получить именно массив tickets, а не весь объект
      expect(service.createOrder).toHaveBeenCalledWith(body.tickets);
      expect(service.createOrder).not.toHaveBeenCalledWith(body);
    });

    it('должен корректно обрабатывать пустой массив', async () => {
      const body: CreateOrderDto[] = [];
      mockOrderService.createOrder.mockResolvedValue({ total: 0, items: [] });

      const result = await controller.create(body);

      expect(result.total).toBe(0);
      expect(service.createOrder).toHaveBeenCalledWith([]);
    });
  });
});
