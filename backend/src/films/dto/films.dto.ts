import {
  IsString,
  IsNumber,
  IsArray,
  IsUUID,
  IsDateString,
  Min,
  Max,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class FilmListDTO {
  @IsUUID()
  id: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @IsString()
  @IsNotEmpty()
  director: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  about: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  image: string;

  @IsString()
  cover: string;
}

export class ScheduleDTO {
  @IsUUID()
  id: string;

  @IsDateString()
  daytime: string;

  @IsNumber()
  @Min(0)
  hall: number;

  @IsNumber()
  @Min(1)
  rows: number;

  @IsNumber()
  @Min(1)
  seats: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @IsString({ each: true })
  taken: string[];
}
