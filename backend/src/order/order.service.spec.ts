import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { FilmRepository } from '../repository/film-repository';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import * as crypto from 'crypto';

describe('OrderService', () => {
  let service: OrderService;
  let repository: FilmRepository;

  const mockFilmRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  // Фиксируем randomUUID для предсказуемости тестов
  const fixedUUID = 'fixed-uuid-1234-5678-9012-345678901234';
  let randomUUIDSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: FilmRepository,
          useValue: mockFilmRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repository = module.get<FilmRepository>(FilmRepository);

    randomUUIDSpy = jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue(
        fixedUUID as `${string}-${string}-${string}-${string}-${string}`,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
    randomUUIDSpy.mockRestore();
  });

  const createMockFilm = (schedule: Partial<Schedule>[] = []): Film => {
    const film = new Film();
    film.id = 'film-uuid-1';
    film.title = 'Test Film';
    film.rating = 8.0;
    film.director = 'Director';
    film.tags = [];
    film.image = 'img.jpg';
    film.cover = 'cover.jpg';
    film.about = 'About';
    film.description = 'Description';
    film.schedule = schedule.map((s) => {
      const scheduleEntity = new Schedule();
      Object.assign(scheduleEntity, {
        id: 'session-uuid-1',
        daytime: '2026-07-07T10:00:00.000Z',
        hall: 1,
        rows: 10,
        seats: 10,
        price: 250,
        taken: [],
        film: film,
        ...s,
      });
      return scheduleEntity;
    });
    return film;
  };

  const createMockDto = (
    overrides: Partial<CreateOrderDto> = {},
  ): CreateOrderDto => ({
    film: 'film-uuid-1',
    session: 'session-uuid-1',
    row: 1,
    seat: 1,
    price: 250,
    ...overrides,
  });

  describe('createOrder', () => {
    it('должен выбросить BadRequestException, если передан не массив', async () => {
      await expect(
        service.createOrder(null as unknown as CreateOrderDto[]),
      ).rejects.toThrow(BadRequestException);
    });

    it('должен выбросить BadRequestException, если массив пустой', async () => {
      await expect(service.createOrder([])).rejects.toThrow(
        new BadRequestException(
          'Список заказов пуст или имеет неверный формат',
        ),
      );
    });

    it('должен выбросить NotFoundException, если фильм не найден', async () => {
      mockFilmRepository.findById.mockResolvedValue(null);

      await expect(service.createOrder([createMockDto()])).rejects.toThrow(
        new NotFoundException('Фильм не найден'),
      );
    });

    it('должен выбросить NotFoundException, если сеанс не найден', async () => {
      const mockFilm = createMockFilm([]); // Фильм без сеансов
      mockFilmRepository.findById.mockResolvedValue(mockFilm);

      await expect(service.createOrder([createMockDto()])).rejects.toThrow(
        new NotFoundException('Сеанс не найден'),
      );
    });

    it('должен выбросить BadRequestException, если билеты относятся к разным фильмам', async () => {
      const mockFilm = createMockFilm([{ id: 'session-uuid-1', taken: [] }]);
      mockFilmRepository.findById.mockResolvedValue(mockFilm);

      const dtos: CreateOrderDto[] = [
        createMockDto({ film: 'film-uuid-1' }),
        createMockDto({ film: 'film-uuid-2' }), // Другой фильм
      ];

      await expect(service.createOrder(dtos)).rejects.toThrow(
        new BadRequestException('Все кресла должны относиться к одному сеансу'),
      );
    });

    it('должен выбросить BadRequestException, если билеты относятся к разным сеансам', async () => {
      const mockFilm = createMockFilm([{ id: 'session-uuid-1', taken: [] }]);
      mockFilmRepository.findById.mockResolvedValue(mockFilm);

      const dtos: CreateOrderDto[] = [
        createMockDto({ session: 'session-uuid-1' }),
        createMockDto({ session: 'session-uuid-2' }), // Другой сеанс
      ];

      await expect(service.createOrder(dtos)).rejects.toThrow(
        new BadRequestException('Все кресла должны относиться к одному сеансу'),
      );
    });

    it('должен выбросить ConflictException, если место уже занято', async () => {
      const mockFilm = createMockFilm([
        { id: 'session-uuid-1', taken: ['1:1'] }, // Место 1:1 уже занято
      ]);
      mockFilmRepository.findById.mockResolvedValue(mockFilm);

      const dto = createMockDto({ row: 1, seat: 1 });

      await expect(service.createOrder([dto])).rejects.toThrow(
        new ConflictException('Место 1:1 уже занято'),
      );
    });

    it('должен успешно создать заказ для одного билета', async () => {
      const mockFilm = createMockFilm([
        { id: 'session-uuid-1', taken: [], price: 300 },
      ]);
      mockFilmRepository.findById.mockResolvedValue(mockFilm);
      mockFilmRepository.update.mockResolvedValue(undefined);

      const dto = createMockDto({ price: undefined }); // Цена не передана
      const result = await service.createOrder([dto]);

      expect(result.total).toBe(1);
      expect(result.items[0]).toEqual({
        film: 'film-uuid-1',
        session: 'session-uuid-1',
        daytime: '2026-07-07T10:00:00.000Z',
        row: 1,
        seat: 1,
        price: 300, // Должна подтянуться из session.price
        id: fixedUUID,
      });

      // Проверяем, что место добавлено в taken
      expect(mockFilm.schedule[0].taken).toContain('1:1');

      // Проверяем, что фильм сохранён
      expect(repository.update).toHaveBeenCalledWith(mockFilm);
    });

    it('должен успешно создать заказ для нескольких билетов', async () => {
      const mockFilm = createMockFilm([{ id: 'session-uuid-1', taken: [] }]);
      mockFilmRepository.findById.mockResolvedValue(mockFilm);
      mockFilmRepository.update.mockResolvedValue(undefined);

      const dtos: CreateOrderDto[] = [
        createMockDto({ row: 1, seat: 1 }),
        createMockDto({ row: 1, seat: 2 }),
        createMockDto({ row: 2, seat: 1 }),
      ];

      const result = await service.createOrder(dtos);

      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(3);

      // Проверяем, что все места добавлены в taken
      expect(mockFilm.schedule[0].taken).toContain('1:1');
      expect(mockFilm.schedule[0].taken).toContain('1:2');
      expect(mockFilm.schedule[0].taken).toContain('2:1');

      expect(repository.update).toHaveBeenCalledTimes(1);
    });

    it('должен использовать dto.price, если она передана', async () => {
      const mockFilm = createMockFilm([
        { id: 'session-uuid-1', taken: [], price: 300 },
      ]);
      mockFilmRepository.findById.mockResolvedValue(mockFilm);
      mockFilmRepository.update.mockResolvedValue(undefined);

      const dto = createMockDto({ price: 500 }); // Явно передана цена
      const result = await service.createOrder([dto]);

      expect(result.items[0].price).toBe(500);
    });

    it('должен корректно обрабатывать случай, когда session.taken = null', async () => {
      const mockFilm = createMockFilm([
        { id: 'session-uuid-1', taken: null as unknown as string[] },
      ]);
      mockFilmRepository.findById.mockResolvedValue(mockFilm);
      mockFilmRepository.update.mockResolvedValue(undefined);

      const dto = createMockDto();
      const result = await service.createOrder([dto]);

      expect(result.total).toBe(1);
      // Проверяем, что массив taken был инициализирован
      expect(mockFilm.schedule[0].taken).toEqual(['1:1']);
    });
  });
});
