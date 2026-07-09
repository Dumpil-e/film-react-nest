import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { NotFoundException } from '@nestjs/common';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  // Создаем мок сервиса
  const mockFilmsService = {
    findAll: jest.fn(),
    scheduleByFilmId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определён', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /films', () => {
    it('должен вернуть список фильмов', async () => {
      const mockResult = {
        total: 1,
        items: [{ id: '1', title: 'Inception', rating: 8.8 }],
      };
      mockFilmsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.getFilms();

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /films/:id/schedule', () => {
    it('должен вернуть расписание для существующего фильма', async () => {
      const filmId = 'uuid-123';
      const mockResult = {
        total: 1,
        items: [{ id: 's1', daytime: '2026-07-07T10:00:00.000Z', hall: 1 }],
      };
      mockFilmsService.scheduleByFilmId.mockResolvedValue(mockResult);

      const result = await controller.getScheduleByFilmId(filmId);

      expect(result).toEqual(mockResult);
      expect(service.scheduleByFilmId).toHaveBeenCalledWith(filmId);
    });

    it('должен пробросить NotFoundException, если фильм не найден', async () => {
      const filmId = 'non-existent-uuid';
      mockFilmsService.scheduleByFilmId.mockRejectedValue(
        new NotFoundException('Фильм не найден'),
      );

      await expect(controller.getScheduleByFilmId(filmId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.scheduleByFilmId).toHaveBeenCalledWith(filmId);
    });
  });
});
