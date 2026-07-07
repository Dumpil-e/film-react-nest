import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { FilmRepository } from '../repository/film-repository';
import { NotFoundException } from '@nestjs/common';

describe('FilmsService', () => {
  let service: FilmsService;
  let repository: FilmRepository;

  const mockFilmRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: FilmRepository,
          useValue: mockFilmRepository,
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
    repository = module.get<FilmRepository>(FilmRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('должен вернуть маппнутый список фильмов', async () => {
      const mockFilms = [
        {
          id: '1',
          rating: 8.5,
          director: 'Nolan',
          tags: ['sci-fi'],
          title: 'Interstellar',
          about: 'Space',
          description: 'A team of explorers...',
          image: 'img.jpg',
          cover: 'cover.jpg',
          schedule: [],
        },
      ];
      mockFilmRepository.findAll.mockResolvedValue(mockFilms);

      const result = await service.findAll();

      expect(result.total).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        id: '1',
        rating: 8.5,
        director: 'Nolan',
        tags: ['sci-fi'],
        title: 'Interstellar',
        about: 'Space',
        description: 'A team of explorers...',
        image: 'img.jpg',
        cover: 'cover.jpg',
      });
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('scheduleByFilmId', () => {
    it('должен вернуть маппнутое расписание и конвертировать daytime в ISO', async () => {
      const filmId = '1';
      const mockFilm = {
        id: '1',
        schedule: [
          {
            id: 's1',
            daytime: '2026-07-07T10:00:00.000Z', // В БД хранится как строка
            hall: 1,
            rows: 10,
            seats: 10,
            price: 250.5,
            taken: ['1-1'],
          },
        ],
      };
      mockFilmRepository.findById.mockResolvedValue(mockFilm);

      const result = await service.scheduleByFilmId(filmId);

      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe('s1');
      // Проверяем, что сервис корректно вызывает toISOString()
      expect(result.items[0].daytime).toBe('2026-07-07T10:00:00.000Z');
      expect(result.items[0].price).toBe(250.5);
      expect(repository.findById).toHaveBeenCalledWith(filmId);
    });

    it('должен выбросить NotFoundException, если фильм не найден', async () => {
      const filmId = 'non-existent';
      mockFilmRepository.findById.mockResolvedValue(null);

      await expect(service.scheduleByFilmId(filmId)).rejects.toThrow(
        new NotFoundException('Фильм не найден'),
      );
      expect(repository.findById).toHaveBeenCalledWith(filmId);
    });
  });
});
