import {
  IsUUID,
  IsNumber,
  IsEmail,
  IsString,
  IsArray,
  ArrayMinSize,
  Min,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class OrderResultDto {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
  id: string;
}

export class CreateOrderDto {
  @IsUUID(4, { message: 'ID фильма должен быть UUID' })
  film: string;

  @IsUUID(4, { message: 'ID сеанса должен быть UUID' })
  session: string;

  @IsOptional()
  @IsDateString()
  daytime?: string;

  @IsNumber({}, { message: 'Ряд должен быть числом' })
  @Min(1, { message: 'Ряд не может быть меньше 1' })
  row: number;

  @IsNumber({}, { message: 'Место должно быть числом' })
  @Min(1, { message: 'Место не может быть меньше 1' })
  seat: number;

  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  price: number;
}

export class CreateOrderWithContactDataDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @IsString()
  phone: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Заказ должен содержать хотя бы один билет' })
  tickets: CreateOrderDto[];
}
