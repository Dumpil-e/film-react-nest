import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { ListResponseDto } from '../common/dto/list-response.dto';
import { ScheduleDTO } from './dto/films.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  getFilms() {
    return this.filmsService.findAll();
  }

  @Get(`:id/schedule`)
  getScheduleByFilmId(
    @Param('id') id: string,
  ): Promise<ListResponseDto<ScheduleDTO>> {
    return this.filmsService.scheduleByFilmId(id);
  }
}
